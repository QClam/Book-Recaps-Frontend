import { useRouteError } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <MainLayout>
      <div>
        <h1>Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p>
          <i>{error.statusText || error.message}</i>
        </p>
      </div>
    </MainLayout>
  );
}
