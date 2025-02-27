import { useState } from "react";
import axios from "axios";
import { Form, Upload } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { API_URL } from "../config.js";
import { useNavigate } from "react-router-dom";
import { message, Modal } from "antd";


const Register = ({ onRegisterSuccess }) => {
    const [name, setName] = useState("");
    const [accountName, setAccountName] = useState("");
    const [gender, setGender] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setphone] = useState("");
    const [dayOfBirth, setDayOfBirth] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [userAvatar, setUserAvatar] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false); // Modal state

    const [nameError, setNameError] = useState("");
    const [accountNameError, setAccountNameError] = useState("");
    const [genderError, setGenderError] = useState("");
    const [addressError, setAddressError] = useState("");
    const [phoneError, setphoneError] = useState("");
    const [dayOfBirthError, setDayOfBirthError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setNameError("");
        setAccountNameError("");
        //setGenderError("");
        setAddressError("");
        setphoneError("");
        // setDayOfBirthError("");
        setEmailError("");
        setPasswordError("");
        setConfirmPasswordError("");

        const userData = {
            name,
            accountName,
            gender,
            address,
            phone,
            dayOfBirth,
            email,
            password
        };

        let isValid = true;

        // Validation logic
        if (!name.trim()) {
            setNameError("Họ tên không được để trống.");
            isValid = false;
        }
        if (!accountName.trim()) {
            setAccountNameError("Tên tài khoản không được để trống.");
            isValid = false;
        }
        // if (!gender) {
        //     setGenderError("Vui lòng chọn giới tính.");
        //     isValid = false;
        // }
        // if (!dayOfBirth) {
        //     setDayOfBirthError("Ngày sinh không được để trống.");
        //     isValid = false;
        // }
        else {
            const selectedDate = new Date(dayOfBirth);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate > today) {
                setDayOfBirthError(
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
            setphoneError("Số điện thoại không hợp lệ (10-11 số).");
            isValid = false;
        }
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setEmailError("Email không hợp lệ.");
            isValid = false;
        }
        if (password.length < 6) {
            setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
            isValid = false;
        }
        if (password !== confirmPassword) {
            setConfirmPasswordError("Mật khẩu không khớp.");
            isValid = false;
        }

        if (isValid) {
            try {

                // Prepare user data to send to your server
                const formData = new FormData();
                formData.append("name", name);
                formData.append("accountName", accountName);
                //formData.append("gender", gender);
                formData.append("address", address);
                formData.append("phone", phone);
                //formData.append("dayOfBirth", dayOfBirth);
                formData.append("email", email);
                formData.append("password", password);

                if (userAvatar) {
                    formData.append("userAvatar", userAvatar);
                }
                
                
                await axios.post(`${API_URL}/api/Users`, formData, {
                    headers: {
                        "Content-Type": "application/json"
                    },
                });
                

                // notification.success({
                //     message: 'Thành công',
                //     description: 'Đăng ký thành công!',
                //     duration: 4,
                //     placement: "bottomRight",
                //     pauseOnHover: true
                // });
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
                // notification.error({
                //     message: 'Lỗi',
                //     description: "Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.",
                //     duration: 4,
                //     placement: "bottomRight",
                //     pauseOnHover: true
                // })
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
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            placeholder="Nhập tên tài khoản"
                            className="border rounded-md p-2 w-full"
                        />
                        {accountNameError && (
                            <p className="text-red-500">{accountNameError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">Giới tính</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="border rounded-md p-2 w-full"
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                        </select>
                        {genderError && (
                            <p className="text-red-500">{genderError}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-left">Ngày sinh</label>
                        <input
                            type="date"
                            value={dayOfBirth}
                            onChange={(e) => setDayOfBirth(e.target.value)}
                            className="border rounded-md p-2 w-full"
                        />
                        {dayOfBirthError && (
                            <p className="text-red-500">{dayOfBirthError}</p>
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
                            onChange={(e) => setphone(e.target.value)}
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
