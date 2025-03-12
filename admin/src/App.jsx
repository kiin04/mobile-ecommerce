import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProductManagement from './pages/ProductManagement/ProductManagement.jsx';
import OrderManagement from './pages/OrderManagement/OrderManagement.jsx';
import AdminLogin from './AdminLogin.jsx';
import UserManagement from './pages/UserManagement/UserManagement.jsx';
import ReviewManagement from './pages/ReviewManagement/ReviewManagement.jsx';
import AddProduct from './pages/ProductManagement/AddProduct.jsx';
import EditProduct from './pages/ProductManagement/EditProduct.jsx';
import AddOrder from './pages/OrderManagement/AddOrder.jsx';
import EditOrder from './pages/OrderManagement/EditOrder.jsx';
import VoucherManagement from './pages/VoucherManagement/VoucherManagement.jsx';
import CategoryManager from './pages/CategoryManager/CategoryManager.jsx';
import AddVoucher from './pages/VoucherManagement/AddVoucher.jsx';
import EditVoucher from './pages/VoucherManagement/EditVoucher.jsx';
import AddUser from './pages/UserManagement/AddUser.jsx';
import KhoManagement from './pages/KhoManagement/KhoManagement.jsx';
import AddKho from './pages/KhoManagement/AddKho.jsx';
import EditKho from './pages/KhoManagement/EditKho.jsx';
import AddCategory from './pages/CategoryManager/AddCategory.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './index.css';
import EditCategory from './pages/CategoryManager/EditCategory.jsx';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("userId"));
    const [selectedContent, setSelectedContent] = useState('dashboard');

    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("userId");
        setIsLoggedIn(false); // Reset login state
    };

    const handleSidebarNavigation = (content) => {
        setSelectedContent(content);
    };

    if (!isLoggedIn) {
        return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <Router>
        <div className="d-flex flex-column vh-100">
            <div className="header">
            <Header />
            </div>
            <div className="container-fluid flex-grow-1">
            <div className="row">
                <nav className="col-md-3 col-lg-2 d-md-block bg-light sidebar">
                <Sidebar selectedContent={selectedContent} onNavigate={handleSidebarNavigation} onLogout={handleLogout} />
                </nav>
                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                <div className="main-content">
                    <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element= <Dashboard /> />
                    <Route path="/product-management" element= <ProductManagement /> />
                    <Route path="/category-management" element= <CategoryManager /> />
                    <Route path="/edit-category/:categoryId" element= <EditCategory /> />
                    <Route path="/add-category" element= <AddCategory /> />
                    <Route path="/order-management" element= <OrderManagement /> />
                    <Route path="/add-product" element= <AddProduct /> />
                    <Route path="/edit-product/:productId" element= <EditProduct /> />
                    <Route path="/add-order" element= <AddOrder /> />
                    <Route path="/edit-order/:orderId" element= <EditOrder /> />
                    <Route path="/user-management" element= <UserManagement /> />
                    <Route path="/add-user" element= <AddUser /> />
                    <Route path="/voucher-management" element= <VoucherManagement /> />
                    <Route path="/add-voucher" element= <AddVoucher /> />
                    <Route path="/edit-voucher/:voucherId" element= <EditVoucher /> />
                    <Route path="/reviews" element= <ReviewManagement/> />
                    <Route path="/kho-management" element= <KhoManagement /> />
                    <Route path="/add-inout" element= <AddKho /> />
                    <Route path="/edit-kho/:id" element= <EditKho /> />
                    </Routes>
                </div>
                </main>
            </div>
            </div>
        </div>
        </Router>
    );
}

export default App;