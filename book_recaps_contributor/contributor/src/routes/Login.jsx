import { Form, Navigate, useActionData, useNavigate, useNavigation } from 'react-router-dom';
import { useEffect } from "react";
import { useAuth } from "../contexts/Auth";
import { routes } from "../routes";
import { useToast } from "../contexts/Toast";

function Login() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData();
  const { login, reCaptchaTokens, isAuthenticated, reFetchReCaptchaTokens } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (actionData?.error) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: actionData.error,
      });

      reFetchReCaptchaTokens('login');
    }
  }, [ actionData ]);

  useEffect(() => {
    if (actionData?.user && actionData?.token) {
      login(actionData.user, actionData.token);
    }
  }, [ actionData, login, navigate ]);

  const loading = navigation.state === 'loading' || navigation.state === 'submitting';

  if (isAuthenticated) {
    return <Navigate to={routes.dashboard} replace={true}/>
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <p className="mt-10 text-center">
          Sign in
        </p>
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Contributor Dashboard
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {actionData?.error && <p style={{ color: 'red' }}>{actionData.error}</p>}
        <Form method="post" className="space-y-6">
          <input type="hidden" name="captchaToken" value={reCaptchaTokens ? reCaptchaTokens.loginToken : ""}/>
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Email address</label>
            <div className="mt-2">
              <input id="email" name="email" type="email" autoComplete="email" required
                     className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Password</label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">Forgot password?</a>
              </div>
            </div>
            <div className="mt-2">
              <input id="password" name="password" type="password" autoComplete="current-password" required
                     className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading || !reCaptchaTokens?.loginToken}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : !reCaptchaTokens?.loginToken ? 'Preparing...' : 'Login'}
            </button>
          </div>
        </Form>
        <p className="mt-10 text-center text-sm text-gray-500">
          Not a Contributor?&nbsp;
          <a href="#" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Become a Contributor</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
