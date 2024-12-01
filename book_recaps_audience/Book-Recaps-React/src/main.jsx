import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { ToastContainer } from "react-toastify";
import { PrimeReactProvider } from "primereact/api";

import 'react-toastify/dist/ReactToastify.css'; // Đừng quên import CSS
import './index.css'
import './App.css';
import { router } from "./router";
import { primeStyling } from "./primeStyling";

const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <PrimeReactProvider value={{ unstyled: true, pt: primeStyling }}>
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <RouterProvider router={router}/>
      <ToastContainer position="top-center" autoClose={2500} theme="colored" closeOnClick={true}/>
    </GoogleReCaptchaProvider>
  </PrimeReactProvider>,
  // </StrictMode>,
)
