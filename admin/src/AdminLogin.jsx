import { useState } from "react";
import "./styles/AdminLogin.css";
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

            const response = await axios.post(`${API_URL}/api/Accounts/login`, {
                email,
                password,
            })
            console.log('response login',response.data);
            if (response.data) {
           
                alert("Đăng nhập thành công!");
                onLoginSuccess();
            } else {
                setLoginError( "Đăng nhập không thành công");
            }
        } catch (err) {
            setLoginError("Lỗi server");
            console.error(err);
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
