import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config.js";
import { useNavigate } from "react-router-dom";
import { message, Modal } from "antd";

const Register = ({ onRegisterSuccess }) => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [dateofBirth, setDateofBirth] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userAvatar, setUserAvatar] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // Modal state

    const [nameError, setNameError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [addressError, setAddressError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [dateofBirthError, setDateofBirthError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNameError("");
        setUsernameError("");
        setAddressError("");
        setDateofBirthError("");
        setPhoneError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");

        const userData = {
            name,
            username,
            address,
            phone,
            dateofBirth,
            email,
            password,
        };

        let isValid = true;

        // Validation logic
        if (!name.trim()) {
            setNameError("Họ tên không được để trống.");
            isValid = false;
        }
        if (!username.trim()) {
            setUsernameError("Tên tài khoản không được để trống.");
            isValid = false;
        }
        if (dateofBirth) {
            const selectedDate = new Date(dateofBirth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                setDateofBirthError(
                    "Ngày sinh không thể là ngày trong tương lai."
                );
                isValid = false;
            }
        }
        if (!address.trim()) {
            setAddressError("Địa chỉ không được để trống.");
            isValid = false;
        }
        const phonePattern = /^[0-9]{10,11}$/;
        if (!phonePattern.test(phone)) {
            setPhoneError("Số điện thoại không hợp lệ (10-11 số).");
            isValid = false;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setEmailError("Email không hợp lệ.");
            isValid = false;
        }
        const passwordPattern = /^(?=.*\d).{6,}$/;
        if (!passwordPattern.test(password)) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự và bao gồm cả số.");
            isValid = false;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError("Mật khẩu không khớp.");
            isValid = false;
        }

        if (isValid) {
            try {
                const formData = new FormData();
                formData.append("Name", name);
                formData.append("Phone", phone);
                formData.append("Address", address);
                formData.append("DateofBirth", dateofBirth);
                formData.append("Role", "4");
                if (userAvatar) {
                    formData.append("image", userAvatar);
                }

                const userResponse = await axios.post(`${API_URL}/api/Users`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                });

                const accountData = {
                    UserId: userResponse.data.id,
                    Email: email,
                    Password: password,
                    Username: username,
                    IsGoogleAcc: false
                };

                await axios.post(`${API_URL}/api/Accounts`, accountData, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                message.open({
                    type: "success",
                    content: "Đăng ký thành công!",
                    duration: 4,
                });
                onRegisterSuccess();
            } catch (error) {
                console.error(
                    "Error during registration:",
                    error.response?.data || error.message
                );
                message.open({
                    type: "error",
                    content:
                        "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.",
                    duration: 4,
                });
            }
        }
    };

    // Modal handling functions
    const handleOk = () => {
        setIsModalVisible(false);
        navigate("/");
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className=" p-8 rounded-lg max-w-md w-full text-center">
                {/* <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Đăng ký
                </h2> */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-left">Họ tên</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập họ tên"
                            className="border rounded-md p-2 w-full"
                        />
                        {nameError && (
                            <p className="text-red-500">{nameError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">Tên tài khoản</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nhập tên tài khoản"
                            className="border rounded-md p-2 w-full"
                        />
                        {usernameError && (
                            <p className="text-red-500">{usernameError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">Ngày sinh</label>
                        <input
                            type="date"
                            value={dateofBirth}
                            onChange={(e) => setDateofBirth(e.target.value)}
                            className="border rounded-md p-2 w-full"
                        />
                        {dateofBirthError && (
                            <p className="text-red-500">{dateofBirthError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">Địa chỉ</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Nhập địa chỉ"
                            className="border rounded-md p-2 w-full"
                        />
                        {addressError && (
                            <p className="text-red-500">{addressError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">Số điện thoại</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Nhập số điện thoại"
                            className="border rounded-md p-2 w-full"
                        />
                        {phoneError && (
                            <p className="text-red-500">{phoneError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email"
                            className="border rounded-md p-2 w-full"
                        />
                        {emailError && (
                            <p className="text-red-500">{emailError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            className="border rounded-md p-2 w-full"
                        />
                        {passwordError && (
                            <p className="text-red-500">{passwordError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">
                            Nhập lại mật khẩu
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Nhập lại mật khẩu"
                            className="border rounded-md p-2 w-full"
                        />
                        {confirmPasswordError && (
                            <p className="text-red-500">
                                {confirmPasswordError}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">Avatar</label>
                        <input
                            type="file"
                            onChange={(e) => setUserAvatar(e.target.files[0])}
                            className="border rounded-md p-2 w-full"
                        />
                    </div>
                    {/* <Form.Item
                        label=<p className="block text-sm font-medium text-gray-700">Avatar</p>
                        valuePropName="fileList"
                        // getValueFromEvent={normFile}
                    >
                        <Upload action="/upload.do" listType="picture-card" accept="image/*" onChange={(e) => setUserAvatar(e.target.files[0])}>
                            <button
                                style={{ border: 0, background: "none" }}
                                type="button"
                            >
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </button>
                        </Upload>
                    </Form.Item> */}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition duration-300"
                    >
                        Đăng ký
                    </button>
                </form>
            </div>

            {/* Verification Modal */}
            <Modal
                title="Xác thực tài khoản"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={[
                    <button
                        key="submit"
                        className="bg-blue-600 text-white rounded-md p-2 hover:bg-blue-700 transition duration-300"
                        onClick={handleOk}
                    >
                        Đã xác thực
                    </button>,
                ]}
            >
                <p>
                    Vui lòng xác thực tài khoản của bạn bằng cách nhấp vào liên
                    kết đã gửi đến email của bạn.
                </p>
            </Modal>
        </div>
    );
};

export default Register;
