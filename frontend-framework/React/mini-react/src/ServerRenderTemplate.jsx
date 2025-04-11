import React from './libs'
import App from './App'

function ServerRenderTemplate() {
  return (
    <html>
      <head>
        <title>react-ssr</title>
      </head>
      <body>
        <div id='app'>
          <App />
        </div>
      </body>
    </html>
  )
}

export default ServerRenderTemplate
