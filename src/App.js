import { useCallback, useEffect, useMemo, useState } from 'react'
import Nav from 'react-bootstrap/Nav'
import styled from 'styled-components'
import { TAB_HOME, TAB_FEED } from './constants'
import PageHome from './TabHome'
import TabFeed from './TabFeed'
import { UniswapClient } from './utils/uniswap-client'

const Root = styled.div``
const ConnectButton = styled.div`
    color: #797979;
    border: 1px solid #a5a6a5;
    border-radius: 20px;
    height: 30px;
    margin: auto 10px auto auto;
    padding: 5px 10px;
    font-size: 12px;
    height: fit-content;
    cursor: pointer;
    :hover {
        background-color: #e0e5eb;
    }
`

const App = () => {
    const uniswapClient = useMemo(() => new UniswapClient(), [])
    const [tab, setTab] = useState(TAB_HOME)
    const [address, setAddress] = useState(null)
    const [currentLiquidityAmount, setCurrentLiquidityAmount] = useState()

    const handleTabChange = useCallback(eventKey => {
        setTab(eventKey)
    }, [])

    const getLiquidityAmount = useCallback(async () => {
        const liquidityAmount = await uniswapClient.getLiquidityAmount()
        setCurrentLiquidityAmount(liquidityAmount)
    }, [uniswapClient])

    const navigateToHomePage = useCallback(() => {
        setTab(TAB_HOME)
    }, [])

    const getAddress = useCallback(async () => {
        const connectedAddress = await uniswapClient.getAddress()
        setAddress(connectedAddress)
    }, [uniswapClient])

    const checkConnectStatus = useCallback(async () => {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts?.length) {
            await getAddress()
        }
    }, [getAddress])

    const handleConnectWallet = useCallback(async () => {
        await uniswapClient.connect()
        await getAddress()
    }, [getAddress, uniswapClient])

    useEffect(() => {
        checkConnectStatus()
    }, [checkConnectStatus])

    useEffect(() => {
        getLiquidityAmount()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <Root>
            <Nav variant="tabs" defaultActiveKey={TAB_HOME} onSelect={handleTabChange}>
                <Nav.Item>
                    <Nav.Link eventKey={TAB_HOME}>Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={TAB_FEED}>Feed</Nav.Link>
                </Nav.Item>
                <ConnectButton onClick={handleConnectWallet}>{address || 'Connect Wallet'}</ConnectButton>
            </Nav>
            {tab === TAB_HOME && <PageHome currentLiquidityAmount={currentLiquidityAmount} />}
            {tab === TAB_FEED && (
                <TabFeed
                    isConnected={!!address}
                    uniswapClient={uniswapClient}
                    navigateToHomePage={navigateToHomePage}
                    handleConnectWallet={handleConnectWallet}
                    getLiquidityAmount={getLiquidityAmount}
                />
            )}
        </Root>
    )
}

export default App
