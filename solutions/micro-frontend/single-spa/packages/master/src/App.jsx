import React from 'react'

function App() {
  return (
    <div>
      {/* 顶部菜单栏 */}
      <header>
        <h1>Master</h1>
      </header>
      <div>
        {/* 左侧导航栏 */}
        <nav>
          <ul>
            <li onClick={() => history.pushState(null, '', '/home')}>home</li>
            <li onClick={() => history.pushState(null, '', '/account')}>
              account
            </li>
          </ul>
        </nav>
        {/* 主内容 */}
        <main>
          <div id='subapp' />
        </main>
      </div>
    </div>
  )
}

export default App
