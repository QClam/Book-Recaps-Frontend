import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Overview from './component/Overview/Overview';
import Login from './component/Auth/Login';
import MainLayout from './component/Layout/MainLayout';
import BookList from './component/ListBook/BookList/BookList';
import Settings from './component/Setting/Settings';
import AddBook from './component/ListBook/AddBook/AddBook';
import ContractDetail from './component/Contract/ContractDetail/ContractDetail';
import Dashboard from './component/Dashboard/Dashboard';
import Contract from './component/Contract/Contract/NewContract';
import FetchPublisherData from './component/Publisher/Publisher';
import PublisherPayout from './component/Publisher/PublisherPayout';
import UpdateBook from './component/ListBook/UpdateBook/UpdateBook';
import DashboardDetail from './component/Dashboard/DashboardDetail';
import BookListDetail from './component/ListBook/BookList/BookListDetail';
import 'rsuite/dist/rsuite.min.css';
import BookPayout from './component/Publisher/BookPayout';
import App from "./App";
import ErrorRoute from "./component/ErrorRoute";
import { sessionLoader } from "./data/loader/sessionLoader";
import { routes } from "./routes";
import Logout from "./component/Auth/Logout";
import ProtectedRoute from "./component/ProtectedRoute";
import { loginAction } from "./data/action/loginAction";

export const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<App/>} errorElement={<ErrorRoute/>} loader={sessionLoader}>

    <Route path={routes.logout} element={<Logout/>}/>
    <Route path={routes.login} element={<Login/>} action={loginAction}/>

    <Route element={<ProtectedRoute/>}>
      <Route element={<MainLayout/>}>
        <Route path="/" element={<Overview/>}/>
        <Route path="/contractmanager" element={<Contract/>}/>
        <Route path="/contract-detail/:id" element={<ContractDetail/>}/>
        <Route path="/bookmanager" element={<BookList/>}/>
        <Route path="/book-detail/:bookId" element={<BookListDetail/>}/>
        <Route path="/addbook" element={<AddBook/>}/>
        <Route path="/updatebook/:id" element={<UpdateBook/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/settings" element={<Settings/>}/>
        <Route path="/publisher-payout" element={<FetchPublisherData/>}/>
        <Route path="/publisher-payout-detail/:id" element={<PublisherPayout/>}/>
        <Route path="/book-dashboard/:bookId" element={<DashboardDetail/>}/>
        <Route path="/book-payout/:bookId" element={<BookPayout/>}/>
      </Route>
    </Route>
  </Route>
));
