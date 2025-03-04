import { ExclamationCircleFilled } from "@ant-design/icons";
import { Drawer, Modal } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import PathNames from "../PathNames.js";
import {  useSelector } from "react-redux";
const CartSidebar = ({ cartOpen, setCartOpen }) => {
    const user = useSelector((state) => state.user);
    const userId = user?.id
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);
    const [overStockError, setOverStockError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartItems = async () => {
            if (!userId) {
                console.error("Xin hãy đăng nhập để sử dụng tính năng này");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/Carts/User/${userId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch cart items");
                }
                const data = await response.json();
                setCartItems(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching cart items:", error);
                setError(error.message);
                setLoading(false);
            }
        };

        if (cartOpen) {
            fetchCartItems();
        }
    }, [navigate, cartOpen]);

    // Tính tổng giá tiền
    const calculateTotal = () => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = async (productId) => {
        const userId = localStorage.getItem("userId"); // Lấy userId từ localStorage

        try {
            await fetch(`${API_URL}/api/cart/${userId}/remove`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ productId }),
            });

            setCartItems(
                cartItems.filter((item) => item.productId !== productId)
            );
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        }
    };

    // Cập nhật số lượng sản phẩm trong giỏ hàng và kiểm tra tồn kho
    const updateQuantity = async (productId, newQuantity) => {
        const userId = localStorage.getItem("userId");
        const productInCart = cartItems.find(
            (item) => item.productId === productId
        );

        if (newQuantity <= 0) {
            setItemToRemove(productInCart);
            setShowConfirmDialog(true); // Hiển thị hộp thoại xác nhận xóa sản phẩm
        } else {
            try {
                const response = await fetch(
                    `${API_URL}/api/Carts/${userId}/update`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            productId,
                            quantity: newQuantity,
                        }),
                    }
                );

                const data = await response.json();
                if (response.status === 400) {
                    setOverStockError(data.message); // Hiển thị lỗi nếu vượt quá tồn kho
                } else {
                    setCartItems((prevItems) =>
                        prevItems.map((item) =>
                            item.productId === productId
                                ? { ...item, quantity: newQuantity }
                                : item
                        )
                    );
                    setOverStockError(null); // Xóa lỗi nếu cập nhật thành công
                }
            } catch (error) {
                console.error("Lỗi khi cập nhật số lượng:", error);
            }
        }
    };

    // Xử lý chọn/bỏ chọn sản phẩm

    const { confirm } = Modal;
    const showDeleteConfirm = (productId) => {
        setItemToRemove(productId); // Set item to remove
        confirm({
            title: "Xóa sản phẩm?",
            icon: <ExclamationCircleFilled />,
            content: "Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?",
            okText: "Có",
            okType: "danger",
            cancelText: "Không",
            onOk() {
                console.log("OK");
                removeFromCart(productId); // Use productId directly
            },
            onCancel() {
                console.log("Cancel");
            },
        });
    };

    // Sửa hàm navigate để thêm callback xóa giỏ hàng
    const handleCheckout = () => {
        // Lấy tất cả sản phẩm trong giỏ hàng
        const selectedProducts = cartItems;

        // Lưu selectedItems vào localStorage để có thể xóa sau khi thanh toán thành công
        localStorage.setItem(
            "checkoutItems",
            JSON.stringify(selectedProducts)
        );

        navigate(PathNames.CHECKOUT, {
            state: {
                cartItems: selectedProducts,
                total: calculateTotal(),
            },
        });
    };
    const [productItems, setProductItems] = useState({});
    // Hàm lấy dữ liệu sản phẩm
    const fetchProducts = async () => {
        try {
            const promises = cartItems.map(async (item) => {
                const response = await fetch(`${API_URL}/api/Products/${item.productId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch product");
                }
                const data = await response.json();
                return { productId: item.productId, product: data };
            });

            const results = await Promise.all(promises);
            const productsMap = results.reduce((acc, { productId, product }) => {
                acc[productId] = product;
                return acc;
            }, {});

            setProductItems(productsMap);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError(error.message);
        }
    };
    const [colorSizes, setColorSizes] = useState({});
    // Hàm lấy dữ liệu color
    const fetchColorSizes = async () => {
        try {
            const promises = cartItems.map(async (item) => {
                const response = await fetch(`${API_URL}/api/ColorSizes/${item.colorSizeId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch product");
                }
                const data = await response.json();
                return { colorSizeId: item.colorSizeId, color: data };
            });

            const results = await Promise.all(promises);
            const colorsMap = results.reduce((acc, { colorSizeId, color }) => {
                acc[colorSizeId] = color;
                return acc;
            }, {});

            setColorSizes(colorsMap);
        } catch (error) {
            console.error("Error fetching products:", error);
            setError(error.message);
        }
    };
    // Gọi API khi cartItems thay đổi
    useEffect(() => {
        if (cartItems.length > 0) {
            fetchProducts();
            fetchColorSizes();
        }
    }, [cartItems]);
    return (
        <Drawer
            title = <p className="text-xl font-bold">Giỏ Hàng</p>
            onClose={() => setCartOpen(false)}
            open={cartOpen}
            width={600}
            footer=<div className="flex items-center justify-between">
                {/* Subtotal section */}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-xl font-bold">Tạm tính:</span>
                    <span className="text-xl font-semibold">
                        {calculateTotal().toLocaleString()}đ
                    </span>
                </div>

                {/* Buttons section */}
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            navigate(PathNames.CART);
                            setCartOpen(false);
                        }}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-3xl hover:bg-gray-50 transition-colors"
                    >
                        Xem giỏ hàng
                    </button>
                    <button
                        onClick={() => {
                            setCartOpen(false);
                            handleCheckout();
                        }}
                        className="px-4 py-2 text-sm bg-primary text-white rounded-3xl hover:bg-red-700 transition-colors"
                    >
                        Thanh toán
                    </button>
                </div>
            </div>
        >
            <div className="flex flex-col h-full overflow-y-auto">
                <section className="flex-1">
                    {cartItems && cartItems.map((item) => {
                        const product = productItems[item.productId];
                        const color = colorSizes[item.colorSizeId];
                        return (
                            <div
                                className="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto"
                                key={`${item.productId}-${item.color}`}
                            >
                                <div className="rounded-3xl border-2 border-gray-200 p-4 lg:p-8 grid grid-cols-12 mb-8 max-lg:max-w-lg max-lg:mx-auto gap-y-4 ">
                                    <div className="col-span-12 lg:col-span-2 img box">
                                    {product ? (
                                        <img
                                            src={`data:image/jpeg;base64,${product?.image}`}
                                            alt={product?.name}
                                            className="object-cover w-20 h-20"
                                        />
                                    ) : (
                                        <p>Đang tải...</p>
                                    )}
                                    </div>
                                    <div className="col-span-12 lg:col-span-10 detail w-full lg:pl-3">
                                        <div className="flex items-center justify-between w-full mb-4">
                                            <h5 className="font-manrope font-bold text-2xl leading-9 text-gray-900">
                                                {product?.name}
                                            </h5>
                                            <button
                                                onClick={() =>
                                                    showDeleteConfirm(
                                                        item.productId
                                                    )
                                                }
                                                className="rounded-full group flex items-center justify-center focus-within:outline-red-500"
                                            >
                                                <svg
                                                    width={34}
                                                    height={34}
                                                    viewBox="0 0 34 34"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <circle
                                                        className="fill-red-50 transition-all duration-500 group-hover:fill-red-400"
                                                        cx={17}
                                                        cy={17}
                                                        r={17}
                                                        fill=""
                                                    />
                                                    <path
                                                        className="stroke-red-500 transition-all duration-500 group-hover:stroke-white"
                                                        d="M14.1673 13.5997V12.5923C14.1673 11.8968 14.7311 11.333 15.4266 11.333H18.5747C19.2702 11.333 19.834 11.8968 19.834 12.5923V13.5997M19.834 13.5997C19.834 13.5997 14.6534 13.5997 11.334 13.5997C6.90804 13.5998 27.0933 13.5998 22.6673 13.5997C21.5608 13.5997 19.834 13.5997 19.834 13.5997ZM12.4673 13.5997H21.534V18.8886C21.534 20.6695 21.534 21.5599 20.9807 22.1131C20.4275 22.6664 19.5371 22.6664 17.7562 22.6664H16.2451C14.4642 22.6664 13.5738 22.6664 13.0206 22.1131C12.4673 21.5599 12.4673 20.6695 12.4673 18.8886V13.5997Z"
                                                        stroke="#EF4444"
                                                        strokeWidth="1.6"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="font-normal text-base leading-7 text-gray-500 mb-6">
                                        {color?.color} -{color?.size}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    className="group rounded-[50px] border border-gray-200 shadow-sm shadow-transparent p-2.5 flex items-center justify-center bg-white transition-all duration-500 hover:shadow-gray-200 hover:bg-gray-50 hover:border-gray-300 focus-within:outline-gray-300"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        className="stroke-gray-900 transition-all duration-500 group-hover:stroke-black"
                                                        width={18}
                                                        height={19}
                                                        viewBox="0 0 18 19"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M4.5 9.5H13.5"
                                                            stroke=""
                                                            strokeWidth="1.6"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                                <span className="border border-gray-200 rounded-full w-10 aspect-square outline-none text-gray-900 font-semibold text-sm py-2 px-3 bg-gray-100  text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    className="group rounded-[50px] border border-gray-200 shadow-sm shadow-transparent p-2.5 flex items-center justify-center bg-white transition-all duration-500 hover:shadow-gray-200 hover:bg-gray-50 hover:border-gray-300 focus-within:outline-gray-300"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                >
                                                    <svg
                                                        className="stroke-gray-900 transition-all duration-500 group-hover:stroke-black"
                                                        width={18}
                                                        height={19}
                                                        viewBox="0 0 18 19"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M3.75 9.5H14.25M9 14.75V4.25"
                                                            stroke=""
                                                            strokeWidth="1.6"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                            <h6 className="text-primary font-manrope font-bold text-2xl leading-9 text-right">
                                                {(
                                                    item.price * item.quantity
                                                ).toLocaleString()}
                                                đ
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

                {/* Hiển thị thông báo lỗi vượt quá tồn kho */}
                {overStockError && (
                    <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
                        {overStockError}
                    </div>
                )}
            </div>
        </Drawer>
    );
};

export default CartSidebar;
