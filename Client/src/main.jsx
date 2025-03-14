import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Provider} from 'react-redux'
import {BrowserRouter as Router } from 'react-router-dom'
import Userstore from './Store/Userstore.jsx'
createRoot(document.getElementById('root')).render(

    <Provider store={Userstore}>
    <Router>
    <App />
    </Router>
    </Provider>
 
)
