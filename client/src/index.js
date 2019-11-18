import React from 'react'
import ReactDOM from 'react-dom'

// import Keycloak from 'keycloak-js'
import { Provider } from 'react-redux'
import store from './store/configureStore'

import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
)
serviceWorker.register()

// keycloak init options
// const initOptions = {
//   url: 'http://key.zeinetsse.com/auth',
//   realm: 'zeinetsse',
//   clientId: 'mainflux_admin',
//   onLoad: 'login-required',
// }

// const keycloak = Keycloak(initOptions)

// keycloak.init({ onLoad: initOptions.onLoad }).success((auth) => {
//   if (!auth) {
//     window.location.reload()
//   } else {
//     console.info('Authenticated')
//   }

//   // React Render
//   ReactDOM.render(<App />, document.getElementById('root'))

//   localStorage.setItem('react-token', keycloak.token)
//   localStorage.setItem('react-refresh-token', keycloak.refreshToken)

//   setTimeout(() => {
//     keycloak.updateToken(70).success((refreshed) => {
//       if (refreshed) {
//         console.debug(`Token refreshed${refreshed}`)
//       } else {
//         console.warn(`Token not refreshed, valid for ${
//           Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000)
//         } seconds`)
//       }
//     }).error(() => {
//       console.error('Failed to refresh token')
//     })
//   }, 60000)
// }).error(() => {
//   console.error('Authenticated Failed')
// })
