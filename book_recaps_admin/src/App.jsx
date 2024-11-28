import './App.css'
import 'rsuite/dist/rsuite.min.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

import Sidebar from './Components/Sidebar/Sidebar';
import Login from './Components/Auth/Login';
import PrivateRoute from './Components/Auth/PrivateRoute';
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

function App() {

    const location = useLocation();
    const isLoginPage = location.pathname === "/auth" || location.pathname === "/auth/confirm-email";

    return (
        <main>
            {!isLoginPage && <Sidebar />}
            <Routes>
                <Route path="/" element={<PrivateRoute> <Dashboard /> </PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /> </PrivateRoute>} />

                <Route path="/users" element={<PrivateRoute> <Users /> </PrivateRoute>} />

                <Route path="/recaps" element={<PrivateRoute> <Recaps /> </PrivateRoute>} />
                <Route path="/recap/:id" element={<PrivateRoute> <RecapDetail /> </PrivateRoute>} />
                
                <Route path="/publisher-payout" element={<PrivateRoute><PublisherPayout /> </PrivateRoute>} />
                <Route path="/publisher-payout-detail/:id" element={<PrivateRoute><DetailPublihserPayout /> </PrivateRoute>} />
                <Route path="/publisher-payout-create/:id" element={<PrivateRoute><CreatePublisherPayout /> </PrivateRoute>} />
                <Route path="/publisher-payout-history/:historyId" element={<PrivateRoute><HistoryPublisherPayout /> </PrivateRoute>} />

                <Route path="/contributor-payout" element={<PrivateRoute><ContributorPayout /> </PrivateRoute>} />
                <Route path="/contributor-payout-detail/:id" element={<PrivateRoute><DetailContributorPayout /> </PrivateRoute>} />
                <Route path="/contributor-payout-create/:id" element={<PrivateRoute><CreateContributorPayout /> </PrivateRoute>} />
                <Route path="/contributor-payout-history/:historyId" element={<PrivateRoute><HistoryContributorPayout /></PrivateRoute>} />

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
