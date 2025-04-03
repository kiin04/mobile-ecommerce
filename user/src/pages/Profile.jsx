import { UserOutlined } from "@ant-design/icons";
import { Avatar, DatePicker } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AccountSidebar from "../components/AccountSidebar.jsx";
import { API_URL } from "../config.js";
import { setUser } from "../redux/userSlide";
import dayjs from "dayjs";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [validationErrors, setValidationErrors] = useState({
        name: "",
        email: "",
        phone: "",
        dateofBirth: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [userAvatar, setUserAvatar] = useState(); // State for user avatar upload
    const [avatarPreview, setAvatarPreview] = useState(null); // State for avatar preview
    const [avatarError, setAvatarError] = useState(""); // State for avatar error
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [updateError, setUpdateError] = useState("");

    // Thêm các hàm validate
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateAge = (birthDate) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }
        return age >= 18 && age <= 200;
    };

    const validatephone = (phone) => {
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        return phoneRegex.test(phone);
    };

    const validateName = (name) => {
        return name.trim().length >= 2;
    };

    const validatePassword = (password) => {
        // Sửa regex để chấp nhận ký tự đặc biệt
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return passwordRegex.test(password);
    };

    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

    useEffect(() => {
        setUserData(user);
    }, [user, dispatch]);

    const handleEditToggle = async () => {
        if (isEditing) {
            try {
                const userId = localStorage.getItem("userId");
                const response = await fetch(`${API_URL}/api/Users/${userId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (response.ok) {
                    const updatedUser = await response.json();
                    dispatch(setUser(updatedUser)); // Update Redux store
                    setUserData(updatedUser); // Update local state
                } else {
                    setError("Không thể tải thông tin người dùng");
                }
            } catch (err) {
                setError("Lỗi kết nối server");
                console.error(err);
            }
        }

        // Reset errors
        setValidationErrors({
            name: "",
            email: "",
            phone: "",
            dateofBirth: "",
            password: "",
        });
        setPasswordError("");
        setUpdateError("");
        setSuccessMessage("");
        setPasswordSuccess("");

        setIsEditing(!isEditing);

        // When editing is toggled off
        if (!isEditing) {
            setUserAvatar(null);
            setAvatarPreview(null);
            setAvatarError("");
            setPasswordData({
                ...passwordData,
                currentPassword: "", // Clear the current password field
            });
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateUserData = async (e) => {
        e.preventDefault();

        // Reset messages
        setSuccessMessage("");
        setUpdateError("");
        setValidationErrors({
            name: "",
            email: "",
            phone: "",
            dateofBirth: "",
            password: "",
        });

        if (user.isGoogleAcc && passwordData.newPassword) {
            setUpdateError("Tài khoản Google không thể thay đổi mật khẩu");
            return;
        }

        // Validate all fields
        let hasErrors = false;
        const newErrors = {};

        if (!userData.name.trim()) {
            newErrors.name = "Tên không được để trống";
            hasErrors = true;
        }
        if (!userData.email.trim()) {
            newErrors.email = "Email không được để trống";
            hasErrors = true;
        }
        if (!userData.phone.trim()) {
            newErrors.phone = "Số điện thoại không được để trống";
            hasErrors = true;
        }

        try {
            if (!validateName(userData.name)) {
                throw new Error("Tên phải có ít nhất 2 ký tự");
            }
        } catch (error) {
            newErrors.name = error.message;
            hasErrors = true;
        }

        try {
            if (!validateEmail(userData.email)) {
                throw new Error("Email không hợp lệ");
            }
        } catch (error) {
            newErrors.email = error.message;
            hasErrors = true;
        }

        try {
            if (!validatephone(userData.phone)) {
                throw new Error("Số điện thoại không hợp lệ");
            }
        } catch (error) {
            newErrors.phone = error.message;
            hasErrors = true;
        }

        try {
            if (!validateAge(userData.dateofBirth)) {
                throw new Error("Tuổi không hợp lệ (phải từ 18 đến 200 tuổi)");
            }
        } catch (error) {
            newErrors.dateofBirth = error.message;
            hasErrors = true;
        }

        // Validate password if changing
        if (passwordData.newPassword) {
            if (passwordData.newPassword === passwordData.currentPassword) {
                newErrors.password =
                    "Mật khẩu mới không được trùng với mật khẩu hiện tại";
                hasErrors = true;
            }
            try {
                if (!validatePassword(passwordData.newPassword)) {
                    throw new Error(
                        "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"
                    );
                }
            } catch (error) {
                newErrors.password = error.message;
                hasErrors = true;
            }
            if (passwordData.newPassword !== passwordData.confirmNewPassword) {
                newErrors.password = "Mật khẩu mới không khớp";
                hasErrors = true;
            }
        }

        if (hasErrors) {
            setValidationErrors(newErrors);
            setUpdateError("Vui lòng kiểm tra lại thông tin");
            return;
        }

        const userId = localStorage.getItem("userId");

        const formData = new FormData(); // Create FormData to handle file uploads
        formData.append("name", userData.name);
        formData.append("phone", userData.phone);
        formData.append("dateofBirth", userData.dateofBirth || null);
        formData.append("address", userData.address);
        formData.append("account", user.account);
        formData.append("totalBuy", user.totalBuy);
        formData.append("role", user.role);
        formData.append("createdAt", userData.createdAt);

        if (userAvatar) {
            formData.append("image", userAvatar); // Append the avatar file
        }
        console.log([...formData]); // Log FormData entries

        try {
            const response = await fetch(`${API_URL}/api/Users/${userId}`, {
                method: "PUT",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to update user data");
            }

            const updatedUser = await response.json();
            dispatch(setUser(updatedUser));
            setUserData(updatedUser);

            // Update Password if provided
            if (passwordData.newPassword) {
                const accountResponse = await fetch(
                    `${API_URL}/api/Accounts/CheckUser/${userId}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    }
                );
                const accountData = await accountResponse.json();
                const accountId = Array.isArray(accountData)
                    ? accountData[0].id
                    : accountData.id;

                const accountFormData = {
                    id: accountId,
                    userId: userId,
                    email: userData.email,
                    password: passwordData.newPassword,
                    username: userData.account,
                    isGoogleAcc: userData.isGoogleAcc,
                };

                const passwordResponse = await fetch(
                    `${API_URL}/api/Accounts/${accountId}`,
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(accountFormData),
                    }
                );

                if (!passwordResponse.ok) {
                    throw new Error("Failed to update password");
                }
            }

            setIsEditing(false);
            setUserAvatar(null);
            setAvatarPreview(null);
            setPasswordData({
                currentPassword: "",
                newPassword: "",
                confirmNewPassword: "",
            });
            setPasswordSuccess("Mật khẩu đã được cập nhật thành công");
            setSuccessMessage("Cập nhật thông tin thành công!");
            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            setUpdateError("Lỗi kết nối server");
            console.log(error);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2000000) {
                // Limit to 2MB
                setAvatarError("File size exceeds 2MB limit");
                return;
            }
            setUserAvatar(file);
            setAvatarPreview(URL.createObjectURL(file)); // Create a preview URL for the selected file
            setAvatarError(""); // Clear any previous error
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userId = localStorage.getItem("userId");
                const response = await fetch(`${API_URL}/api/Users/${userId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) {
                    setError("Không thể tải thông tin người dùng");
                    return;
                }
                const updatedUser = await response.json();

                // Fetch Account data to get isGoogleAcc
                const accountResponse = await fetch(
                    `${API_URL}/api/Accounts/CheckUser/${userId}`,
                    {
                        method: "GET",
                        headers: { "Content-Type": "application/json" },
                    }
                );
                if (!accountResponse.ok) {
                    setError("Không thể tải thông tin tài khoản");
                    return;
                }
                const accountData = await accountResponse.json();
                const account = Array.isArray(accountData)
                    ? accountData[0]
                    : accountData; // Handle if API returns an array

                // Combine user and account data
                const combinedData = {
                    ...updatedUser,
                    isGoogleAcc: account.isGoogleAcc || false, // Ensure isGoogleAcc is included
                };

                dispatch(setUser(combinedData));
                setUserData(combinedData);
            } catch (err) {
                setError("Lỗi kết nối server");
                console.error(err);
            }
        };
        fetchUserData();
    }, [dispatch]);

    return (
        <div className="flex flex-col md:flex-row min-h-[690px] bg-gray-100 p-5 relative">
            <AccountSidebar />
            <div className="flex-1 ml-0 md:ml-10">
                {/* Thêm thông báo thành công */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <i className="fas fa-check-circle mr-2"></i>
                            {successMessage}
                        </div>
                        <button
                            onClick={() => setSuccessMessage("")}
                            className="text-green-700 hover:text-green-900"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}

                {/* Thêm thông báo lỗi */}
                {updateError && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <i className="fas fa-exclamation-circle mr-2"></i>
                            {updateError}
                        </div>
                        <button
                            onClick={() => setUpdateError("")}
                            className="text-red-700 hover:text-red-900"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                )}

                <div className="bg-white p-6 rounded-lg shadow-lg mb-5">
                    <h1 className="text-3xl font-bold mb-6">
                        Thông tin tài khoản
                    </h1>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {userData ? (
                        <div className="bg-white rounded-lg">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="font-medium">
                                        Avatar:
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={
                                                        handleAvatarChange
                                                    } // Update avatar and preview
                                                    className="border rounded-lg p-2"
                                                />
                                                {avatarPreview ? (
                                                    <Avatar
                                                        src={
                                                            avatarPreview ||
                                                            (user?.image?.startsWith(
                                                                "data:image"
                                                            )
                                                                ? user.image
                                                                : `${API_URL}/${user.image}`)
                                                        }
                                                        size={64}
                                                        className="rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <Avatar
                                                        src={
                                                            user?.image?.startsWith(
                                                                "data:image"
                                                            )
                                                                ? user.image
                                                                : `${API_URL}/${user.image}`
                                                        }
                                                        size={64}
                                                        className="rounded-full object-cover"
                                                    />
                                                )}
                                            </>
                                        ) : user.image ? (
                                            <Avatar
                                                src={`data:image/jpeg;base64,${user.image}`}
                                                size={64}
                                            />
                                        ) : (
                                            <UserOutlined />
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-start">
                                    <label className="font-medium">Tên:</label>
                                    <div className="w-1/2 text-right">
                                        {/* Thêm text-right */}
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    className={`border rounded-lg p-2 w-full text-left ${
                                                        /* Giữ text-left cho input */
                                                        validationErrors.name
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                    name="name"
                                                    value={userData.name}
                                                    onChange={(e) =>
                                                        setUserData({
                                                            ...userData,
                                                            name: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="Tên"
                                                    required
                                                />
                                                {validationErrors.name && (
                                                    <p className="text-red-500 text-sm absolute right-0 mt-1">
                                                        {validationErrors.name}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p>{userData.name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-start">
                                    <label className="font-medium">
                                        Email:
                                    </label>
                                    <div className="w-1/2 text-right">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="email"
                                                    className={`border rounded-lg p-2 w-full text-left ${
                                                        validationErrors.email
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                    name="email"
                                                    value={userData.email}
                                                    onChange={(e) =>
                                                        setUserData({
                                                            ...userData,
                                                            email: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="Email"
                                                    required
                                                />
                                                {validationErrors.email && (
                                                    <p className="text-red-500 text-sm absolute right-0 mt-1">
                                                        {validationErrors.email}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p>{userData.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-start">
                                    <label className="font-medium">
                                        Số điện thoại:
                                    </label>
                                    <div className="w-1/2 text-right">
                                        {isEditing ? (
                                            <>
                                                <input
                                                    type="text"
                                                    className={`border rounded-lg p-2 w-full text-left ${
                                                        validationErrors.phone
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                    name="phone"
                                                    value={userData.phone}
                                                    onChange={(e) =>
                                                        setUserData({
                                                            ...userData,
                                                            phone: e.target
                                                                .value,
                                                        })
                                                    }
                                                    placeholder="Số điện thoại"
                                                    required
                                                />
                                                {validationErrors.phone && (
                                                    <p className="text-red-500 text-sm absolute right-0 mt-1">
                                                        {validationErrors.phone}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p>{userData.phone}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Date of Birth Section */}
                                <div className="flex justify-between items-start">
                                    <label className="font-medium">
                                        Ngày sinh:
                                    </label>
                                    <div className="w-1/2 text-right">
                                        {isEditing ? (
                                            <>
                                                <DatePicker
                                                    value={
                                                        userData.dateofBirth
                                                            ? dayjs(
                                                                  userData.dateofBirth
                                                              )
                                                            : null
                                                    }
                                                    onChange={(date) =>
                                                        setUserData({
                                                            ...userData,
                                                            dateofBirth: date
                                                                ? date.toISOString()
                                                                : null,
                                                        })
                                                    }
                                                    format="YYYY-MM-DD"
                                                    className={`w-full ${
                                                        validationErrors.dateofBirth
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                                {validationErrors.dateofBirth && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {
                                                            validationErrors.dateofBirth
                                                        }
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p>
                                                {userData.dateofBirth
                                                    ? dayjs(
                                                          userData.dateofBirth
                                                      ).format("DD-MM-YYYY")
                                                    : "Chưa cập nhật"}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-start">
                                    <label className="font-medium">
                                        Địa chỉ:
                                    </label>
                                    <div className="w-1/2 text-right">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                className={`border rounded-lg p-2 w-full text-left ${
                                                    validationErrors.address
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                                name="address"
                                                value={userData.address}
                                                onChange={(e) =>
                                                    setUserData({
                                                        ...userData,
                                                        address: e.target.value,
                                                    })
                                                }
                                                placeholder="Địa chỉ"
                                                required
                                            />
                                        ) : (
                                            <p>{userData.address}</p>
                                        )}
                                    </div>
                                </div>

                                {/* <div className="flex justify-between items-center">
                                    <label className="font-medium">
                                        Tên tài khoản:
                                    </label>
                                    <p className="w-1/2 text-right">
                                        {userData.accountName}
                                    </p>
                                </div> */}

                                {/* Cập nhật phần nút */}
                                <div className="mt-8 flex justify-end space-x-4 border-t pt-4">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleUpdateUserData}
                                                className="px-6 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 flex items-center"
                                            >
                                                <span className="text-center">
                                                    <i className="fas fa-save"></i>
                                                </span>
                                                Lưu thay đổi
                                            </button>
                                            <button
                                                onClick={handleEditToggle}
                                                className="px-6 py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-200 flex items-center"
                                            >
                                                <span className="text-center">
                                                    <i className="fas fa-times"></i>
                                                </span>
                                                Hủy
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={handleEditToggle}
                                            className="px-6 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-200 flex items-center"
                                        >
                                            <span className="mr-2">
                                                <i className="fas fa-edit"></i>
                                            </span>
                                            Sửa thông tin tài khoản
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>Loading user data...</p>
                    )}
                </div>

                {/* Tách phần đổi mật khẩu thành component riêng */}
                {isEditing && !user.isGoogleAcc ? (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-5">
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold mb-4">
                                Đổi mật khẩu
                            </h2>

                            <div className="flex justify-between items-start">
                                <label className="font-medium">
                                    Mật khẩu hiện tại:
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    className="border rounded-lg p-2 w-1/2"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    autoComplete="new-password"
                                />
                            </div>
                            <div className="flex justify-between items-start">
                                <label className="font-medium">
                                    Mật khẩu mới:
                                </label>
                                <div className="w-1/2 relative">
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className={`border rounded-lg p-2 w-full ${
                                            validationErrors.password
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                    />
                                    {validationErrors.password && (
                                        <p className="text-red-500 text-sm absolute right-0 mt-1">
                                            {validationErrors.password}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <label className="font-medium">
                                    Xác nhận mật khẩu mới:
                                </label>
                                <input
                                    type="password"
                                    name="confirmNewPassword"
                                    className="border rounded-lg p-2 w-1/2"
                                    value={passwordData.confirmNewPassword}
                                    onChange={handlePasswordChange}
                                />
                            </div>

                            {/* Thêm thông báo lỗi/thành công */}
                            <div className="mt-2">
                                {passwordError && (
                                    <p className="text-red-500 text-sm">
                                        <i className="fas fa-exclamation-circle mr-2"></i>
                                        {passwordError}
                                    </p>
                                )}
                                {passwordSuccess && (
                                    <p className="text-green-500 text-sm">
                                        <i className="fas fa-check-circle mr-2"></i>
                                        {passwordSuccess}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : isEditing && user.isGoogleAcc ? (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-5">
                        <p className="text-yellow-500 text-sm">
                            Tài khoản Google không thể thay đổi mật khẩu.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Profile;
