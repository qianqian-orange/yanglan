import React from './libs'
import App from './App'

function ServerRenderTemplate({
  bootstrapScripts,
}: {
  bootstrapScripts: string[]
}) {
  return (
    <html>
      <head>
        <title>react-ssr</title>
      </head>
      <body>
        <div id='app'>
          <App />
        </div>
        {bootstrapScripts.map(s => (
          <script key={s} src={s} defer></script>
        ))}
      </body>
    </html>
  )
}

export default ServerRenderTemplate
