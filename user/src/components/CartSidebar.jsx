import { ExclamationCircleFilled } from "@ant-design/icons";
import { Alert, Drawer, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import PathNames from "../PathNames.js";
import { useSelector } from "react-redux";

const CartSidebar = ({ cartOpen, setCartOpen }) => {
    const user = useSelector((state) => state.user);
    const userId = user?.id;
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [overStockError, setOverStockError] = useState(null);
    const navigate = useNavigate();

    // Hàm lấy giỏ hàng từ localStorage cho guest
    const getLocalCart = () => {
        const localCart = localStorage.getItem('localCart');
        return localCart ? JSON.parse(localCart) : [];
    };

    // Hàm lưu giỏ hàng vào localStorage cho guest
    const saveLocalCart = (items) => {
        localStorage.setItem('localCart', JSON.stringify(items));
    };

    // Hàm lấy giỏ hàng từ server cho user
    const fetchUserCart = async () => {
        try {
            const response = await fetch(`${API_URL}/api/Carts/User/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch cart items");
            const data = await response.json();
            // Gộp các mục trùng lặp
            const mergedItems = data.reduce((acc, item) => {
                const key = `${item.productId}-${item.colorSizeId}`;
                const existingItem = acc.find((i) => `${i.productId}-${i.colorSizeId}` === key);
                if (existingItem) {
                    existingItem.quantity += item.quantity;
                    existingItem.ids = existingItem.ids ? [...existingItem.ids, item.id] : [item.id];
                } else {
                    acc.push({ ...item, ids: [item.id] });
                }
                return acc;
            }, []);
            return mergedItems;
        } catch (error) {
            console.error("Error fetching cart items:", error);
            setError(error.message);
            return [];
        }
    };

    const loadCartItems = async () => {
        setLoading(true);
        let items = [];

        if (userId) {
            // Trường hợp user đã đăng nhập
            items = await fetchUserCart();
            // Đồng bộ với localStorage nếu cần
            saveLocalCart(items);
        } else {
            // Trường hợp guest
            items = getLocalCart();
        }

        setCartItems(items);
        setLoading(false);
    };

    useEffect(() => {
        if (cartOpen) {
            loadCartItems();
        }
    }, [cartOpen, userId]);

    useEffect(() => {
        const handleCartUpdate = () => {
            if (cartOpen) {
                loadCartItems();
            }
        };
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [cartOpen]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity || 0), 0);
    };

    const removeFromCart = async (cartIds) => {
        let updatedItems = [...cartItems];
        
        if (userId) {
            // Xử lý xóa cho user
            try {
                await Promise.all(
                    cartIds.map((id) =>
                        fetch(`${API_URL}/api/Carts/${id}`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                        })
                    )
                );
            } catch (error) {
                console.error("Error removing cart item:", error);
                return;
            }
            updatedItems = updatedItems.filter((item) => !cartIds.includes(item.ids[0]));
        } else {
            // Xử lý xóa cho guest
            updatedItems = updatedItems.filter((item) => !cartIds.includes(item.ids?.[0] || item.productId));
        }

        setCartItems(updatedItems);
        saveLocalCart(updatedItems);
    };

    const updateQuantity = async (cartIds, newQuantity) => {
        if (newQuantity <= 0) {
            showDeleteConfirm(cartIds);
            return;
        }

        const item = cartItems.find((item) => item.ids?.includes(cartIds[0]) || item.productId === cartIds[0]);
        if (!item) return;

        let updatedItems = [...cartItems];

        if (userId) {
            // Xử lý cho user
            try {
                const response = await fetch(`${API_URL}/api/ColorSizes/${item.colorSizeId}`);
                if (!response.ok) throw new Error("Không thể kiểm tra tồn kho");
                const colorSizeData = await response.json();
                
                if (newQuantity > colorSizeData.quantity) {
                    setOverStockError(`Chỉ còn ${colorSizeData.quantity} sản phẩm`);
                    return;
                }

                await Promise.all(
                    cartIds.map((id) =>
                        fetch(`${API_URL}/api/Carts/${id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                id: id,
                                quantity: newQuantity,
                                productId: item.productId,
                                userId: userId,
                                price: item.price,
                                colorSizeId: item.colorSizeId,
                            }),
                        })
                    )
                );
            } catch (error) {
                console.error("Error updating quantity:", error);
                setOverStockError("Có lỗi xảy ra");
                return;
            }
        }

        // Cập nhật local state cho cả user và guest
        updatedItems = updatedItems.map((item) =>
            (item.ids?.some((id) => cartIds.includes(id)) || item.productId === cartIds[0])
                ? { ...item, quantity: newQuantity }
                : item
        );

        setCartItems(updatedItems);
        saveLocalCart(updatedItems);
        setOverStockError(null);
    };

    const { confirm } = Modal;
    const showDeleteConfirm = (cartIds) => {
        confirm({
            title: "Xóa sản phẩm?",
            icon: <ExclamationCircleFilled />,
            content: "Bạn có chắc muốn xóa sản phẩm này?",
            okText: "Có",
            okType: "danger",
            cancelText: "Không",
            onOk() {
                removeFromCart(cartIds);
            },
        });
    };

    const handleCheckout = () => {
        localStorage.setItem("checkoutItems", JSON.stringify(cartItems));
        navigate(PathNames.CHECKOUT, { state: { cartItems, total: calculateTotal() } });
        setCartOpen(false);
    };

    const [productItems, setProductItems] = useState({});
    const [colorSizes, setColorSizes] = useState({});

    const fetchProductsAndColors = async () => {
        if (!cartItems.length) return;
        try {
            const productPromises = cartItems.map(async (item) => {
                const response = await fetch(`${API_URL}/api/Products/${item.productId}`);
                if (!response.ok) throw new Error("Failed to fetch product");
                const data = await response.json();
                return { productId: item.productId, product: data };
            });

            const colorPromises = cartItems.map(async (item) => {
                const response = await fetch(`${API_URL}/api/ColorSizes/${item.colorSizeId}`);
                if (!response.ok) throw new Error("Failed to fetch color/size");
                const data = await response.json();
                return { colorSizeId: item.colorSizeId, color: data };
            });

            const [productResults, colorResults] = await Promise.all([
                Promise.all(productPromises),
                Promise.all(colorPromises),
            ]);

            setProductItems(productResults.reduce((acc, { productId, product }) => {
                acc[productId] = product;
                return acc;
            }, {}));
            setColorSizes(colorResults.reduce((acc, { colorSizeId, color }) => {
                acc[colorSizeId] = color;
                return acc;
            }, {}));
        } catch (error) {
            console.error("Error fetching product data:", error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (cartItems.length > 0 && cartOpen) {
            fetchProductsAndColors();
        }
    }, [cartItems, cartOpen]);

    return (
        <Drawer
            title={<p className="text-xl font-bold">Giỏ Hàng</p>}
            onClose={() => setCartOpen(false)}
            open={cartOpen}
            width={600}
            footer={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold">Tạm tính:</span>
                        <span className="text-xl font-semibold">
                            {calculateTotal().toLocaleString()}đ
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                navigate(PathNames.CART, { state: { cartItems } });
                                setCartOpen(false);
                            }}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-3xl hover:bg-gray-50"
                        >
                            Xem giỏ hàng
                        </button>
                        <button
                            onClick={handleCheckout}
                            disabled={!cartItems.length}
                            className="px-4 py-2 text-sm bg-primary text-white rounded-3xl hover:bg-red-700 disabled:bg-gray-400"
                        >
                            Thanh toán
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex flex-col h-full relative">
                {loading ? (
                    <p>Đang tải...</p>
                ) : cartItems.length === 0 ? (
                    <p>Giỏ hàng trống</p>
                ) : (
                    <div className="flex-1 overflow-y-auto pb-16">
                        {cartItems.map((item) => {
                            const product = productItems[item.productId];
                            const color = colorSizes[item.colorSizeId];
                            const itemKey = userId ? `${item.productId}-${item.colorSizeId}` : item.productId;
                            return (
                                <div
                                    key={itemKey}
                                    className="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto"
                                >
                                    <div className="rounded-3xl border-2 border-gray-200 p-4 lg:p-8 grid grid-cols-12 mb-8 gap-y-4">
                                        <div className="col-span-12 lg:col-span-2">
                                            {product ? (
                                                <img
                                                    src={`data:image/jpeg;base64,${product?.image}`}
                                                    alt={product?.name}
                                                    className="object-cover w-20 h-20"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 bg-gray-200 animate-pulse" />
                                            )}
                                        </div>
                                        <div className="col-span-12 lg:col-span-10 w-full lg:pl-3">
                                            <div className="flex items-center justify-between mb-4">
                                                <h5 className="font-manrope font-bold text-2xl text-gray-900">
                                                    {product?.name || "Đang tải..."}
                                                </h5>
                                                <button
                                                    onClick={() => showDeleteConfirm(item.ids || [item.productId])}
                                                    className="rounded-full group flex items-center justify-center"
                                                >
                                                    <svg width={34} height={34} viewBox="0 0 34 34" fill="none">
                                                        <circle
                                                            className="fill-red-50 group-hover:fill-red-400"
                                                            cx={17}
                                                            cy={17}
                                                            r={17}
                                                        />
                                                        <path
                                                            className="stroke-red-500 group-hover:stroke-white"
                                                            d="M14.1673 13.5997V12.5923C14.1673 11.8968 14.7311 11.333 15.4266 11.333H18.5747C19.2702 11.333 19.834 11.8968 19.834 12.5923V13.5997M19.834 13.5997C19.834 13.5997 14.6534 13.5997 11.334 13.5997C6.90804 13.5998 27.0933 13.5998 22.6673 13.5997C21.5608 13.5997 19.834 13.5997 19.834 13.5997ZM12.4673 13.5997H21.534V18.8886C21.534 20.6695 21.534 21.5599 20.9807 22.1131C20.4275 22.6664 19.5371 22.6664 17.7562 22.6664H16.2451C14.4642 22.6664 13.5738 22.6664 13.0206 22.1131C12.4673 21.5599 12.4673 20.6695 12.4673 18.8886V13.5997Z"
                                                            strokeWidth="1.6"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="font-normal text-base text-gray-500 mb-6">
                                                {color ? `${color.color} - ${color.size}` : "Đang tải..."}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        className="group rounded-[50px] border border-gray-200 p-2.5 bg-white hover:bg-gray-50"
                                                        onClick={() => updateQuantity(item.ids || [item.productId], item.quantity - 1)}
                                                    >
                                                        <svg
                                                            className="stroke-gray-900 group-hover:stroke-black"
                                                            width={18}
                                                            height={19}
                                                            viewBox="0 0 18 19"
                                                        >
                                                            <path
                                                                d="M4.5 9.5H13.5"
                                                                strokeWidth="1.6"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <span className="border border-gray-200 rounded-full w-10 aspect-square text-gray-900 font-semibold text-sm py-2 px-3 bg-gray-100 text-center">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        className="group rounded-[50px] border border-gray-200 p-2.5 bg-white hover:bg-gray-50"
                                                        onClick={() => updateQuantity(item.ids || [item.productId], item.quantity + 1)}
                                                    >
                                                        <svg
                                                            className="stroke-gray-900 group-hover:stroke-black"
                                                            width={18}
                                                            height={19}
                                                            viewBox="0 0 18 19"
                                                        >
                                                            <path
                                                                d="M3.75 9.5H14.25M9 14.75V4.25"
                                                                strokeWidth="1.6"
                                                                strokeLinecap="round"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                                <h6 className="text-primary font-manrope font-bold text-2xl">
                                                    {(item.price * item.quantity).toLocaleString()} đ
                                                </h6>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {overStockError && (
                    <div className="absolute bottom-0 left-0 p-4">
                        <Alert message={overStockError} type="error" showIcon />
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default CartSidebar;