import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Login from './component/Auth/Login';
import MainLayout from './component/Layout/MainLayout';
import BookList, { booksLoader } from './component/ListBook/BookList/BookList';
import Settings from './component/Setting/Settings';
import ContractDetail from './component/Contract/ContractDetail/ContractDetail';
import Dashboard from './component/Dashboard/Dashboard';
import Contracts from './component/Contract/Contract/NewContract';
import FetchPublisherData from './component/Publisher/Publisher';
import PublisherPayout from './component/Publisher/PublisherPayout';
import BookDetail, { bookDetailsLoader } from './component/Dashboard/BookDetail';
import Logout from "./component/Auth/Logout";
import ErrorRoute from "./component/ErrorRoute";
import App from "./App";
import ProtectedRoute from "./component/ProtectedRoute";

import { sessionLoader } from "./data/loader/sessionLoader";
import { loginAction } from "./data/action/loginAction";
import { routes } from "./routes";

export const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<App/>} errorElement={<ErrorRoute/>} loader={sessionLoader}>

    <Route path={routes.logout} element={<Logout/>}/>
    <Route path={routes.login} element={<Login/>} action={loginAction}/>

    <Route element={<ProtectedRoute/>}>
      <Route element={<MainLayout/>}>
        <Route path={routes.index} element={<Dashboard/>}/>
        <Route path={routes.books} element={<BookList/>} loader={booksLoader}/>
        <Route path={routes.bookDetails} element={<BookDetail/>} loader={bookDetailsLoader}/>
        <Route path={routes.contracts} element={<Contracts/>}/>
        <Route path={routes.contractDetails} element={<ContractDetail/>}/>
        <Route path={routes.payouts} element={<FetchPublisherData/>}/>

        <Route path={routes.payoutDetails} element={<PublisherPayout/>}/>
        <Route path={routes.settings} element={<Settings/>}/>
      </Route>
    </Route>
  </Route>
));
