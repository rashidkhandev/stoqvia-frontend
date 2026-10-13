import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LangProvider } from './context/LangContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ProductsProvider } from './context/ProductsContext.jsx'
import { SuppliersProvider } from './context/SuppliersContext.jsx'
import { CustomersProvider } from './context/CustomersContext.jsx'
import { ExpensesProvider } from './context/ExpensesContext.jsx'
import { SalesProvider } from './context/SalesContext.jsx'
import { UsersProvider } from './context/UsersContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { BranchProvider } from './context/BranchContext.jsx'
import { OnlineStatusProvider } from './context/OnlineStatusContext.jsx'
import './index.css'

// Registers the service worker built by vite-plugin-pwa so the app shell
// (JS/CSS/fonts) is actually cached for offline use, not just simulated.
if ('serviceWorker' in navigator) {
  import('virtual:pwa-register').then(({ registerSW }) => {
    registerSW({ immediate: true })
  }).catch(() => {
    // dev mode or unsupported — safe to ignore
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <OnlineStatusProvider>
          <LangProvider>
            <AuthProvider>
              <BranchProvider>
                <SettingsProvider>
                  <ProductsProvider>
                    <SuppliersProvider>
                      <CustomersProvider>
                        <ExpensesProvider>
                          <SalesProvider>
                            <UsersProvider>
                              <App />
                            </UsersProvider>
                          </SalesProvider>
                        </ExpensesProvider>
                      </CustomersProvider>
                    </SuppliersProvider>
                  </ProductsProvider>
                </SettingsProvider>
              </BranchProvider>
            </AuthProvider>
          </LangProvider>
        </OnlineStatusProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)
