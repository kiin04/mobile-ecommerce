import { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import CartSidebar from "./components/CartSidebar.jsx";
import Footer from "./Header&Footer/Footer.jsx";
import Header from "./Header&Footer/Header.jsx";
import About from "./pages/About.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import FaQ from "./pages/FAQ.jsx";
import Homepage from "./pages/Homepage/Homepage.jsx";
import MyOrders from "./pages/MyOrders.jsx";
import PaymentFailed from "./pages/PaymentFailed.jsx";
import PaymentResult from "./pages/PaymentResult.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import ProductDetails from "./pages/ProductDetails/ProductDetails.jsx";
import Profile from "./pages/Profile.jsx";
import SearchResult from "./pages/SearchResults.jsx";
import Shop from "./pages/Shop.jsx";
import Stories from "./pages/Stories.jsx";
import Support from "./pages/Support.jsx";
import Terms from "./pages/Terms.jsx";
import Vacancies from "./pages/Vacancies.jsx";
import PathNames from "./PathNames.js";
import Breadcrumbs from "./shared/Breadcrumbs.jsx";
import userService from "./facadeParttern/userService.js";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/userSlide.js";
import CheckoutBuyNow from "./pages/CheckOutBuyNow.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { API_URL } from "./config.js";

function App() {
    const [cartOpen, setCartOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [cartItemCount, setCartItemCount] = useState(0);
    const userId = localStorage.getItem("userId");
    const emaillocal = localStorage.getItem("email");
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchUser = async () => {
            if (userId) {
                try {
                    // Facade
                    const user = await userService.fetchUserDetails(userId);

                    dispatch(
                        setUser({
                            ...user,
                            email: emaillocal,
                        })
                    );
                } catch (error) {
                    console.error(
                        "Error fetching user details:",
                        error.message
                    );
                }
            }
        };

        fetchUser();
    }, [userId, dispatch]);

    // Function to fetch cart items for logged-in users
    const fetchUserCart = async () => {
        try {
            const response = await fetch(`${API_URL}/api/Carts/User/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch cart items");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching user cart:", error);
            return [];
        }
    };

    // Function to fetch local cart for guests
    const getLocalCart = () => {
        const localCart = localStorage.getItem("localCart");
        try {
            return localCart ? JSON.parse(localCart) : [];
        } catch (error) {
            console.error("Error parsing localCart from localStorage:", error);
            return [];
        }
    };

    // Function to calculate total cart items
    const calculateCartItemCount = async () => {
        let totalItems = 0;

        if (userId) {
            // Logged-in user: Fetch items from the database
            const userCart = await fetchUserCart();
            totalItems = userCart.reduce((sum, item) => sum + item.quantity, 0);
        } else {
            // Guest user: Fetch items from localStorage
            const localCart = getLocalCart();
            totalItems = localCart.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
        }

        setCartItemCount(totalItems);
    };

    // Recalculate cart item count whenever the app loads or cart changes
    useEffect(() => {
        calculateCartItemCount();
    }, [userId, cartOpen]);

    return (
        <CartProvider>
            <Header
                cartOpen={cartOpen}
                setCartOpen={setCartOpen}
                cartItemCount={cartItemCount}
                calculateCartItemCount={calculateCartItemCount}
            />
            <CartSidebar
                cartOpen={cartOpen}
                cartItems={cartItems}
                setCartItems={setCartItems}
                setCartOpen={setCartOpen}
                onCartChange={calculateCartItemCount}
            />

            <div className="container mx-auto p-4">
                <Breadcrumbs />

                <Routes>
                    <Route path="/" element={<Homepage calculateCartItemCount={calculateCartItemCount} />} />
                    <Route path={PathNames.ABOUT} element={<About />} />
                    <Route
                        path={PathNames.CHECKOUTBUYNOW}
                        element={<CheckoutBuyNow />}
                    />
                    <Route path={PathNames.STORIES} element={<Stories />} />
                    <Route path={PathNames.FAQ} element={<FaQ />} />
                    <Route path={PathNames.VACANCIES} element={<Vacancies />} />
                    <Route
                        path={PathNames.CONTACT_US}
                        element={<ContactUs />}
                    />
                    <Route
                        path={PathNames.PRIVACY_POLICY}
                        element={<PrivacyPolicy />}
                    />
                    <Route path={PathNames.TERMS} element={<Terms />} />
                    <Route path={PathNames.SUPPORT} element={<Support />} />
                    <Route path={PathNames.CART} element={<Cart />} />
                    <Route path={PathNames.CHECKOUT} element={<Checkout />} />
                    <Route path={PathNames.PROFILE} element={<Profile />} />
                    <Route path={PathNames.MY_ORDERS} element={<MyOrders />} />
                    <Route
                        path={PathNames.SEARCH_RESULTS}
                        element={<SearchResult />}
                    />
                    <Route
                        path={PathNames.PAYMENT_RESULT}
                        element={<PaymentResult />}
                    />
                    <Route
                        path={PathNames.PAYMENT_SUCCESS}
                        element={<PaymentSuccess />}
                    />
                    <Route
                        path={PathNames.PAYMENT_FAILED}
                        element={<PaymentFailed />}
                    />
                    <Route path={PathNames.SHOP} element={<Shop />} />
                    <Route
                        path={`${PathNames.PRODUCT_DETAILS}/:productId`}
                        element={<ProductDetails calculateCartItemCount={calculateCartItemCount} />}
                    />
                </Routes>
            </div>

            <Footer />
        </CartProvider>
    );
}

export default App;
