import React from 'react';
import { HashRouter, Link, Route, Routes } from 'react-router-dom'
import styled from 'styled-components'
import PageHome from './PageHome'
import PagePools from './PagePools'

const Nav = styled.div``
const ContentWrapper = styled.div``

const App = () => {
  return (
    <HashRouter >
      <Nav>
        <Link to='/pools'>Pools</Link>
      </Nav>
    <ContentWrapper>
      <Routes>
          <Route path="/" element={PageHome} />
          <Route path="/pools" element={PagePools} />
      </Routes>
    </ContentWrapper>
</HashRouter>
  );
}

export default App;
