import React from 'react'
import styled, { keyframes } from 'styled-components'
import normal_cat from '../src/assets/normal_cat.svg'
import fat_cat from '../src/assets/fat_cat.svg'
import { GROW_UP_AMOUNT_BOUNDARY } from './constants'

const CatPulse = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.06);
  }
`
const Root = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color: #f5f5f5; */
    height: calc(100vh - 42px);
`
const Cat = styled.img`
    position: absolute;
    left: translateX(100vw - 50%);
    bottom: 50px;
    transform: translateX(-50%);
    animation: ${CatPulse} 1.3s ease-in-out infinite alternate;

    opacity: ${({ $show }) => ($show ? 1 : 0)};
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease-in-out;
`
const NormalCat = styled(Cat).attrs({ src: normal_cat })`
    width: 340px;
    height: 219px;
    bottom: 180px;
`
const FatCat = styled(Cat).attrs({ src: fat_cat })`
    width: 765px;
    height: 491px;
`

const PageHome = ({ currentLiquidityAmount }) => {
    return (
        <Root>
            <NormalCat $show={currentLiquidityAmount <= GROW_UP_AMOUNT_BOUNDARY} />
            <FatCat $show={currentLiquidityAmount > GROW_UP_AMOUNT_BOUNDARY} />
        </Root>
    )
}

export default PageHome
