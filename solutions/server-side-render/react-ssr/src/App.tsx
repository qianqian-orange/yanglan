import React from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router'

function Home() {
  return <h1>Home</h1>
}

function Account() {
  return <h1>Account</h1>
}

function App() {
  return (
    <BrowserRouter>
      <div>
        <ul>
          <li>
            <Link to='/'>home</Link>
          </li>
          <li>
            <Link to='/account'>account</Link>
          </li>
        </ul>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/account' element={<Account />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
