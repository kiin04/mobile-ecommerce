import { useState } from "react";
import "./styles/AdminLogin.css";
import { message } from "antd";
import { API_URL } from "./config";
import axios from "axios";
// eslint-disable-next-line react/prop-types
const AdminLogin = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    // Gửi request login
    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoginError("");

        try {
            const loginResponse = await axios.post(
                `${API_URL}/api/Accounts/login`,
                {
                    email,
                    password,
                }
            );

            const userId = loginResponse.data;
            if (!userId) {
                setLoginError(
                    "Đăng nhập thất bại: Không nhận được dữ liệu từ server!"
                );
                return;
            }

            try {
                const userResponse = await axios.get(
                    `${API_URL}/api/Users/${userId}`
                );
                const user = userResponse.data;

                if (user.role === 2) {
                    message.success("Đăng nhập thành công!");
                    onLoginSuccess();
                } else {
                    setLoginError("Bạn không có quyền truy cập vào hệ thống!");
                }
            } catch (userError) {
                console.error("Error fetching user details:", userError);
                if (userError.response) {
                    setLoginError(
                        "Không thể lấy thông tin người dùng từ server!"
                    );
                } else if (userError.request) {
                    setLoginError("Lỗi mạng: Không thể kết nối đến server!");
                } else {
                    setLoginError(
                        "Lỗi không xác định khi lấy thông tin người dùng!"
                    );
                }
            }
        } catch (loginError) {
            console.error("Login error:", loginError);

            if (loginError.response) {
                const status = loginError.response.status;
                if (status === 401 || status === 400) {
                    setLoginError("Email hoặc mật khẩu không chính xác!");
                } else {
                    setLoginError(
                        `Lỗi server: ${
                            loginError.response.data?.message ||
                            "Không xác định"
                        }`
                    );
                }
            } else if (loginError.request) {
                setLoginError("Lỗi mạng: Không thể kết nối đến server!");
            } else {
                setLoginError("Có lỗi xảy ra khi đăng nhập!");
            }
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

                <button type="submit" className="btn-login">
                    SIGN IN
                </button>
                {loginError && <p className="error-message">{loginError}</p>}
            </form>
        </div>
    );
};

export default AdminLogin;
