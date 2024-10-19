import { Form, useActionData, useNavigate, useNavigation } from 'react-router-dom';
import { useEffect } from "react";
import { useAuth } from "../contexts/Auth";
import { routes } from "../routes";

function Login() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const actionData = useActionData();
  const { login, reCaptchaTokens, isAuthenticated, isFirstMountChecking } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isFirstMountChecking) {
      navigate(routes.dashboard, { replace: true });
    }
  }, [ isAuthenticated, isFirstMountChecking, navigate ]);

  useEffect(() => {
    if (actionData?.user && actionData?.token) {
      login(actionData.user, actionData.token);

      const redirectTo = actionData.redirectTo || routes.dashboard;
      navigate(redirectTo, { replace: true });
    }
  }, [ actionData, login, navigate ]);

  const loading = navigation.state === 'loading' || navigation.state === 'submitting';

  return (
    <div className="max-w-5xl min-h-screen mx-auto pb-28 grid place-items-center">
      <div>
        {actionData?.error && <p style={{ color: 'red' }}>{actionData.error}</p>}
        <Form method="post">
          <input type="hidden" name="captchaToken" value={reCaptchaTokens ? reCaptchaTokens.loginToken : ""}/>
          <label>
            Email:
            <input type="email" name="email" required/>
          </label>
          <br/>
          <label>
            Password:
            <input type="password" name="password" required/>
          </label>
          <br/>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Login'}
          </button>
        </Form>
      </div>
    </div>
  );
}

export default Login;
