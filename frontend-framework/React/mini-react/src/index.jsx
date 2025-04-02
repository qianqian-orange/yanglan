import React, { hydrateRoot } from './libs'
import App from './App'

hydrateRoot(document.getElementById('app'), <App />)

// import React, { createRoot } from './libs'
// import App from './App'

// const root = createRoot(document.querySelector('#app'))
// root.render(<App />)
