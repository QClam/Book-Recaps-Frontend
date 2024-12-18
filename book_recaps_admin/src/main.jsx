import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PrimeReactProvider } from "primereact/api";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { primeStyling } from "./primeStyling";
// import 'rsuite/dist/rsuite.min.css';
import './App.css'
import './index.css'
import { router } from "./router";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrimeReactProvider value={{ unstyled: true, pt: primeStyling }}>
      <RouterProvider router={router}/>
      <ToastContainer position="top-center" autoClose={1400} theme="colored" closeOnClick={true}/>
    </PrimeReactProvider>
  </StrictMode>,
)
