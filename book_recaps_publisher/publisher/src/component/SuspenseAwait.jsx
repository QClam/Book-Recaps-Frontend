import { Suspense } from "react";
import { Await } from "react-router-dom";
import { ProgressSpinner } from "primereact/progressspinner";

const SuspenseAwait = ({ children, resolve, errorElement, fallback, useDefaultLoading, defaultLoadingMessage }) => {
  const defaultLoading = (
    <div className="flex gap-2 justify-start items-center">
      <div>
        <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="8"/>
      </div>
      <p>{defaultLoadingMessage || "Loading..."}</p>
    </div>
  )

  return (
    <Suspense fallback={useDefaultLoading ? defaultLoading : fallback}>
      <Await resolve={resolve} errorElement={errorElement ? errorElement : <></>}>
        {children}
      </Await>
    </Suspense>
  )
}

export default SuspenseAwait;