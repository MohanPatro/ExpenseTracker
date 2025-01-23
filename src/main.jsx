import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(

    <GoogleOAuthProvider clientId="35506741792-ldlpto8mblkdh46d2uljpemultiruard.apps.googleusercontent.com">
    <App />
    </GoogleOAuthProvider>

)
