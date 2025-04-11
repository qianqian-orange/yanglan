import React from './libs'
import { hydrateRoot } from './libs/react-dom/client'
import App from './App'

hydrateRoot(document.getElementById('app'), <App />)

// import React from './libs'
// import { createRoot } from './libs/react-dom/client'
// import App from './App'

// const root = createRoot(document.querySelector('#app'))
// root.render(<App />)
