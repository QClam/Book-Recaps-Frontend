import { isRouteErrorResponse, Navigate, useRouteError } from 'react-router-dom';
import { routes } from "../routes";

function ErrorBoundary() {
  const error = useRouteError();

  console.error(error);

  const renderContent = () => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 401) {
        return <Navigate to={routes.logout} replace={true}/>;
      }
      if (error.status === 404) {
        return (
          <>
            <h1 className="text-6xl font-bold">404</h1>
            <p className="text-xl mt-4">Page Not Found</p>
          </>
        );
      }
      if (error.status === 500) {
        return (
          <>
            <h1 className="text-6xl font-bold">500</h1>
            <p className="text-xl mt-4">Internal Server Error</p>
          </>
        );
      }

      return (
        <>
          <h1 className="text-6xl font-bold">{error.status}</h1>
          <p className="text-xl mt-4">{error.statusText}</p>
        </>
      );
    } else if (error instanceof Error) {
      return (
        <>
          <h1 className="text-6xl font-bold">Oops!</h1>
          <p className="text-xl mt-4">Something went wrong.</p>
          <p className="text-md mt-2 text-gray-600">{error.message}</p>
        </>
      );
    } else {
      return (
        <>
          <h1 className="text-6xl font-bold">Oops!</h1>
          <p className="text-xl mt-4">An unexpected error occurred.</p>
        </>
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
      {renderContent()}
      {/*<Link*/}
      {/*  to="/"*/}
      {/*  className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"*/}
      {/*>*/}
      {/*  Go to Home*/}
      {/*</Link>*/}
    </div>
  );
}

export default ErrorBoundary;
