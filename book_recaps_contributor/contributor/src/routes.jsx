import { createBrowserRouter, Outlet } from "react-router-dom";
import App from "./App";
import ErrorPage from "./routes/ErrorPage";
import Login from "./routes/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Logout from "./routes/Logout";
import Books, { booksLoader } from "./routes/Books";
import RecapVersion, { recapVersionLoader } from "./routes/recaps/RecapVersion";
import RecapDetails, { recapDetailsAction, recapDetailsLoader } from "./routes/recaps/RecapDetails";
import { sessionLoader } from "./routes/loaders/sessionLoader";
import MainLayout from "./layouts/MainLayout";
import { AuthProvider } from "./contexts/Auth";
import Recaps, { recapsAction, recapsLoader } from "./routes/recaps/Recaps";
import ReviewAppeals, { reviewAppealsLoader } from "./routes/ReviewAppeals";
import BookDetails, { bookDetailsLoader } from "./routes/BookDetails";

import { loginAction } from "./routes/actions/loginAction";
import { createRecapAction } from "./routes/actions/createRecapAction";

export const routes = {
  login: '/login',
  logout: '/logout',
  dashboard: '/',
  recaps: '/recaps',
  recapDetails: '/recaps/:recapId',
  createRecap: '/recaps/create',
  recapVersionDetails: '/recaps/versions/:versionId',
  keyIdea: '/key-idea',
  books: '/books',
  bookDetails: '/books/:bookId',
  contact: '/contact',
  profile: '/profile',
  billingInvoices: '/billing-invoices',
  appeals: '/appeals',
  reviewAppeals: '/reviews/:reviewId/appeals',
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
                    path: routes.createRecap,
                    element: <Books/>,
                    loader: booksLoader,
                    action: createRecapAction
                  },
                  {
                    path: routes.recapVersionDetails,
                    element: <RecapVersion/>,
                    loader: recapVersionLoader,
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
                    ]
                  },
                ]
              },
              {
                path: routes.reviewAppeals,
                loader: reviewAppealsLoader,
                element: <ReviewAppeals/>
              },
              {
                path: routes.books,
                children: [
                  {
                    index: true,
                    element: <Books/>,
                    loader: booksLoader,
                    action: createRecapAction
                  },
                  {
                    path: routes.bookDetails,
                    element: <BookDetails/>,
                    loader: bookDetailsLoader,
                    action: createRecapAction
                  }
                ]
              }
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
