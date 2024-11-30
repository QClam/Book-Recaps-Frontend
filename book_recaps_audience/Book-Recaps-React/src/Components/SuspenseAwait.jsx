import { Suspense } from "react";
import { Await } from "react-router-dom";

const SuspenseAwait = ({ children, resolve, errorElement, fallback }) => {
  return (
    <Suspense fallback={fallback}>
      <Await resolve={resolve} errorElement={errorElement}>
        {children}
      </Await>
    </Suspense>
  )
}

export default SuspenseAwait;