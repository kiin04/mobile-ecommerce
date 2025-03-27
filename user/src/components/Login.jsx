import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { message, Form, Input, Button } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlide"; // Import action
import { API_URL } from "../config";
import userService from "../facadeParttern/userService";
import GoogleBtn from "../shared/GoogleBtn";

const Login = ({ onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    // Cập nhật dữ liệu form khi nhập input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Gửi request login
    const loginUser = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/Accounts/login`, {
                email,
                password,
            });
            // console.log(response);
            return response.data; // Trả về userId từ API
        } catch (error) {
            throw new Error(
                error.response?.data?.message || "Đăng nhập thất bại"
            );
        }
    };

    // Xử lý khi submit form
    const handleSubmit = async () => {
        setLoading(true); // Bắt đầu loading

        try {
            const userId = await loginUser(formData.email, formData.password);
            if (!userId) {
                throw new Error("Không tìm thấy tài khoản!");
            }

            // Lấy thông tin chi tiết của user
            const userDetails = await userService.fetchUserDetails(userId);

            // Lưu vào Redux
            dispatch(
                setUser({
                    ...userDetails,
                    email: formData.email,
                })
            );

            // Lưu vào localStorage
            localStorage.setItem("userId", userId);
            localStorage.setItem("email", formData.email);
            //localStorage.setItem("password", formData.password);

            message.success("Đăng nhập thành công");
            window.location.reload();
        } catch (error) {
            console.error("Error:", error.message);
            message.warning(
                error.message || "Email hoặc mật khẩu không chính xác"
            );
        } finally {
            setLoading(false); // Dừng loading
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const idToken = credentialResponse.credential;

            const response = await axios.post(`${API_URL}/api/Google/Login`, {
                idToken,
            });

            const { data } = response.data;
            const userId = data.userId;

            // Fetch user details using the userId
            const userDetails = await userService.fetchUserDetails(userId);

            // Save user details to Redux
            dispatch(
                setUser({
                    ...userDetails,
                    email: data.email,
                })
            );

            localStorage.setItem("userId", userId);
            localStorage.setItem("email", data.email);

            message.success("Đăng nhập bằng Google thành công");
            window.location.reload();
        } catch (error) {
            console.error("Google Login Error:", error);
            message.error("Đăng nhập bằng Google thất bại");
        }
    };

    useEffect(() => {
        if (!window.google) {
            console.error("Google Identity Services script not loaded");
            return;
        }

        window.google.accounts.id.initialize({
            client_id: "743750561195-lgsj8sd1l5ghv92ecad4fvoh3m0feko3.apps.googleusercontent.com",
            callback: handleGoogleLogin,
        });
    }, []);

    return (
        <div className="flex justify-center items-center flex-col">
            <Form
                name="login"
                initialValues={{
                    remember: true,
                }}
                style={{
                    maxWidth: 450,
                }}
                size="large"
                onFinish={handleSubmit}
                className="py-8"
            >
                <Form.Item name="email" className="mb-6">
                    <label className="text-sm">Email</label>
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="Nhập email của bạn"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </Form.Item>
                <Form.Item name="password">
                    <label className="text-sm translate-y-4">Mật khẩu</label>
                    <Input.Password
                        prefix={<LockOutlined />}
                        type="password"
                        placeholder="Nhập mật khẩu của bạn"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </Form.Item>
                <Form.Item>
                    <Button
                        block
                        type="primary"
                        htmlType="submit"
                        className="mb-2 h-12 -mt-2 text-lg font-medium bg-primary"
                        loading={loading} // Hiển thị loading nếu đang xử lý
                    >
                        Đăng nhập
                    </Button>
                    {`Chưa có tài khoản? `}
                    <span
                        className="text-primary cursor-pointer"
                        onClick={onSwitchToRegister}
                    >
                        Đăng kí ngay!
                    </span>
                </Form.Item>
            </Form>
            <p className="p line text-center" style={{marginTop: "-2.5em", marginBottom: "1em"}}>Hoặc</p>
            <GoogleBtn />
        </div>
    );
};

export default Login;
