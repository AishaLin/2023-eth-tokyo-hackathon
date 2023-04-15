import { memo, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { SYMBOL_USDC, SYMBOL_WETH, TAB_HOME } from './constants'
import food from './assets/chocolate_chip_cookie.png'
import water from './assets/service_water.png'

const Root = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
`
const PoolsForm = styled(Form)`
    margin-top: 100px;
    border: 1px solid rgba(152, 161, 192, 0.24);
    border-radius: 16px;
    padding: 0 16px 32px;
`
const Header = styled.div`
    display: flex;
    justify-content: center;
    padding: 20px 0;
    border-bottom: 1px solid rgba(152, 161, 192, 0.24);
    margin-bottom: 20px;
`
const ItemTittle = styled(Form.Label)`
    display: flex;
    align-items: center;
`
const CookieIcon = styled.img.attrs({ src: food })`
    width: 24px;
    margin-right: 4px;
`
const WaterIcon = styled.img.attrs({ src: water })`
    width: 24px;
    margin-right: 4px;
`
const CurrencyWrapper = styled.div`
    display: flex;
`
const AmountInput = styled(Form.Control)`
    margin-right: 12px;
    width: 321px;
`
const TypeDropDown = styled(DropdownButton)`
    button {
        min-width: 85px;
        display: inline-block;
    }
`
const FeedButton = styled(Button)`
    margin-top: 12px;
    width: 100%;
`

const PagePools = ({ isConnected, uniswapClient, handleTabChange }) => {
    const [foodType, setFoodType] = useState(null)
    const [foodAmount, setFoodAmount] = useState(0)
    const [waterType, setWaterType] = useState(null)
    const [waterAmount, setWaterAmount] = useState(0)

    const isInfoCompleted = useMemo(() => {
        return !!waterType && !!waterAmount && !!foodType && !!foodAmount
    }, [foodType, foodAmount, waterType, waterAmount])

    const handleFoodAmountInput = useCallback(e => {
        setFoodAmount(e.target.value)
    }, [])

    const handleFoodSymbolSelect = useCallback(eventKey => {
        setFoodType(eventKey)
    }, [])

    const handleWaterAmountInput = useCallback(e => {
        setWaterAmount(e.target.value)
    }, [])

    const handleWaterSymbolSelect = useCallback(eventKey => {
        setWaterType(eventKey)
    }, [])

    const handleAddLiquiditySubmit = useCallback(async () => {
        let ethAmount
        let usdcAmount
        if (foodType === SYMBOL_WETH) {
            ethAmount = foodAmount
            usdcAmount = waterAmount
        } else {
            ethAmount = waterAmount
            usdcAmount = foodAmount
        }
        await uniswapClient.addLiquidity(ethAmount, usdcAmount)
        handleTabChange(TAB_HOME)
    }, [foodAmount, foodType, handleTabChange, uniswapClient, waterAmount])

    const submitButton = useMemo(() => {
        return isConnected ? (
            <FeedButton variant="primary" disabled={!isInfoCompleted} onClick={handleAddLiquiditySubmit}>
                Go Feed!
            </FeedButton>
        ) : (
            <FeedButton variant="primary" disabled>
                Please Connect Wallet First
            </FeedButton>
        )
    }, [handleAddLiquiditySubmit, isConnected, isInfoCompleted])

    return (
        <Root>
            <PoolsForm>
                <Header>Feed Your Cat!</Header>
                <Form.Group className="mb-3" controlId="formFood">
                    <ItemTittle>
                        <CookieIcon />
                        Food
                    </ItemTittle>
                    <CurrencyWrapper>
                        <AmountInput placeholder="amount" onChange={handleFoodAmountInput} />
                        <TypeDropDown
                            id="dropdown-button-dark-example2"
                            variant={!!foodType ? 'light' : 'secondary'}
                            title={foodType || 'type'}
                            className="mb-1"
                            onSelect={handleFoodSymbolSelect}
                        >
                            <Dropdown.Item
                                eventKey={SYMBOL_WETH}
                                active={foodType === SYMBOL_WETH}
                                disabled={waterType === SYMBOL_WETH}
                            >
                                WETH
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey={SYMBOL_USDC}
                                active={foodType === SYMBOL_USDC}
                                disabled={waterType === SYMBOL_USDC}
                            >
                                USDC
                            </Dropdown.Item>
                        </TypeDropDown>
                    </CurrencyWrapper>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>
                        <WaterIcon />
                        Water
                    </Form.Label>
                    <CurrencyWrapper>
                        <AmountInput placeholder="amount" onChange={handleWaterAmountInput} />
                        <TypeDropDown
                            id="dropdown-button-dark-example2"
                            variant={!!waterType ? 'light' : 'secondary'}
                            title={waterType || 'type'}
                            className="mb-1"
                            onSelect={handleWaterSymbolSelect}
                        >
                            <Dropdown.Item
                                eventKey={SYMBOL_WETH}
                                active={waterType === SYMBOL_WETH}
                                disabled={foodType === SYMBOL_WETH}
                            >
                                WETH
                            </Dropdown.Item>
                            <Dropdown.Item
                                eventKey={SYMBOL_USDC}
                                active={waterType === SYMBOL_USDC}
                                disabled={foodType === SYMBOL_USDC}
                            >
                                USDC
                            </Dropdown.Item>
                        </TypeDropDown>
                    </CurrencyWrapper>
                </Form.Group>
                <Form.Group>
                    <Form.Text className="text-muted">
                        {isInfoCompleted
                            ? 'Go feed! your cat will grow up!'
                            : 'Choose currency as food and water, feed your cat.'}
                    </Form.Text>
                </Form.Group>
                {submitButton}
            </PoolsForm>
        </Root>
    )
}

export default memo(PagePools)
