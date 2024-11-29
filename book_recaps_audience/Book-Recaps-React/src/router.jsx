import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import Explore from './Components/Explore/Explore';
import BookFree from './Components/TodayFreeRead/BookFree';
import Settings from './Components/Setting/Settings';
import MainLayout from './Components/Layout/MainLayout';
import Application from "./Components/Setting/Application/Application";
import AuthorBy from "./Components/Space/AuthorBy";
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
import UsRecapDetail, {
  bookDetailLoader
} from "./Components/ReadListenBook/UserRecap/UserRecapNewDetail/UsRecapDetail";
import RecapNewTues from "./Components/ReadListenBook/UserRecap/UserRecapNewDetail/RecapNewTues";
import History from "./Components/History/History";
import Homepage, { homepageLoader } from "./Components/Home/Homepage";
import SubscriptionHistory from "./Components/Setting/SubcriptionHistory/SubcriptionHistory";
import ErrorRoute from "./Components/ErrorRoute";
import { sessionLoader } from "./data/loaders/sessionLoader";
import Logout from "./Components/Auth/Logout";
import App from "./App";
import { routes } from "./routes";
import ProtectedRoute from "./Components/ProtectedRoute";

export const router = createBrowserRouter(createRoutesFromElements(
  <Route element={<App/>} errorElement={<ErrorRoute/>} loader={sessionLoader}>

    <Route path={routes.logout} element={<Logout/>}/>

    {/* Route không có header */}
    <Route element={<ProtectedRoute/>}>
      <Route path={routes.onboarding} element={<OnboardingStepper/>}/>
    </Route>

    {/* Route có header */}
    <Route element={<MainLayout/>}>
      <Route path={routes.login} element={<Login/>}/>
      <Route path={routes.forgetPassword} element={<ForgetPassword/>}/>

      {/* ko cần đăng nhập */}
      <Route path={routes.index} element={<Homepage/>} loader={homepageLoader}/>
      <Route path={routes.explore} element={<Explore/>}/>

      <Route path={routes.categories} element={<ExploreCategory/>}/>
      <Route path={routes.categoryDetail} element={<BookListCategory/>}/>

      <Route path={routes.authors} element={<AuthorBy/>}/>
      <Route path={routes.authorBooks} element={<AuthorBookApi/>}/>

      {/* Book details - recaps */}
      <Route path={routes.bookDetail} element={<UsRecapDetail/>} loader={bookDetailLoader}/>
      <Route path={routes.books} element={<BookFree/>}/>

      {/* RecapVersion detail - Audio player */}
      <Route path={routes.recapPlayer} element={<RecapNewTues/>}/>

      <Route path={routes.billing} element={<Billing/>}/>
      <Route path={routes.billingResult} element={<Result/>}/>
      <Route path={routes.confirmEmail} element={<ConfirmEmail/>}/>


      {/* Cần đăng nhập trước */}
      <Route element={<ProtectedRoute/>}>
        <Route path={routes.playlist} element={<LibraryBook/>}/>
        <Route path={routes.viewHistory} element={<History/>}/>
        <Route path={routes.supportTickets} element={<Application/>}/>
        <Route path={routes.subscriptionHistory} element={<SubscriptionHistory/>}/>
        <Route path={routes.becomeContributor} element={<ContributorTerm/>}/>
        <Route path={routes.profileSettings} element={<Settings/>}/>
      </Route>

      {/*<Route path={routes.authorDetailProfile} element={<AuthorDetailProfile/>}/>*/}
      {/*<Route path={routes.authorsByCategory} element={<AuthorGenersDetail/>}/>*/}
      {/*<Route path={routes.contributor} element={<RecapByContributor/>}/>*/}
      {/* <Route path="/contributor-recaps/:userId" element={<ContributorRecaps />} /> */}
    </Route>

    {/*<Route path="/help" element={<Report/>}/>*/}
  </Route>
));
