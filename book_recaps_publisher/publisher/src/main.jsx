import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from "primereact/api";
import { RouterProvider } from "react-router-dom";

import './index.css'
import { router } from "./router";
import { ToastProvider } from "./contexts/Toast";
import { primeStyling } from "./primeStyling";

createRoot(document.getElementById('root')).render(
  <PrimeReactProvider value={{ unstyled: true, pt: primeStyling }}>
    <ToastProvider>
      <RouterProvider router={router}/>
    </ToastProvider>
  </PrimeReactProvider>,
)
