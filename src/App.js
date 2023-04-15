import { useCallback, useEffect, useMemo, useState } from 'react'
import Nav from 'react-bootstrap/Nav'
import styled from 'styled-components'
import { TAB_HOME, TAB_POOLS } from './constants'
import PageHome from './PageHome'
import PagePools from './PagePools'
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
    const [currentEventKey, setCurrentEventKey] = useState(TAB_HOME)
    const [address, setAddress] = useState(null)

    const handleTabSelect = useCallback(eventKey => {
        setCurrentEventKey(eventKey)
    }, [])

    const getAddress = useCallback(async () => {
        const connectedAddress = await uniswapClient.getAddress()
        setAddress(connectedAddress)
    }, [uniswapClient])

    const handleConnectWallet = useCallback(async () => {
        await uniswapClient.connect()
        await getAddress()
    }, [getAddress, uniswapClient])

    useEffect(() => {
        getAddress()
    }, [getAddress])

    return (
        <Root>
            <Nav variant="tabs" defaultActiveKey={TAB_HOME} onSelect={handleTabSelect}>
                <Nav.Item>
                    <Nav.Link eventKey={TAB_HOME}>Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={TAB_POOLS}>Pools</Nav.Link>
                </Nav.Item>
                <ConnectButton onClick={handleConnectWallet}>{address || 'Connect Wallet'}</ConnectButton>
            </Nav>
            {currentEventKey === TAB_HOME && <PageHome />}
            {currentEventKey === TAB_POOLS && <PagePools isConnected={!!address} />}
        </Root>
    )
}

export default App
