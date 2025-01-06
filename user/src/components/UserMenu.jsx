import { useEffect, useState } from "react";
import { MenuOutlined, UserOutlined } from "@ant-design/icons";
import { Dropdown, Space, Modal, Avatar, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import Login from "./Login"; // Import your Login component
import Register from "./Register"; // Import your Register component
import PathNames from "../PathNames.js";
import axios from "axios"; // Import axios for making API calls
import { BASE_URL } from "../config";

const UserMenu = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAvatar, setUserAvatar] = useState(null); // State to store userAvatar
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false); // For Login modal
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false); // For Register modal
    const navigate = useNavigate();

    useEffect(() => {
        const userId = sessionStorage.getItem("userId");

        // Function to fetch user details if logged in
        const fetchUserData = async (userId) => {
            try {
                const response = await axios.get(
                    `${BASE_URL}/api/users/${userId}`
                );
                const user = response.data;
                if (user) {
                    setUserAvatar(user.userAvatar); // Assuming your API response contains a userAvatar field
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error);
            }
        };

        if (userId) {
            fetchUserData(userId);
        }

        const handleLoginSuccess = () => {
            fetchUserData(sessionStorage.getItem("userId"));
            setIsLoginModalVisible(false); // Close the login modal on successful login
        };

        window.addEventListener("loginSuccess", handleLoginSuccess);

        return () => {
            window.removeEventListener("loginSuccess", handleLoginSuccess);
        };
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("userEmail");
        sessionStorage.removeItem("accountName");
        setIsLoggedIn(false);
        setUserAvatar(null); // Clear avatar when logged out
        if (isLoggedIn) {
            message.open({
                type: "success",
                content: "Đăng xuất thành công",
                duration: 3
            });
        } else {
            message.open({
                type: "error",
                content: "Đăng xuất thất bại",
                duration: 3
            })
        }
        navigate(PathNames.HOMEPAGE);
    };

    const GuestItems = [
        {
            label: (
                <span onClick={() => setIsRegisterModalVisible(true)}>
                    Sign Up
                </span>
            ),
            key: "0",
        },
        {
            label: (
                <span onClick={() => setIsLoginModalVisible(true)}>Log In</span>
            ),
            key: "1",
        },
    ];

    const UserItems = [
        {
            label: <Link to={PathNames.PROFILE}>Profile</Link>,
            key: "0",
        },
        {
            label: <Link to={PathNames.MY_ORDERS}>My Orders</Link>,
            key: "1",
        },
        {
            label: <p onClick={handleLogout}>Log Out</p>,
            key: "2",
        },
    ];

    const handleMenuChange = (isOpen) => {
        setIsMenuOpen(isOpen);
    };

    return (
        <>
            {!isLoggedIn ? (
                <Dropdown
                    menu={{ items: GuestItems }}
                    trigger={["click"]}
                    onOpenChange={handleMenuChange}
                    className="inline-flex h-[2.8rem] w-[5.05rem] justify-center gap-[0.8rem] border-[1px] border-[#dddddd] rounded-[30px] p-2 m-[2rem] ml-[0.75rem] cursor-pointer transition-shadow duration-150 ease-linear hover:shadow-[0_2px_4px_rgba(0,0,0,0.18)] focus:shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                    overlayStyle={{ fontSize: "0.875rem", lineHeight: "1.43" }}
                >
                    <Space>
                        <MenuOutlined
                            className={`transition-transform duration-200 ease-linear transform ${
                                isMenuOpen ? `rotate-90` : `rotate-0`
                            }`}
                        />
                        <UserOutlined />
                    </Space>
                </Dropdown>
            ) : (
                <Dropdown
                    menu={{ items: UserItems }}
                    trigger={["click"]}
                    onOpenChange={handleMenuChange}
                    className="inline-flex h-[2.8rem] w-[5.05rem] justify-center gap-[0.8rem] border-[1px] border-[#dddddd] rounded-[30px] p-2 m-[2rem] ml-[0.75rem] cursor-pointer transition-shadow duration-150 ease-linear hover:shadow-[0_2px_4px_rgba(0,0,0,0.18)] focus:shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                    overlayStyle={{ fontSize: "0.875rem", lineHeight: "1.43" }}
                >
                    <Space>
                        <MenuOutlined
                            className={`transition-transform duration-200 ease-linear transform ${
                                isMenuOpen ? `rotate-90` : `rotate-0`
                            }`}
                        />
                        {userAvatar ? (
                            <Avatar src={`${BASE_URL}/${userAvatar}`}/>
                            //<img
                            //    src={`${BASE_URL}/${userAvatar}`}
                            //    alt="User Avatar"
                            //    className="w-8 h-8 rounded-full mr-2" // Use the avatar from API
                            ///>
                        ) : (
                            <UserOutlined />
                        )}
                    </Space>
                </Dropdown>
            )}

            {/* Modal for Login */}
            <Modal
                title=<div className="text-3xl mt-10 font-bold text-center">Đăng Nhập</div>
                open={isLoginModalVisible}
                onCancel={() => setIsLoginModalVisible(false)}
                closeIcon={null}
                footer={null}
                width= {450}
            >
                <Login
                    onSwitchToRegister={() => {
                        setIsLoginModalVisible(false);
                        setIsRegisterModalVisible(true);
                    }}
                />
            </Modal>

            {/* Modal for Register */}
            <Modal
                title=<div className="text-3xl my-8 -mb-3 font-bold text-center">Đăng Kí</div>
                open={isRegisterModalVisible}
                onCancel={() => setIsRegisterModalVisible(false)} // Close modal
                closeIcon={null}
                footer={null} // No footer for modal
            >
                <Register
                    onRegisterSuccess={() => {
                        setIsRegisterModalVisible(false);
                        setIsLoginModalVisible(true);
                    }}
                />
            </Modal>
        </>
    );
};

export default UserMenu;
