import './App.css'
import { Outlet, useSearchParams } from "react-router-dom";
import { useToast } from "./contexts/Toast";
import { useEffect } from "react";

function App() {
  const { showToast } = useToast();
  const [ searchParams ] = useSearchParams();

  const errorMessage = searchParams.get('error')

  useEffect(() => {
    console.log('searchParams', searchParams);
    // Show toast when there is ?error query param
    if (errorMessage) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });
    }
  }, [ errorMessage ]);

  return <Outlet/>
}

export default App
