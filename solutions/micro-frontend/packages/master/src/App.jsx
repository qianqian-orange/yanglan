import React from 'react'

function App() {
  return (
    <div>
      <h1>Master</h1>
      <ul>
        <li onClick={() => history.pushState(null, '', '/home')}>home</li>
        <li onClick={() => history.pushState(null, '', '/account')}>account</li>
      </ul>
      <div id='subapp' />
    </div>
  )
}

export default App
