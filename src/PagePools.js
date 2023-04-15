import { memo, useCallback, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { SYMBOL_USDC, SYMBOL_WETH, TAB_HOME } from './constants'
import cat_food from './assets/cat_food.svg'
import water_bowl from './assets/water_bowl.svg'

const Spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`

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
const FoodIcon = styled.img.attrs({ src: cat_food })`
    width: 24px;
    margin-right: 4px;
`
const WaterIcon = styled.img.attrs({ src: water_bowl })`
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
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 12px;
    width: 100%;
    height: 42px;
`
const Loader = styled.div`
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    width: 28px;
    height: 28px;
    animation: ${Spin} 2s linear infinite;
`

const PagePools = ({ isConnected, uniswapClient, navigateToHomeAndCheckLiquidityAmount }) => {
    const [foodType, setFoodType] = useState(null)
    const [foodAmount, setFoodAmount] = useState(0)
    const [waterType, setWaterType] = useState(null)
    const [waterAmount, setWaterAmount] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        setIsSubmitting(true)
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
        setIsSubmitting(false)
        navigateToHomeAndCheckLiquidityAmount()
    }, [foodAmount, foodType, navigateToHomeAndCheckLiquidityAmount, uniswapClient, waterAmount])

    const submitButton = useMemo(() => {
        return isConnected ? (
            <FeedButton variant="primary" disabled={!isInfoCompleted} onClick={handleAddLiquiditySubmit}>
                {isSubmitting ? <Loader/> : 'Go Feed!'}
            </FeedButton>
        ) : (
            <FeedButton variant="primary" disabled>
                Please Connect Wallet First
            </FeedButton>
        )
    }, [handleAddLiquiditySubmit, isConnected, isInfoCompleted, isSubmitting])

    return (
        <Root>
            <PoolsForm>
                <Header>Feed Your Cat!</Header>
                <Form.Group className="mb-3" controlId="formFood">
                    <ItemTittle>
                        <FoodIcon />
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
