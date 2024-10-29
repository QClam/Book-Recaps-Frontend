import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorPage from "./routes/ErrorPage";
import Login from "./routes/Login";
import { loginAction } from "./routes/actions/loginAction";
import ProtectedRoute from "./routes/ProtectedRoute";
import Logout from "./routes/Logout";
import CreateRecap, { booksLoader, createRecapAction } from "./routes/recaps/CreateRecap";
import { AuthProvider, sessionLoader } from "./contexts/Auth";
import RecapVersion, { recapVersionLoader } from "./routes/recaps/RecapVersion";
import RecapDetails from "./routes/recaps/RecapDetails";

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
  contact: '/contact',
  profile: '/profile',
  billingInvoices: '/billing-invoices',
}

export const router = createBrowserRouter([
  {
    loader: sessionLoader,
    element: <AuthProvider/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: routes.dashboard,
        element: (
          <ProtectedRoute>
            <App/>
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
                    element: <div>Danh sách các Recaps</div>,
                  },
                  {
                    path: routes.recapDetails,
                    children: [
                      {
                        index: true,
                        element: <RecapDetails/>,
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
      // {
      //   path: '/register',
      //   element: <Register />,
      //   action: registerAction,
      // },
    ]
  },
])
