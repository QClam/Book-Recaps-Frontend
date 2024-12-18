import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { routes } from "./routes";
import App from "./App";
import Login from "./Components/Auth/Login";
import RecapVersions from "./Components/Recaps/RecapVersions";
import UsersList from "./Components/Users/UsersList";
import WithdrawalList from "./Components/WithDrawal/WithdrawalList";
import AppealList from "./Components/Appeal/AppealList";
import ReportList from "./Components/Report/ReportList";
import Review from "./Components/Review/Review";
import ErrorRoute from "./Components/ErrorRoute";
import { sessionLoader } from "./data/loader/sessionLoader";
import Logout from "./Components/Auth/Logout";
import { loginAction } from "./data/action/loginAction";
import ProtectedRoute from "./Components/ProtectedRoute";
import MainLayout from "./Components/MainLayout";

export const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<App/>} errorElement={<ErrorRoute/>} loader={sessionLoader}>

    <Route path={routes.logout} element={<Logout/>}/>
    <Route path={routes.login} element={<Login/>} action={loginAction}/>

    <Route element={<ProtectedRoute/>}>
      <Route element={<MainLayout/>}>
        <Route path={routes.index} element={<RecapVersions/>}/>
        <Route path={routes.recaps} element={<RecapVersions/>}/>
        <Route path={routes.users} element={<UsersList/>}/>
        <Route path={routes.withdrawals} element={<WithdrawalList/>}/>
        <Route path={routes.appeals} element={<AppealList/>}/>
        <Route path={routes.reports} element={<ReportList/>}/>
        <Route path={routes.reviewVersion} element={<Review/>}/>
      </Route>
    </Route>
  </Route>
));
