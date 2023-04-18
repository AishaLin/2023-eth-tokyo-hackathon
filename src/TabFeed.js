import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import { SYMBOL_USDC, SYMBOL_WETH } from './constants'
import cat_food from './assets/cat_food.svg'
import water_bowl from './assets/water_bowl.svg'
import cat_paw from './assets/cat_paw.svg'
import logo from './assets/cat_logo.svg'

const Spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`

const Root = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const PoolsForm = styled(Form)`
    position: relative;
    margin-top: 20px;
    border: 1px solid rgba(152, 161, 192, 0.24);
    border-radius: 16px;
    padding: 0 16px 32px;
    box-shadow: 0 0 6px 0 rgba(152, 161, 192, 0.2);
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
const CatPaw = styled.img.attrs({ src: cat_paw })`
    display: inline-block;
    position: absolute;
    right: -50px;
    bottom: -20px;
    width: calc(477px * 0.3);
    height: calc(412px * 0.3);
    opacity: ${({ $show }) => ($show ? 0.9 : 0)};
    transform: rotate(-30deg) translate(-50%, -50%);
    transition: opacity 0.3s ease-in-out;
`
const Logo = styled.img.attrs({ src: logo })`
    margin-top: 32px;
    width: calc(312px * 0.5);
    height: calc(244px * 0.5);
`

const ItemContent = ({ onAmountChange, onSymbolSelect, currentSymbol, anotherSymbol }) => {
    return (
        <CurrencyWrapper>
            <AmountInput placeholder="amount" onChange={onAmountChange} />
            <TypeDropDown
                id="dropdown-button-dark-example2"
                variant={!!currentSymbol ? 'light' : 'secondary'}
                title={currentSymbol || 'TOKEN'}
                className="mb-1"
                onSelect={onSymbolSelect}
            >
                <Dropdown.Item
                    eventKey={SYMBOL_WETH}
                    active={currentSymbol === SYMBOL_WETH}
                    disabled={anotherSymbol === SYMBOL_WETH}
                >
                    WETH
                </Dropdown.Item>
                <Dropdown.Item
                    eventKey={SYMBOL_USDC}
                    active={currentSymbol === SYMBOL_USDC}
                    disabled={anotherSymbol === SYMBOL_USDC}
                >
                    USDC
                </Dropdown.Item>
            </TypeDropDown>
        </CurrencyWrapper>
    )
}

const TabFeed = ({ isConnected, uniswapClient, navigateToHomePage, getLiquidityAmount }) => {
    const [foodSymbol, setFoodType] = useState(null)
    const [foodAmount, setFoodAmount] = useState(0)
    const [waterSymbol, setWaterType] = useState(null)
    const [waterAmount, setWaterAmount] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitDone, setIsSubmitDone] = useState(false)
    const setTimeoutRef = useRef()

    const isInfoCompleted = useMemo(() => {
        return !!waterSymbol && !!waterAmount && !!foodSymbol && !!foodAmount
    }, [foodSymbol, foodAmount, waterSymbol, waterAmount])

    const handleFoodAmountChange = useCallback(e => {
        setFoodAmount(e.target.value)
    }, [])

    const handleFoodSymbolSelect = useCallback(eventKey => {
        setFoodType(eventKey)
    }, [])

    const handleWaterAmountChange = useCallback(e => {
        setWaterAmount(e.target.value)
    }, [])

    const handleWaterSymbolSelect = useCallback(eventKey => {
        setWaterType(eventKey)
    }, [])

    const handleAddLiquiditySubmit = useCallback(async () => {
        setIsSubmitting(true)
        let ethAmount
        let usdcAmount
        if (foodSymbol === SYMBOL_WETH) {
            ethAmount = foodAmount
            usdcAmount = waterAmount
        } else {
            ethAmount = waterAmount
            usdcAmount = foodAmount
        }
        await uniswapClient.addLiquidity(ethAmount, usdcAmount)
        getLiquidityAmount()
        setIsSubmitting(false)
        setIsSubmitDone(true)
        setTimeoutRef.current = setTimeout(() => navigateToHomePage(), 1300)
    }, [foodAmount, foodSymbol, getLiquidityAmount, navigateToHomePage, uniswapClient, waterAmount])

    const submitButton = useMemo(() => {
        return isConnected ? (
            <FeedButton variant="primary" disabled={!isInfoCompleted} onClick={handleAddLiquiditySubmit}>
                {isSubmitting ? <Loader /> : 'Go Feed!'}
            </FeedButton>
        ) : (
            <FeedButton variant="primary" disabled>
                Please Connect Wallet First
            </FeedButton>
        )
    }, [handleAddLiquiditySubmit, isConnected, isInfoCompleted, isSubmitting])

    useEffect(() => {
        return () => clearTimeout(setTimeoutRef.current)
    }, [])

    return (
        <Root>
            <Logo />
            <PoolsForm>
                <Header>Feed Your Cat!</Header>
                <Form.Group className="mb-3" controlId="formFood">
                    <ItemTittle>
                        <FoodIcon />
                        Food
                    </ItemTittle>
                    <ItemContent
                        onAmountChange={handleFoodAmountChange}
                        onSymbolSelect={handleFoodSymbolSelect}
                        currentSymbol={foodSymbol}
                        anotherSymbol={waterSymbol}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>
                        <WaterIcon />
                        Water
                    </Form.Label>
                    <ItemContent
                        onAmountChange={handleWaterAmountChange}
                        onSymbolSelect={handleWaterSymbolSelect}
                        currentSymbol={waterSymbol}
                        anotherSymbol={foodSymbol}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Text className="text-muted">
                        {isInfoCompleted
                            ? 'Go feed! your cat will grow up!'
                            : 'Choose currency as food and water, feed your cat.'}
                    </Form.Text>
                </Form.Group>
                {submitButton}
                <CatPaw $show={isSubmitDone} />
            </PoolsForm>
        </Root>
    )
}

export default memo(TabFeed)
