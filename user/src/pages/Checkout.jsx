import { useEffect, useState } from "react";
import { API_URL } from "../config";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import PathNames from "../PathNames.js";

const Checkout = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [customerInfo, setCustomerInfo] = useState({
        name: "",
        phone: "",
        address: "",
    });
    const [shippingOption, setShippingOption] = useState("store");
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [notes, setNotes] = useState("");
    const [showDiscountDialog, setShowDiscountDialog] = useState(false);
    const [discountCodes, setDiscountCodes] = useState([]);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [discountedAmount, setDiscountedAmount] = useState(0);
    const [error, setError] = useState(null);

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchCustomerInfo = async () => {
            try {
                const response = await fetch(`${API_URL}/api/Users/${userId}`);
                if (!response.ok) throw new Error("Failed to fetch customer info");
                const data = await response.json();
                setCustomerInfo({
                    name: data.name || "",
                    phone: data.phone || "",
                    address: data.address || "",
                });
            } catch (error) {
                console.error("Error fetching customer info:", error);
            }
        };

        if (location.state?.cartItems) {
            setCartItems(location.state.cartItems);
            setTotalAmount(location.state.total);
        } else if (!userId) {
            const guestCheckoutItems = localStorage.getItem("guestCheckoutItems");
            if (guestCheckoutItems) {
                const items = JSON.parse(guestCheckoutItems);
                setCartItems(items);
                setTotalAmount(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
            } else {
                navigate(PathNames.CART);
            }
        } else {
            navigate(PathNames.CART);
        }

        if (userId) {
            fetchCustomerInfo();
        }
    }, [userId, location.state, navigate]);

    const [productItems, setProductItems] = useState({});
    const fetchProducts = async () => {
        try {
            const promises = cartItems.map(async (item) => {
                const response = await fetch(`${API_URL}/api/Products/${item.productId}`);
                if (!response.ok) throw new Error("Failed to fetch product");
                const data = await response.json();
                return { productId: item.productId, product: data };
            });

            const results = await Promise.all(promises);
            setProductItems(results.reduce((acc, { productId, product }) => {
                acc[productId] = product;
                return acc;
            }, {}));
        } catch (error) {
            console.error("Error fetching products:", error);
            setError(error.message);
        }
    };

    const [colorSizes, setColorSizes] = useState({});
    const fetchColorSizes = async () => {
        try {
            const promises = cartItems.map(async (item) => {
                const response = await fetch(`${API_URL}/api/ColorSizes/${item.colorSizeId}`);
                if (!response.ok) throw new Error("Failed to fetch color/size");
                const data = await response.json();
                return { colorSizeId: item.colorSizeId, color: data };
            });

            const results = await Promise.all(promises);
            setColorSizes(results.reduce((acc, { colorSizeId, color }) => {
                acc[colorSizeId] = color;
                return acc;
            }, {}));
        } catch (error) {
            console.error("Error fetching colors:", error);
            setError(error.message);
        }
    };

    useEffect(() => {
        if (cartItems.length > 0) {
            fetchProducts();
            fetchColorSizes();
        }
    }, [cartItems]);

    useEffect(() => {
        const fetchDiscountCodes = async () => {
            try {
                const response = await fetch(`${API_URL}/api/Promotions`);
                if (!response.ok) throw new Error("Failed to fetch discount codes");
                const data = await response.json();
                const sortedCodes = data.sort((a, b) => b.value - a.value);
                const enableDiscount = sortedCodes.filter(
                    (discount) => new Date(discount.endAt).getTime() > Date.now()
                );
                setDiscountCodes(enableDiscount);
            } catch (error) {
                console.error("Error fetching discount codes:", error);
            }
        };
        fetchDiscountCodes();
    }, []);

    const handleSelectDiscount = (discount) => {
        setSelectedDiscount(discount);
        const discountAmount = Math.min(
            Math.floor((totalAmount * discount.value) / 100),
            discount.maxValue
        );
        setDiscountedAmount(discountAmount);
        setShowDiscountDialog(false);
    };

    const handleRemoveDiscount = () => {
        setSelectedDiscount(null);
        setDiscountedAmount(0);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleContinue = async () => {
        // Kiểm tra thông tin bắt buộc cho guest
        if (!userId) {
            const missingFields = [];
            if (!customerInfo.name) missingFields.push("họ tên");
            if (!customerInfo.phone) missingFields.push("số điện thoại");
            if (shippingOption === "delivery" && !customerInfo.address) missingFields.push("địa chỉ");

            if (missingFields.length > 0) {
                notification.error({
                    message: "Lỗi",
                    description: `Vui lòng điền ${missingFields.join(", ")}`,
                    duration: 4,
                    placement: "bottomLeft",
                });
                return;
            }
        }

        const finalAmount = totalAmount - discountedAmount;
        const paymentData = {
            userId: userId || null, // API cần hỗ trợ null hoặc thay bằng "guest" nếu cần
            name: customerInfo.name,
            totalPrice: finalAmount,
            paymentMethod: paymentMethod,
            phone: customerInfo.phone,
            note: notes,
            paymentStatus: "Chưa thanh toán",
            status: "Chờ xác nhận",
            address: shippingOption === "store" ? storeAddress : customerInfo.address,
            discountCode: selectedDiscount ? selectedDiscount.code : null,
            discountAmount: discountedAmount,
        };

        console.log("Payment Data gửi lên:", paymentData);

        if (paymentMethod === "MoMo") {
            try {
                const paymentResponse = await fetch(`${API_URL}/payment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: finalAmount,
                        extraData: JSON.stringify(paymentData),
                        orderInfo: `Thanh toán đơn hàng cho ${customerInfo.name}`,
                    }),
                });

                const result = await paymentResponse.json();
                if (!paymentResponse.ok) throw new Error(result.message || "Lỗi kết nối đến cổng thanh toán");

                if (result.payUrl) {
                    if (!userId) {
                        localStorage.setItem("guestCheckoutItems", JSON.stringify(cartItems));
                    } else {
                        localStorage.setItem("checkoutItems", JSON.stringify(cartItems.map((item) => item.id)));
                    }
                    window.location.href = result.payUrl;
                } else {
                    throw new Error("Không nhận được URL thanh toán");
                }
            } catch (error) {
                console.error("Lỗi khi xử lý thanh toán MoMo:", error);
                notification.error({
                    message: "Lỗi thanh toán",
                    description: error.message || "Có lỗi xảy ra khi xử lý thanh toán",
                    duration: 4,
                    placement: "bottomLeft",
                });
            }
        } else if (paymentMethod === "COD") {
            try {
                const orderResponse = await fetch(`${API_URL}/api/Orders`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(paymentData),
                });

                if (!orderResponse.ok) {
                    const errorData = await orderResponse.json();
                    console.error("Server error response:", errorData);
                    throw new Error(errorData.message || "Lỗi khi tạo đơn hàng");
                }

                const orderRes = await orderResponse.json();
                for (const item of cartItems) {
                    const orderDetail = {
                        orderId: orderRes.id,
                        productId: item.productId,
                        colorSizeId: item.colorSizeId,
                        price: item.price,
                        quantity: item.quantity,
                    };

                    const orderDetailResponse = await fetch(`${API_URL}/api/OrderDetails`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(orderDetail),
                    });

                    if (!orderDetailResponse.ok) {
                        const detailError = await orderDetailResponse.json();
                        throw new Error(detailError.message || "Lỗi khi tạo chi tiết đơn hàng");
                    }
                }

                // Xóa giỏ hàng sau khi đặt hàng thành công
                if (userId) {
                    const ids = cartItems.map((item) => item.id);
                    const deleteResponse = await fetch(
                        `${API_URL}/api/Carts/BySelectedItem/${userId}`,
                        {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(ids),
                        }
                    );
                    if (!deleteResponse.ok) {
                        const deleteError = await deleteResponse.json();
                        throw new Error(deleteError.message || "Lỗi khi xóa sản phẩm khỏi giỏ hàng");
                    }
                } else {
                    localStorage.removeItem("guestCart");
                    localStorage.removeItem("guestCheckoutItems");
                }

                notification.success({
                    message: "Đặt hàng thành công",
                    description: "Đơn hàng của bạn đang chờ xác nhận. Chúng tôi sẽ liên hệ với bạn sớm nhất!",
                    duration: 4,
                    placement: "bottomLeft",
                });
                navigate(userId ? "/my-orders" : "/");
            } catch (error) {
                console.error("Lỗi khi tạo đơn hàng:", error);
                notification.error({
                    message: "Lỗi",
                    description: error.message || "Có lỗi xảy ra khi tạo đơn hàng",
                    duration: 4,
                    placement: "bottomLeft",
                });
            }
        }
    };

    const storeAddress = "806 QL22, ấp Mỹ Hoà 3, Hóc Môn, Hồ Chí Minh";

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Thông tin đặt hàng</h2>

            {/* Thông tin khách hàng */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">Thông tin khách hàng</h3>
                {!userId ? (
                    <>
                        <input
                            type="text"
                            name="name"
                            value={customerInfo.name}
                            onChange={handleInputChange}
                            placeholder="Họ và tên"
                            className="w-full p-2 border rounded-lg mb-2"
                            required
                        />
                        <input
                            type="text"
                            name="phone"
                            value={customerInfo.phone}
                            onChange={handleInputChange}
                            placeholder="Số điện thoại"
                            className="w-full p-2 border rounded-lg mb-2"
                            required
                        />
                    </>
                ) : (
                    <>
                        <p>Tên: {customerInfo.name}</p>
                        <p>Số điện thoại: {customerInfo.phone}</p>
                    </>
                )}
            </div>

            {/* Hiển thị sản phẩm */}
            {cartItems.length > 0 ? (
                cartItems.map((item) => {
                    const product = productItems[item.productId];
                    const color = colorSizes[item.colorSizeId];
                    return (
                        <div key={`${item.productId}-${item.colorSizeId}`} className="bg-white p-4 rounded-lg shadow mb-4">
                            <div className="flex items-center">
                                {product ? (
                                    <img
                                        src={`data:image/jpeg;base64,${product?.image}`}
                                        alt={product?.name}
                                        className="object-cover w-20 h-20"
                                    />
                                ) : (
                                    <p>Đang tải...</p>
                                )}
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold">
                                        {product?.name} - {color?.color} - {color?.size}
                                    </h3>
                                    <p className="text-red-500">{item.price.toLocaleString()}đ</p>
                                    <p>Số lượng: {item.quantity}</p>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <p>Giỏ hàng của bạn trống. Hãy mua gì đó rồi quay lại nhé</p>
            )}

            {/* Thông tin nhận hàng */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">Thông tin nhận hàng</h3>
                <div className="flex items-center space-x-8 mb-4">
                    <div className="flex items-center cursor-pointer" onClick={() => setShippingOption("store")}>
                        <div
                            className={`w-5 h-5 rounded-full border-2 ${
                                shippingOption === "store" ? "border-blue-500 bg-blue-500" : "border-gray-500"
                            } mr-2 flex items-center justify-center`}
                        >
                            {shippingOption === "store" && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <label className="text-gray-800">Nhận tại cửa hàng</label>
                    </div>
                    <div className="flex items-center cursor-pointer" onClick={() => setShippingOption("delivery")}>
                        <div
                            className={`w-5 h-5 rounded-full border-2 ${
                                shippingOption === "delivery" ? "border-blue-500 bg-blue-500" : "border-gray-500"
                            } mr-2 flex items-center justify-center`}
                        >
                            {shippingOption === "delivery" && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <label className="text-gray-800">Giao hàng tận nơi</label>
                    </div>
                </div>
                {shippingOption === "store" ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2">Tỉnh / Thành phố</label>
                                <select className="w-full p-2 border rounded-lg" disabled>
                                    <option value="Ho Chi Minh">Hồ Chí Minh</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2">Quận/huyện</label>
                                <select className="w-full p-2 border rounded-lg" disabled>
                                    <option value="Hoc Mon">Hóc Môn</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2">Địa chỉ cửa hàng</label>
                            <p className="bg-gray-100 p-2 rounded-lg">{storeAddress}</p>
                        </div>
                    </>
                ) : (
                    <input
                        type="text"
                        name="address"
                        value={customerInfo.address}
                        onChange={handleInputChange}
                        placeholder="Địa chỉ nhận hàng"
                        className="w-full p-2 border rounded-lg mb-4"
                        readOnly={!!userId}
                        required={!userId}
                    />
                )}
            </div>

            {/* Ghi chú */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">Ghi chú khác (nếu có)</h3>
                <textarea
                    className="w-full p-2 border rounded-lg"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Nhập ghi chú"
                />
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">Phương thức thanh toán</h3>
                <select
                    className="w-full p-2 border rounded-lg"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <option value="COD">Thanh toán khi nhận hàng</option>
                    <option value="MoMo">Thanh toán qua MOMO</option>
                </select>
            </div>

            {/* Mã giảm giá */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Mã giảm giá</h3>
                    {!selectedDiscount ? (
                        <button
                            onClick={() => setShowDiscountDialog(true)}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            Chọn mã giảm giá
                        </button>
                    ) : (
                        <button
                            onClick={handleRemoveDiscount}
                            className="text-red-500 hover:text-red-700"
                        >
                            Xóa mã giảm giá
                        </button>
                    )}
                </div>
                {selectedDiscount && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{selectedDiscount.name}</p>
                                <p className="text-sm text-gray-600">
                                    Giảm {selectedDiscount.value}% (Tối đa {selectedDiscount.maxValue.toLocaleString()}đ)
                                </p>
                                <p className="text-green-600 font-medium">-{discountedAmount.toLocaleString()}đ</p>
                            </div>
                            <button onClick={handleRemoveDiscount} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog mã giảm giá */}
            {showDiscountDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-h-[75vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Chọn mã giảm giá</h3>
                            <button onClick={() => setShowDiscountDialog(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            {discountCodes.map((discount) => {
                                const isApplicable = totalAmount >= discount.minPrice;
                                return (
                                    <div
                                        key={discount.id}
                                        className={`border rounded p-3 ${isApplicable ? "hover:bg-gray-50" : "opacity-50"}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-lg">{discount.name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    Giảm {discount.value}% (Tối đa {discount.maxValue.toLocaleString()}đ)
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Đơn tối thiểu {discount.minPrice.toLocaleString()}đ
                                                </p>
                                                {!isApplicable && (
                                                    <p className="text-xs text-red-500">Đơn hàng chưa đủ giá trị tối thiểu</p>
                                                )}
                                            </div>
                                            <button
                                                className={`px-4 py-1.5 rounded text-sm ${isApplicable ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                                                onClick={() => isApplicable && handleSelectDiscount(discount)}
                                                disabled={!isApplicable}
                                            >
                                                {isApplicable ? "Áp dụng" : "Không đủ điều kiện"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Tổng tiền */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">Tổng tiền</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span>{totalAmount.toLocaleString()}đ</span>
                    </div>
                    {selectedDiscount && (
                        <div className="flex justify-between text-green-600">
                            <span>Giảm giá:</span>
                            <span>-{discountedAmount.toLocaleString()}đ</span>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold text-xl">
                        <span>Tổng cộng:</span>
                        <span className="text-red-500">{(totalAmount - discountedAmount).toLocaleString()}đ</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleContinue}
                className="w-full bg-blue-500 text-white p-4 rounded-lg text-center text-lg font-semibold"
            >
                Tiếp tục
            </button>
        </div>
    );
};

export default Checkout;