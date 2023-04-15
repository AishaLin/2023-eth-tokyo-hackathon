import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { MintOptions, nearestUsableTick, NonfungiblePositionManager, Pool, Position } from '@uniswap/v3-sdk'
import { BigNumber, constants, ethers } from 'ethers'
import JSBI from 'jsbi'

import {
    ERC20_ABI,
    NONFUNGIBLE_POSITION_MANAGER_ABI,
    NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
    POOL_ADDRESS,
    USDC_TOKEN,
    WETH_TOKEN,
} from './constants'

interface PoolInfo {
    token0: string
    token1: string
    fee: number
    tickSpacing: number
    sqrtPriceX96: ethers.BigNumber
    liquidity: ethers.BigNumber
    tick: number
}

interface PositionInfo {
    tickLower: number
    tickUpper: number
    liquidity: BigNumber
    feeGrowthInside0LastX128: BigNumber
    feeGrowthInside1LastX128: BigNumber
    tokensOwed0: BigNumber
    tokensOwed1: BigNumber
}

export class UniswapClient {
    private readonly provider = new ethers.providers.Web3Provider(window.ethereum)

    get signer() {
        return this.provider.getSigner()
    }

    async connect() {
        return window.ethereum.enable()
    }

    async getAddress() {
        return this.signer.getAddress()
    }

    async addLiquidity(ethAmount: number, usdcAmount: number) {
        const usdcCurrencyAmount = CurrencyAmount.fromRawAmount(USDC_TOKEN, this.fromReadableAmount(usdcAmount, 6))
        const wethCurrencyAmount = CurrencyAmount.fromRawAmount(WETH_TOKEN, this.fromReadableAmount(ethAmount, 18))
        const { pool, poolInfo } = await this.getPool()
        const positionToMint = Position.fromAmounts({
            pool,
            tickLower: nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) - poolInfo.tickSpacing * 2,
            tickUpper: nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) + poolInfo.tickSpacing * 2,
            amount0: usdcCurrencyAmount.quotient,
            amount1: wethCurrencyAmount.quotient,
            useFullPrecision: true,
        })
        const address = await this.getAddress()
        const mintOptions: MintOptions = {
            recipient: address,
            deadline: Math.floor(Date.now() / 1000) + 60 * 20,
            slippageTolerance: new Percent(50, 10_000),
        }
        const { calldata, value } = NonfungiblePositionManager.addCallParameters(positionToMint, mintOptions)
        const transaction = {
            data: calldata,
            to: NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
            value: value,
            from: address,
            //maxFeePerGas: MAX_FEE_PER_GAS,
            //maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS,
        }
        const tx = await this.signer.sendTransaction(transaction)
        const receipt = await tx.wait()
        console.log(receipt.transactionHash)
        return
    }

    async getLiquidityAmount() {
        const positionIds = await this.getPositionIds()
        const positionInfos = await Promise.all(positionIds.map(tokenId => this.getPositionInfo(tokenId)))
        const { pool, poolInfo } = await this.getPool()
        let totalUsdc = 0
        let totalWeth = 0
        for (const positionInfo of positionInfos) {
            if (positionInfo.liquidity.isZero()) {
                continue
            }
            const position = new Position({
                pool,
                tickLower: positionInfo.tickLower,
                tickUpper: positionInfo.tickUpper,
                liquidity: positionInfo.liquidity.toString(),
            })
            totalUsdc += +position.amount0.toExact()
            totalWeth += +position.amount1.toExact()
        }
        const wethPrice = 1 / this.tickToPrice(poolInfo.tick)
        console.log({ wethPrice, totalWeth, totalUsdc })
        return totalWeth * wethPrice + totalUsdc
    }

    async approve(token: Token) {
        const address = await this.getAddress()
        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, this.provider)
        const transaction = await tokenContract.populateTransaction.approve(
            NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
            constants.MaxInt256,
        )
        const tx = await this.signer.sendTransaction({ ...transaction, from: address })
        const receipt = await tx.wait()
        console.log(receipt.transactionHash)
        return
    }

    private async getPool() {
        const poolInfo = await this.getPoolInfo()
        return {
            pool: new Pool(
                USDC_TOKEN,
                WETH_TOKEN,
                poolInfo.fee,
                poolInfo.sqrtPriceX96.toString(),
                poolInfo.liquidity.toString(),
                poolInfo.tick,
            ),
            poolInfo,
        }
    }

    private async getPositionIds(): Promise<number[]> {
        const address = await this.getAddress()
        const positionContract = new ethers.Contract(
            NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
            NONFUNGIBLE_POSITION_MANAGER_ABI,
            this.provider,
        )
        const balance: number = await positionContract.balanceOf(address)
        const tokenIds = []
        for (let i = 0; i < balance; i++) {
            const tokenOfOwnerByIndex: number = await positionContract.tokenOfOwnerByIndex(address, i)
            tokenIds.push(tokenOfOwnerByIndex)
        }
        return tokenIds
    }

    private async getPositionInfo(tokenId: number): Promise<PositionInfo> {
        const positionContract = new ethers.Contract(
            NONFUNGIBLE_POSITION_MANAGER_CONTRACT_ADDRESS,
            NONFUNGIBLE_POSITION_MANAGER_ABI,
            this.provider,
        )
        const position = await positionContract.positions(tokenId)
        return {
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
            liquidity: position.liquidity,
            feeGrowthInside0LastX128: position.feeGrowthInside0LastX128,
            feeGrowthInside1LastX128: position.feeGrowthInside1LastX128,
            tokensOwed0: position.tokensOwed0,
            tokensOwed1: position.tokensOwed1,
        }
    }

    private async getPoolInfo(): Promise<PoolInfo> {
        const poolContract = new ethers.Contract(POOL_ADDRESS, IUniswapV3PoolABI.abi, this.provider)
        const [token0, token1, fee, tickSpacing, liquidity, slot0] = await Promise.all([
            poolContract.token0(),
            poolContract.token1(),
            poolContract.fee(),
            poolContract.tickSpacing(),
            poolContract.liquidity(),
            poolContract.slot0(),
        ])
        return {
            token0,
            token1,
            fee,
            tickSpacing,
            liquidity,
            sqrtPriceX96: slot0.sqrtPriceX96,
            tick: slot0.tick,
        }
    }

    private fromReadableAmount(amount: number, decimals: number): JSBI {
        const extraDigits = Math.pow(10, this.countDecimals(amount))
        const adjustedAmount = amount * extraDigits
        return JSBI.divide(
            JSBI.multiply(JSBI.BigInt(adjustedAmount), JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals))),
            JSBI.BigInt(extraDigits),
        )
    }

    private countDecimals(x: number) {
        if (Math.floor(x) === x) {
            return 0
        }
        return x.toString().split('.')[1].length || 0
    }

    private tickToPrice(tick: number): number {
        return Math.pow(1.0001, tick) / Math.pow(10, 12)
    }
}
