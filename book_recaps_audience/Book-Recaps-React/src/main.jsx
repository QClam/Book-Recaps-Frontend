import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ToastContainer } from "react-toastify";

import 'react-toastify/dist/ReactToastify.css'; // Đừng quên import CSS
import './index.css'
import './App.css';
import { router } from "./router";


const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <RouterProvider router={router}/>
      <ToastContainer/>
    </GoogleReCaptchaProvider>
  // </StrictMode>,
)
