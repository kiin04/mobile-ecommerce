import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../config";
import { notification } from "antd";
import PathNames from "../PathNames.js";

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [cartAmount, setCartAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);
    const [overStockError, setOverStockError] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCartItems = async () => {
            const userId = sessionStorage.getItem("userId");

            if (!userId) {
                console.error("Xin hãy đăng nhập để sử dụng tính năng này");
                // notification.warning({
                //     message: 'Lỗi',
                //     description: "Vui lòng đăng nhập để sử dụng tính năng này",
                //     duration: 4,
                //     placement: "bottomRight",
                //     showProgress: true,
                //     pauseOnHover: true
                // });
                return;
            }

            try {
                const response = await fetch(`${BASE_URL}/api/cart/${userId}`);
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

        fetchCartItems();
    }, [navigate]);

    // Tính tổng giá tiền
    const calculateTotal = () => {
        return cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
        );
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = async (productId) => {
        const userId = sessionStorage.getItem("userId");

        try {
            const response = await fetch(`${BASE_URL}/api/cart/${userId}/remove`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ productId }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to remove item from cart");
            }

            setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        }
    };

    // Cập nhật số lượng sản phẩm trong giỏ hàng và kiểm tra tồn kho
    const updateQuantity = async (productId, newQuantity) => {
        const userId = sessionStorage.getItem("userId");
        const productInCart = cartItems.find(
            (item) => item.productId === productId
        );

        if (newQuantity <= 0) {
            setItemToRemove(productInCart);
            setShowConfirmDialog(true); // Hiển thị hộp thoại xác nhận xóa sản phẩm
        } else {
            try {
                const response = await fetch(
                    `${BASE_URL}/api/cart/${userId}/update`,
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

    // Xác nhận xóa sản phẩm
    const handleConfirmRemove = () => {
        removeFromCart(itemToRemove.productId);
        setShowConfirmDialog(false);
    };

    // Tính tổng tiền cho các sản phẩm được chọn
    const calculateSelectedTotal = () => {
        return cartItems
            .filter((item) => selectedItems.includes(item.productId))
            .reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // Xử lý chọn/bỏ chọn sản phẩm
    const handleSelectItem = (productId) => {
        setSelectedItems((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    // Thêm hàm xóa nhiều sản phẩm
    const removeMultipleFromCart = async (productIds) => {
        const userId = sessionStorage.getItem("userId");

        try {
            const response = await fetch(
                `${BASE_URL}/api/cart/${userId}/removeMultiple`,
                {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ productIds }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to remove items from cart");
            }

            // Cập nhật state local
            setCartItems((prevItems) =>
                prevItems.filter((item) => !productIds.includes(item.productId))
            );
            // Reset selected items
            setSelectedItems([]);
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        }
    };

    // Sửa hàm navigate để thêm callback xóa giỏ hàng
    const handleCheckout = () => {
        const selectedProducts = cartItems.filter((item) =>
            selectedItems.includes(item.productId)
        );

        // Lưu selectedItems vào sessionStorage để có thể xóa sau khi thanh toán thành công
        sessionStorage.setItem("checkoutItems", JSON.stringify(selectedItems));

        navigate(PathNames.CHECKOUT, {
            state: {
                cartItems: selectedProducts,
                total: calculateSelectedTotal(),
            },
        });
    };

    // Giao diện khi giỏ hàng trống
    // if (loading) {
    //     return <div>Đang tải...</div>;
    // }

    if (error) {
        return <div>{error}</div>;
    }

    if (cartItems.length === 0) {
        return (
            <div className="py-10 text-center">
                <h2 className="text-2xl font-semibold">
                    Giỏ hàng của bạn đang trống
                </h2>
                <p className="mt-4">Hãy chọn thêm sản phẩm để mua sắm nhé</p>
                <button
                    onClick={() => (window.location.href = "/")}
                    className="px-6 py-2 mt-6 text-white bg-blue-400 rounded-lg"
                >
                    Quay lại trang chủ
                </button>
            </div>
        );
    }

    return (
        <div className="container p-6 mx-auto">
            <h2 className="mb-4 text-2xl font-semibold">Giỏ hàng của bạn</h2>
            <div className="grid grid-cols-1 gap-4">
                {cartItems.map((item) => (
                    <div
                        key={`${item.productId}-${item.color}`}
                        className="flex justify-between items-center p-4 border rounded-lg"
                    >
                        <div className="flex items-center">
                            <div
                                onClick={() => handleSelectItem(item.productId)}
                                className={`w-6 h-6 rounded-full border-2 cursor-pointer mr-4 flex items-center justify-center
                                ${
                                    selectedItems.includes(item.productId)
                                        ? "border-blue-500 bg-blue-500"
                                        : "border-gray-400"
                                }`}
                            >
                                {selectedItems.includes(item.productId) && (
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                )}
                            </div>
                            <img
                                src={
                                    item.image
                                        ? `${BASE_URL}/${item.image.replace(
                                              /\\/g,
                                              "/"
                                          )}`
                                        : "/default-image.jpg"
                                }
                                alt={item.name}
                                className="object-cover w-20 h-20"
                            />
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold">
                                    Tên sản phẩm: {item.name}
                                </h3>
                                <p className="text-sm font-semibold">
                                    Màu: {item.color}
                                </p>
                                <p className="text-red-500">
                                    Giá: {item.price.toLocaleString()}đ
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() =>
                                    updateQuantity(
                                        item.productId,
                                        item.quantity - 1
                                    )
                                }
                                className="px-3 py-1 border rounded-md"
                            >
                                -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                                onClick={() =>
                                    updateQuantity(
                                        item.productId,
                                        item.quantity + 1
                                    )
                                }
                                className="px-3 py-1 border rounded-md"
                            >
                                +
                            </button>
                            <button
                                onClick={() => removeFromCart(item.productId)}
                                className="px-4 py-2 text-white bg-blue-500 rounded-lg"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hiển thị thông báo lỗi vượt quá tồn kho */}
            {overStockError && (
                <div className="p-4 mt-4 text-red-700 bg-red-100 rounded-lg">
                    {overStockError}
                </div>
            )}

            {/* Hiển thị hộp thoại xác nhận xóa sản phẩm */}
            {showConfirmDialog && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="p-6 bg-white rounded-lg">
                        <h3>Bạn có chắc muốn xóa sản phẩm khỏi giỏ hàng?</h3>
                        <div className="flex justify-end mt-4 space-x-4">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 text-white bg-gray-500 rounded-lg"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmRemove}
                                className="px-4 py-2 text-white bg-blue-500 rounded-lg"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 text-right">
                <p className="text-xl">
                    Tạm tính:{" "}
                    <span className="font-semibold text-red-500">
                        {calculateSelectedTotal().toLocaleString()}đ
                    </span>
                </p>
                <button
                    className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
                    onClick={handleCheckout}
                    disabled={selectedItems.length === 0}
                >
                    Mua ngay ({selectedItems.length})
                </button>
            </div>
        </div>
    );
};

export default Cart;
