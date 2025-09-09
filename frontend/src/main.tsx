import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './features/store.ts'
import App from './App.tsx'
import { MediaProvider } from './contexts/MediaContext'
import CurrentUser from './components/CurrentUser'
import './index.css'
import './i18n'

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <CurrentUser>
        <BrowserRouter>
          <MediaProvider>
            <App />
          </MediaProvider>
        </BrowserRouter>
      </CurrentUser>
    </Provider>
  </React.StrictMode>
);
