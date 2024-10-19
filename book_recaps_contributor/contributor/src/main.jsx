import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { AuthProvider } from "./contexts/Auth";

const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <AuthProvider>
        <RouterProvider router={router}/>
      </AuthProvider>
    </GoogleReCaptchaProvider>
  </StrictMode>,
)
