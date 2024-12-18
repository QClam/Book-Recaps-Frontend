import { useEffect, useState } from "react";
import { Form, Navigate, useActionData, useNavigate } from "react-router-dom";
import "./Login.scss";
import { routes } from "../../routes";
import { useAuth } from "../../contexts/Auth";
import { toast } from "react-toastify";

function Login() {
  const [ isActive ] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const actionData = useActionData();
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ error, setError ] = useState(null);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
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
    <div className="h-screen grid place-items-center">
      <div className={`container ${isActive ? "active" : ""}`} id="container">
        <div className="form-container sign-in">
          <Form method="post" className="space-y-6">
            <h1 className="font-bold">Đăng nhập</h1>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Tài khoản"
              onFocus={() => setError(null)}
            />
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Mật khẩu"
              onFocus={() => setError(null)}
            />
            <button
              type="submit"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </Form>
        </div>

        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-right">
              <h1 className="font-bold">Xin chào</h1>
              <p>
                Nhập thông tin để sử dụng các chức năng
              </p>
              <h3 className="font-semibold">NHÂN VIÊN</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
