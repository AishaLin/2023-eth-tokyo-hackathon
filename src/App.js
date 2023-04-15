import { useCallback, useState } from 'react'
import Nav from 'react-bootstrap/Nav'
import styled from 'styled-components'
import { TAB_HOME, TAB_POOLS } from './constants'
import PageHome from './PageHome'
import PagePools from './PagePools'

const Root = styled.div``

const App = () => {
    const [currentEventKey, setCurrentEventKey] = useState(TAB_HOME)
    const handleTabSelect = useCallback(eventKey => {
        setCurrentEventKey(eventKey)
    }, [])
    return (
        <Root>
            <Nav justify variant="tabs" defaultActiveKey={TAB_HOME} onSelect={handleTabSelect}>
                <Nav.Item>
                    <Nav.Link eventKey={TAB_HOME}>Home</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey={TAB_POOLS}>Pools</Nav.Link>
                </Nav.Item>
            </Nav>
            {currentEventKey === TAB_HOME && <PageHome />}
            {currentEventKey === TAB_POOLS && <PagePools />}
        </Root>
    )
}

export default App
