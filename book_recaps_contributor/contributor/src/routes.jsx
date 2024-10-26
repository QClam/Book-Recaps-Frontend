import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorPage from "./routes/ErrorPage";
import Login from "./routes/Login";
import { loginAction } from "./routes/actions/loginAction";
import AuthWrapper from "./routes/AuthWrapper";
import Logout from "./routes/Logout";

export const routes = {
  login: '/login',
  logout: '/logout',
  dashboard: '/',
  recaps: '/recaps',
  draftRecaps: '/recaps/draft',
  underRevisionRecaps: '/recaps/under-revision',
  rejectionsRecaps: '/recaps/rejected',
  publishedRecaps: '/recaps/published',
  createRecap: '/recaps/create',
  books: '/books',
  contact: '/contact',
  profile: '/profile',
  billingInvoices: '/billing-invoices',
}

export const router = createBrowserRouter([
  {
    path: routes.dashboard,
    errorElement: <ErrorPage/>,
    element: (
      <AuthWrapper>
        <App/>
      </AuthWrapper>
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
                element: <div>Recaps</div>,
              },
              {
                path: routes.draftRecaps,
                element: <div>Draft Recaps</div>
              },
              {
                path: routes.underRevisionRecaps,
                element: <div>Under Revision Recaps</div>
              },
              {
                path: routes.rejectionsRecaps,
                element: <div>Rejections Recaps</div>
              },
              {
                path: routes.publishedRecaps,
                element: <div>Published Recaps</div>
              },
              {
                path: routes.createRecap,
                element: <div>Create Recap</div>
              }
            ]
          },
        ]
      }
    ]
  },
  {
    path: routes.login,
    element: <Login/>,
    errorElement: <ErrorPage/>,
    action: loginAction,
  },
  {
    path: routes.logout,
    element: <Logout/>,
    errorElement: <ErrorPage/>,
  },
  // {
  //   path: '/register',
  //   element: <Register />,
  //   action: registerAction,
  // },
])
