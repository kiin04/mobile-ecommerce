import PropTypes from "prop-types";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Sidebar.css";

const Sidebar = ({ selectedContent, onNavigate, onLogout }) => {
    const navigate = useNavigate();
    // Manage active state locally
    const [activeMenu, setActiveMenu] = useState(selectedContent || "dashboard");

    // Handle navigation and update active menu
    const handleNavigation = (path, menu) => {
        setActiveMenu(menu);
        navigate(path);
        onNavigate(menu);
    };

    const handleLogoutClick = () => {
        onLogout();
    };

    return (
        <div className="sidebar">
            <input
                type="text"
                placeholder="Nhập chức năng cần tìm..."
                className="search-bar"
            />
            <ul className="sidebar-menu">
                <li
                    className={`menu-item ${activeMenu === "dashboard" ? "active" : ""}`}
                    onClick={() => handleNavigation("/dashboard", "dashboard")}
                >
                    <img
                        className="menu-icon"
                        src="src/img/icon/dashboard.png"
                        alt="Dashboard"
                    />
                    <span>Dashboard</span>
                </li>
                <li
                    className={`menu-item ${
                        activeMenu === "product" ? "active" : ""
                    }`}
                    onClick={() =>
                        handleNavigation("/product-management", "product")
                    }
                >
                    <img
                        className="menu-icon"
                        src="src/img/icon/smartphone.png"
                        alt="Quản lý sản phẩm"
                    />
                    <span>Quản lý sản phẩm</span>
                </li>
                <li
                    className={`menu-item ${
                        activeMenu === "category" ? "active" : ""
                    }`}
                    onClick={() =>
                        handleNavigation("/category-management", "category")
                    }
                >
                    <img
                        className="menu-icon"
                        src="src/img/icon/smartphone.png"
                        alt="Quản lý danh mục"
                    />
                    <span>Quản lý danh mục </span>
                </li>
                <li
                    className={`menu-item ${
                        activeMenu === "order" ? "active" : ""
                    }`}
                    onClick={() =>
                        handleNavigation("/order-management", "order")
                    }
                >
                    <img
                        className="menu-icon"
                        src="src/img/icon/checklist.png"
                        alt="Quản lý đơn hàng"
                    />
                    <span>Quản lý đơn hàng</span>
                </li>
                <li
                    className={`menu-item ${
                        activeMenu === "user" ? "active" : ""
                    }`}
                    onClick={() => handleNavigation("/user-management", "user")}
                >
                    <img
                        className="menu-icon"
                        src="src/img/icon/user.png"
                        alt="Quản lý người dùng"
                    />
                    <span>Quản lý người dùng</span>
                </li>
                <li
                    className={`menu-item ${
                        activeMenu === "voucher" ? "active" : ""
                    }`}
                    onClick={() =>
                        handleNavigation("/voucher-management", "voucher")
                    }
                >
                    <img
                        className="menu-icon"
                        src="src/img/icon/voucher.png"
                        alt="Quản lý mã giảm giá"
                    />
                    <span>Quản lý mã giảm giá</span>
                </li>

                {/* <li
                    className={`menu-item ${
                        activeMenu === "rating" ? "active" : ""
                    }`}
                    onClick={() => handleNavigation("/reviews", "rating")}
                >
                    <img
                        className="menu-icon"
                        src="src/img/icon/rating.png"
                        alt="Quản lý đánh giá & bình luận"
                    />
                    <span>Quản lý đánh giá & bình luận</span>
                </li> */}

                <li
                    className={`menu-item ${
                        activeMenu === "phieu" ? "active" : ""
                    }`}
                    onClick={() => handleNavigation("/kho-management", "phieu")}
                >
                    <img
                        className="menu-icon"
                        src="src/img/icon/user.png"
                        alt="Quản lý phiếu nhập kho"
                    />
                    <span>Quản lý phiếu</span>
                </li>
            </ul>
            <div className="sidebar-footer">
                <ul className="sidebar-footer-menu">
                    <li className="menu-item" onClick={handleLogoutClick}>
                        <img
                            className="menu-icon"
                            src="src/img/icon/logout.png"
                            alt="Logout"
                        />
                        <span>Đăng xuất</span>
                    </li>
                </ul>
            </div>
        </div>
    );
};
Sidebar.propTypes = {
    onNavigate: PropTypes.func.isRequired,
    selectedContent: PropTypes.string.isRequired,
    onLogout: PropTypes.func.isRequired,
};

export default Sidebar;
