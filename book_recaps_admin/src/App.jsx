import './App.css'
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import Sidebar from './Components/Sidebar/Sidebar';
import UsersList from './Components/Users/UserList';
import Login from './Components/Auth/Login';
import PrivateRoute from './Components/Auth/PrivateRoute';
import ConfirmEmail from './Components/Auth/ConfirmEmail';
import Dashboard from './Components/Dashboard/Dashboard';
import BookList from './Components/Books/BookList';
import BookDetail from './Components/Books/BookDetail';

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

function App() {

    const location = useLocation();
    const isLoginPage = location.pathname === "/auth" || location.pathname === "/auth/confirm-email";

    return (
        <main>
            {!isLoginPage && <Sidebar />}
            <Routes>
                <Route path="/" element={<PrivateRoute> <UsersList /> </PrivateRoute>} />
                <Route path="/users" element={<PrivateRoute> <UsersList /> </PrivateRoute>} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/publisher-payout" element={<PublisherPayout />} />
                <Route path="/publisher-payout-detail/:id" element={<DetailPublihserPayout />} />
                <Route path="/publisher-payout-create/:id" element={<CreatePublisherPayout />} />
                <Route path="/publisher-payout-history/:historyId" element={<HistoryPublisherPayout />} />
                <Route path="/contributor-payout" element={<ContributorPayout />} />
                <Route path="/contributor-payout-detail/:id" element={<DetailContributorPayout />} />
                <Route path="/contributor-payout-create/:id" element={<CreateContributorPayout />} />
                <Route path="/contributor-payout-history/:historyId" element={<HistoryContributorPayout />} />
                <Route path="/books" element={<PrivateRoute> <BookList /> </PrivateRoute>} />
                <Route path="/book/:id" element={<PrivateRoute> <BookDetail /> </PrivateRoute>} />
                <Route path="/publishsers" element={<PrivateRoute> <PublisherList /> </PrivateRoute>} />
                <Route path="/contracts" element={<PrivateRoute> <ContractsList /> </PrivateRoute>} />
                <Route path="/contract/create" element={<PrivateRoute> <CreateContract /> </PrivateRoute>} />
                <Route path="/contract/:contractId" element={<PrivateRoute> <ContractDetail /> </PrivateRoute>} />
                <Route path="/auth" element={<Login />} />
                <Route path="/auth/confirm-email" element={<ConfirmEmail />} />
            </Routes>
        </main>
    )
}

function AppWrapper() {
    const recaptchaKey = import.meta.env.VITE_RECAPTCHA_KEY;
    return (
        <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
            <Router>
                <App />
            </Router>
        </GoogleReCaptchaProvider>
    )
}

export default AppWrapper
