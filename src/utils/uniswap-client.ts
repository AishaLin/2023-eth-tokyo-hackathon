import { CurrencyAmount } from '@uniswap/sdk-core'
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import { nearestUsableTick, Pool, Position } from '@uniswap/v3-sdk'
import { ethers } from 'ethers'
import JSBI from 'jsbi'

import { POOL_ADDRESS, USDC_TOKEN, WETH_TOKEN } from './constants'

interface PoolInfo {
    token0: string
    token1: string
    fee: number
    tickSpacing: number
    sqrtPriceX96: ethers.BigNumber
    liquidity: ethers.BigNumber
    tick: number
}

export class UniswapClient {
    private readonly provider = new ethers.providers.Web3Provider(window.ethereum)

    async connect() {
        return window.ethereum.enable()
    }

    async getAddress() {
        const signer = this.provider.getSigner()
        return signer.getAddress()
    }

    async addLiquidity(ethAmount: number, usdcAmount: number) {
        const poolInfo = await this.getPoolInfo()
        console.log(poolInfo)
        const pool = new Pool(
            WETH_TOKEN,
            USDC_TOKEN,
            poolInfo.fee,
            poolInfo.sqrtPriceX96.toString(),
            poolInfo.liquidity.toString(),
            poolInfo.tick,
        )
        const wethCurrencyAmount = CurrencyAmount.fromRawAmount(WETH_TOKEN, this.fromReadableAmount(ethAmount, 18))
        const usdcCurrencyAmount = CurrencyAmount.fromRawAmount(USDC_TOKEN, this.fromReadableAmount(ethAmount, 6))
        return Position.fromAmounts({
            pool,
            tickLower: nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) - poolInfo.tickSpacing * 2,
            tickUpper: nearestUsableTick(poolInfo.tick, poolInfo.tickSpacing) + poolInfo.tickSpacing * 2,
            amount0: wethCurrencyAmount.quotient,
            amount1: usdcCurrencyAmount.quotient,
            useFullPrecision: true,
        })
    }

    async getLiquidityAmount() {
        return 0
    }

    // TODO: get token approval

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
            sqrtPriceX96: slot0[0],
            tick: slot0[1],
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
}
