import { createBrowserRouter, Outlet } from "react-router-dom";
import App from "./App";
import ErrorPage from "./routes/ErrorPage";
import Login from "./routes/Login";
import { loginAction } from "./routes/actions/loginAction";
import ProtectedRoute from "./routes/ProtectedRoute";
import Logout from "./routes/Logout";
import CreateRecap, { booksLoader, createRecapAction } from "./routes/recaps/CreateRecap";
import RecapVersion, { recapVersionLoader } from "./routes/recaps/RecapVersion";
import RecapDetails, { recapDetailsAction, recapDetailsLoader } from "./routes/recaps/RecapDetails";
import { sessionLoader } from "./routes/loaders/sessionLoader";
import MainLayout from "./layouts/MainLayout";
import { AuthProvider } from "./contexts/Auth";
import Recaps, { recapsAction, recapsLoader } from "./routes/recaps/Recaps";

export const routes = {
  login: '/login',
  logout: '/logout',
  dashboard: '/',
  recaps: '/recaps',
  recapDetails: '/recaps/:recapId',
  createRecap: '/recaps-create',
  recapVersionDetails: '/recaps/:recapId/version/:versionId',
  keyIdea: '/key-idea',
  books: '/books',
  bookDetails: '/books/:bookId',
  contact: '/contact',
  profile: '/profile',
  billingInvoices: '/billing-invoices',
}

export const router = createBrowserRouter([
  {
    loader: sessionLoader,
    element: (
      <AuthProvider>
        <App/>
      </AuthProvider>
    ),
    errorElement: <ErrorPage/>,
    children: [
      {
        path: routes.dashboard,
        element: (
          <ProtectedRoute>
            <MainLayout>
              <Outlet/>
            </MainLayout>
          </ProtectedRoute>
        ),
        children: [
          {
            errorElement: <ErrorPage/>,
            children: [
              {
                index: true,
                element: <div>Dashboard</div>
              },
              {
                path: routes.recaps,
                children: [
                  {
                    index: true,
                    element: <Recaps/>,
                    loader: recapsLoader,
                    action: recapsAction
                  },
                  {
                    path: routes.recapDetails,
                    children: [
                      {
                        index: true,
                        element: <RecapDetails/>,
                        loader: recapDetailsLoader,
                        action: recapDetailsAction
                      },
                      {
                        path: routes.recapVersionDetails,
                        element: <RecapVersion/>,
                        loader: recapVersionLoader,
                      }
                    ]
                  },
                ]
              },
              {
                path: routes.createRecap,
                element: <CreateRecap/>,
                loader: booksLoader,
                action: createRecapAction
              },
            ]
          }
        ]
      },
      {
        path: routes.login,
        element: <Login/>,
        action: loginAction,
      },
      {
        path: routes.logout,
        element: <Logout/>,
      },
    ]
  },
])
