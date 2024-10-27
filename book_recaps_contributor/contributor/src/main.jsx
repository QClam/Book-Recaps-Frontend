import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import 'primeicons/primeicons.css';

import { router } from "./routes";

const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <PrimeReactProvider value={{}}>
        <RouterProvider router={router}/>
      </PrimeReactProvider>
    </GoogleReCaptchaProvider>
  </StrictMode>,
)
