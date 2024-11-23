import { AuthProvider } from "./contexts/Auth";
import { Outlet } from "react-router-dom";

const App = () => {
  return (
    <AuthProvider>
      <Outlet/>
    </AuthProvider>
  )
}

export default App