import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import Explore from './Components/Explore/Explore';
import BookFree from './Components/TodayFreeRead/BookFree';
import Settings from './Components/Setting/Settings';
import MainLayout from './Components/Layout/MainLayout';
import SearchResults from "./Components/Search/SearchResults/SearchResults";
import Application from "./Components/Setting/Application/Application";
import AuthorBy from "./Components/Space/AuthorBy";
import AuthorDetailProfile from "./Components/Space/AuthorDetailProfile/AuthorDetailProfile";
import AuthorGenersDetail from "./Components/Space/AuthorGenersDetail/AuthorGenersDetail";
import Billing from "./Components/Setting/Billing/Billing";
import LibraryBook from "./Components/Library/LibraryBook";
import ExploreCategory from "./Components/Explore/ExploreCategory";
import Login from "./Components/Auth/Login";
import BookListCategory from "./Components/Explore/BookApiCategory/BookListCategory/BookListCategory";
import AuthorBookApi from "./Components/Space/AuthorApi/AuthorBookApi/AuthorBookApi";
import ConfirmEmail from "./Components/Auth/ConfirmEmail";
import ForgetPassword from "./Components/Auth/ForgetPassword";
import ContributorTerm from "./Components/Setting/BecomeContributor/ContributorTerm";
import Result from "./Components/Setting/Billing/Result/Result";
import OnboardingStepper from "./Components/Onboarding/OnboardML/Onboarding";
import UsRecapDetail from "./Components/ReadListenBook/UserRecap/UserRecapNewDetail/UsRecapDetail";
import RecapNewTues from "./Components/ReadListenBook/UserRecap/UserRecapNewDetail/RecapNewTues";
import History from "./Components/History/History";
import Homepage from "./Components/Home/Homepage";
import SubscriptionHistory from "./Components/Setting/SubcriptionHistory/SubcriptionHistory";
import ErrorRoute from "./Components/ErrorRoute";
import { sessionLoader } from "./data/loaders/sessionLoader";
import Logout from "./Components/Auth/Logout";
import App from "./App";
import { routes } from "./routes";



export const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<App/>} errorElement={<ErrorRoute/>} loader={sessionLoader}>

    <Route path={routes.login} element={<Login/>}/>
    <Route path={routes.logout} element={<Logout/>}/>

    <Route element={<MainLayout/>}>

      <Route path={routes.index} element={<Homepage/>}/>
      <Route path={routes.explore} element={<Explore/>}/>
      <Route path={routes.searchResults} element={<SearchResults/>}/>

      <Route path={routes.categories} element={<ExploreCategory/>}/>
      <Route path={routes.category} element={<BookListCategory/>}/>

      <Route path={routes.author} element={<AuthorBy/>}/>
      <Route path={routes.authorBook} element={<AuthorBookApi/>}/>
      <Route path={routes.authorDetailProfile} element={<AuthorDetailProfile/>}/>
      <Route path={routes.authorsByCategory} element={<AuthorGenersDetail/>}/>

      {/* Contributor Item */}
      {/*<Route path={routes.contributor} element={<RecapByContributor/>}/>*/}
      {/* <Route path="/contributor-recaps/:userId" element={<ContributorRecaps />} /> */}

      {/* Book details - recaps */}
      <Route path={routes.book} element={<UsRecapDetail/>}/>
      <Route path={routes.books} element={<BookFree/>}/>

      {/* RecapVersion detail - Audio player */}
      <Route path={routes.recapPlayer} element={<RecapNewTues/>}/>

      <Route path={routes.playlist} element={<LibraryBook/>}/>
      <Route path={routes.viewHistory} element={<History/>}/>
    </Route>

    {/* Route không có sidebar */}

    {/* ko cần đăng nhập */}
    <Route path={routes.confirmEmail} element={<ConfirmEmail/>}/>
    <Route path={routes.billing} element={<Billing/>}/>
    <Route path={routes.billingResult} element={<Result/>}/>

    {/*<Route path="/help" element={<Report/>}/>*/}

    {/* Cần đăng nhập trước */}
    <Route path={routes.supportTickets} element={<Application/>}/>
    <Route path={routes.profileSettings} element={<Settings/>}/>
    <Route path={routes.subscriptionHistory} element={<SubscriptionHistory/>}/>
    <Route path={routes.onboarding} element={<OnboardingStepper/>}/>
    <Route path={routes.forgetPassword} element={<ForgetPassword/>}/>
    <Route path={routes.becomeContributor} element={<ContributorTerm/>}/>
  </Route>
));
