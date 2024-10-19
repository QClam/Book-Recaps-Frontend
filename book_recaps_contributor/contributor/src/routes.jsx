import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import ErrorPage from "./pages/ErrorPage";

export const routes = {
  login: '/login',
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
    element: <App/>,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: routes.dashboard,
        element: <div>Dashboard</div>
      }
    ]
  }
])
