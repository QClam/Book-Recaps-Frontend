import { isRouteErrorResponse, Navigate, useRouteError } from 'react-router-dom';
import { routes } from "../routes";

function ErrorBoundary() {
  const error = useRouteError();

  console.error(error);

  const renderContent = () => {
    if (isRouteErrorResponse(error)) {
      if (error.status === 401) {
        return <Navigate to={routes.logout} replace={true} />;
      }
      if (error.status === 404) {
        return (
          <>
            <h1 className="error-title">404</h1>
            <p className="error-message-err-route">Page Not Found</p>
          </>
        );
      }
      if (error.status === 500) {
        return (
          <>
            <h1 className="error-title">500</h1>
            <p className="error-message-err-route">Internal Server Error</p>
          </>
        );
      }

      return (
        <>
          <h1 className="error-title">{error.status}</h1>
          <p className="error-message-err-route">{error.statusText}</p>
        </>
      );
    } else if (error instanceof Error) {
      return (
        <>
          <h1 className="error-title">Oops!</h1>
          <p className="error-message-err-route">Something went wrong.</p>
          <p className="error-subtext">{error.message}</p>
        </>
      );
    } else {
      return (
        <>
          <h1 className="error-title">Oops!</h1>
          <p className="error-message-err-route">An unexpected error occurred.</p>
        </>
      );
    }
  };

  return (
    <div className="error-container">
      {renderContent()}
      {/*<Link to="/" className="button">Go to Home</Link>*/}
    </div>
  );
}

export default ErrorBoundary;
