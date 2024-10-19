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
  draftRecaps: '/draft-recaps',
  underRevisionRecaps: '/under-revision-recaps',
  rejectionsRecaps: '/rejections-recaps',
  publishedRecaps: '/published-recaps',
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
          }
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
