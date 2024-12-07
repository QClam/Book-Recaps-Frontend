import { useEffect } from "react";
import { Form, Navigate, useActionData, useNavigate, useNavigation } from "react-router-dom";
import { useAuth } from "../../contexts/Auth";
import { useToast } from "../../contexts/Toast";
import { routes } from "../../routes";

function Login() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData();
  const { login, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (actionData?.error) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: actionData.error,
      });
    }
  }, [ actionData ]);

  useEffect(() => {
    if (actionData?.user && actionData?.token) {
      login(actionData.user, actionData.token);
    }
  }, [ actionData, login, navigate ]);

  const loading = navigation.state === 'loading' || navigation.state === 'submitting';

  if (isAuthenticated) {
    // return <Navigate to={location.state?.from ? location.state.from : routes.dashboard} replace={true}/>
    return <Navigate to={routes.index} replace={true}/>
  }

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <p className="mt-10 text-center">
          Sign in
        </p>
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Publisher Dashboard
        </h2>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        {actionData?.error && <p style={{ color: 'red' }}>{actionData.error}</p>}
        <Form method="post" className="space-y-6">
          <input type="hidden" name="captchaToken" value="..."/>
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
            </div>
            <div className="mt-2">
              <input id="password" name="password" type="password" autoComplete="current-password" required
                     className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"/>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Login;
