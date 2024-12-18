import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import Login from './Components/Auth/Login';
import ConfirmEmail from './Components/Auth/ConfirmEmail';
import Dashboard from './Components/Dashboard/Dashboard';
import BookList from './Components/Books/BookList';
import BookDetail from './Components/Books/BookDetail';

import Recaps from './Components/Recaps/Recaps';
import RecapDetail from './Components/Recaps/RecapDetail';

import PublisherList from './Components/Users/PublisherList';
import PublisherPayout from './Components/Publisher-Payout/PublisherPayout';
import CreatePublisherPayout from './Components/Publisher-Payout/CreatePublisherPayout';
import HistoryPublisherPayout from './Components/Publisher-Payout/HistoryPublisherPayout';
import DetailPublihserPayout from './Components/Publisher-Payout/DetailPublihserPayout';

import ContributorPayout from './Components/Contributor-Payout/ContributorPayout';
import HistoryContributorPayout from './Components/Contributor-Payout/HistoryContributorPayout';
import DetailContributorPayout from './Components/Contributor-Payout/DetailContributorPayout';
import CreateContributorPayout from './Components/Contributor-Payout/CreateContributorPayout';

import ContractsList from './Components/Contracts/ContractsList';
import ContractDetail from './Components/Contracts/ContractDetail';
import CreateContract from './Components/Contracts/CreateContract';
import Users from './Components/Users/Users';
import { routes } from "./routes";
import App from "./App";
import ErrorRoute from "./Components/ErrorRoute";
import { sessionLoader } from "./data/loader/sessionLoader";
import { loginAction } from "./data/action/loginAction";
import Logout from "./Components/Auth/Logout";
import ProtectedRoute from "./Components/ProtectedRoute";
import MainLayout from "./Components/MainLayout";

export const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<App/>} errorElement={<ErrorRoute/>} loader={sessionLoader}>

    <Route path={routes.logout} element={<Logout/>}/>
    <Route path={routes.login} element={<Login/>} action={loginAction}/>
    <Route path={routes.confirmEmail} element={<ConfirmEmail/>}/>


    <Route element={<ProtectedRoute/>}>
      <Route element={<MainLayout/>}>
        <Route path={routes.index} element={<Dashboard/>}/>
        <Route path={routes.dashboard} element={<Dashboard/>}/>
        <Route path={routes.users} element={<Users/>}/>
        <Route path={routes.recaps} element={<Recaps/>}/>
        <Route path={routes.recapDetail} element={<RecapDetail/>}/>

        <Route path={routes.publisherPayout} element={<PublisherPayout/>}/>
        <Route path={routes.publisherPayoutDetail} element={<DetailPublihserPayout/>}/>
        <Route path={routes.publisherPayoutCreate} element={<CreatePublisherPayout/>}/>
        <Route path={routes.publisherPayoutHistory} element={<HistoryPublisherPayout/>}/>

        <Route path={routes.contributorPayout} element={<ContributorPayout/>}/>
        <Route path={routes.contributorPayoutDetail} element={<DetailContributorPayout/>}/>
        <Route path={routes.contributorPayoutCreate} element={<CreateContributorPayout/>}/>
        <Route path={routes.contributorPayoutHistory} element={<HistoryContributorPayout/>}/>

        <Route path={routes.books} element={<BookList/>}/>
        <Route path={routes.bookDetail} element={<BookDetail/>}/>

        <Route path={routes.publishers} element={<PublisherList/>}/>

        <Route path={routes.contracts} element={<ContractsList/>}/>
        <Route path={routes.contractCreate} element={<CreateContract/>}/>
        <Route path={routes.contractDetail} element={<ContractDetail/>}/>
      </Route>
    </Route>
  </Route>
));
