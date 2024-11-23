import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { PrimeReactProvider } from "primereact/api";
// import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import 'primeicons/primeicons.css';

import { router } from "./routes";
import { ToastProvider } from "./contexts/Toast";

// const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*<GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>*/}
      <PrimeReactProvider value={{}}>
        <ToastProvider>
          <RouterProvider router={router}/>
        </ToastProvider>
      </PrimeReactProvider>
    {/*</GoogleReCaptchaProvider>*/}
  </StrictMode>,
)
