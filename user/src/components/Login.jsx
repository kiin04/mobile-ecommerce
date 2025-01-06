// import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";

const Login = ({ onSwitchToRegister }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [showResend, setShowResend] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setResendMessage("");
        setShowResend(false);

        try {
            const response = await fetch(`${BASE_URL}/api/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem("userEmail", formData.email);
                sessionStorage.setItem("userId", data.user.userId);
                sessionStorage.setItem("accountName", data.user.accountName);
                window.dispatchEvent(new Event("loginSuccess"));
                navigate("/");
                console.log("Logged in successfully with user data:", data);
                message.open({
                    type: "success",
                    content: "Đăng nhập thành công",
                });
            } else {
                const errorData = await response.json();
                message.open(
                    {
                        type: "warning",
                        content:
                            errorData.message ||
                            "Email hoặc mật khẩu không chính xác",
                        duration: 3,
                    }
                    // errorData.message || "Email hoặc mật khẩu không chính xác"
                );
            }
        } catch (err) {
            console.error("Error:", err);
            // setErrorMessage("Email hoặc mật khẩu không chính xác");
            message.open({
                type: "warning",
                content: "Email hoặc mật khẩu không chính xác",
                duration: 3,
            });
        }
    };

    const onFinish = (values) => {
        console.log("Received values of form: ", values);
    };

    return (
        //         <div className="flex justify-center items-center">
        //             <Form
        //                 name="login"
        //                 initialValues={{
        //                     remember: true,
        //                 }}
        //                 style={{
        //                     maxWidth: 450,
        //                 }}
        //                 size="large"
        //                 onFinish={handleSubmit}
        //                 className="py-8"
        //             >
        //                 <Form.Item
        //                     name="email"
        //                     rules={[
        //                         {
        //                             required: true,
        //                             message: "Trường này bắt buộc!",
        //                         },
        //                     ]}
        //                     className="mb-6"
        //                 >
        //                     <label className="text-sm">Email</label>
        //                     <Input
        //                         prefix={<MailOutlined />}
        //                         placeholder="Nhập email của bạn"
        //                         value={formData.email}
        //                         onChange={handleChange}
        //                     />
        //                 </Form.Item>
        //                 <Form.Item
        //                     name="password"
        //                     rules={[
        //                         {
        //                             required: true,
        //                             message: "Trường này bắt buộc!",
        //                         },
        //                     ]}
        //                 >
        //                     <label className="text-sm translate-y-4">Mật khẩu</label>
        //                     <Input.Password
        //                         prefix={<LockOutlined />}
        //                         type="password"
        //                         placeholder="Nhập mật khẩu của bạn"
        //                         value={formData.password}
        //                         onChange={handleChange}
        //                     />
        //                 </Form.Item>
        //                 <Form.Item>
        //                     <Flex
        //                         justify="space-between"
        //                         align="center"
        //                         className="-mt-4"
        //                     >
        //                         <Form.Item
        //                             name="remember"
        //                             valuePropName="checked"
        //                             noStyle
        //                         >
        //                             <Checkbox className="">Nhớ thông tin</Checkbox>
        //                         </Form.Item>
        //                     </Flex>
        //                 </Form.Item>

        //                 <Form.Item>
        //                     <Button
        //                         block
        //                         type="primary"
        //                         htmlType="submit"
        //                         className="mb-2 h-12 -mt-2 text-lg font-medium bg-primary"
        //                     >
        //                         Đăng nhập
        //                     </Button>
        //                     {`Chưa có tài khoản? `}
        //                     <Link onClick={onSwitchToRegister} className="text-primary">
        //                         Đăng kí ngay!
        //                     </Link>
        //                 </Form.Item>
        //             </Form>
        //         </div>
        //     );
        // };

        <div className="flex justify-center items-center  ">
            <form
                className="bg-white p-8 rounded-lg max-w-lg w-full"
                onSubmit={handleSubmit}
            >
            {/* <h2 className="text-2xl mb-6 text-center text-gray-800">
            Đăng Nhập
        </h2> */}
        {errorMessage && (
                    <p className="text-red-500 text-center mb-4">
                        {errorMessage}
                    </p>
                )}
                {resendMessage && (
                    <p className="text-green-500 text-center mb-4">
                        {resendMessage}
                    </p>
                )}

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 mb-4 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full p-3 mb-4 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-300"
                >
                    Đăng Nhập
                </button>

                <p className="text-center mt-4">
                    Chưa có tài khoản?{" "}
                    <span
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={onSwitchToRegister}
                    >
                        Đăng ký
                    </span>
                </p>
            </form>
        </div>
    );
};

export default Login;