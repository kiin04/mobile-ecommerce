import { useState } from "react";
import './styles/AdminLogin.css';
import { BASE_URL } from "./config";
// eslint-disable-next-line react/prop-types
const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Gửi yêu cầu POST đến backend
      const response = await fetch(`${BASE_URL}/loginAdmin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Gửi email và password
      });
      console.log('Sending login request:', { email, password });

      const data = await response.json();

      if (response.ok) {
        alert('Đăng nhập thành công!');
        onLoginSuccess(); // Gọi hàm khi đăng nhập thành công
      } else {
        setLoginError(data.message); // Hiển thị thông báo lỗi
      }
    } catch (err) {
      setLoginError("Lỗi server");
      console.log(err)
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        <div className="form-group">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn-login">SIGN IN</button>
        {loginError && <p className="error-message">{loginError}</p>}
      </form>
    </div>
  );
};

export default AdminLogin;
