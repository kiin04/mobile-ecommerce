import { useState, useEffect } from "react";
import { API_URL } from "../config.js";
import { useLocation, useNavigate } from "react-router-dom";
import { notification } from "antd";
import PathNames from "../PathNames.js";
import { useSelector } from "react-redux";

const CheckoutBuyNow = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const userId = user?.id;
    const initialCartItems = location.state?.cartItems || (location.state?.product ? [location.state.product] : []);
    const [cartItems, setCartItems] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
    const [customerInfo, setCustomerInfo] = useState({
        name: user?.name || "",
        email: localStorage.getItem("email") || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });
    const [shippingOption, setShippingOption] = useState("store");
    const [totalAmount, setTotalAmount] = useState(0);
    const [notes, setNotes] = useState("");
    const [showDiscountDialog, setShowDiscountDialog] = useState(false);
    const [discountCodes, setDiscountCodes] = useState([]);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [discountedAmount, setDiscountedAmount] = useState(0);

    // Lấy thông tin sản phẩm và thông tin màu sắc/kích thước
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (initialCartItems.length === 0) {
                navigate(PathNames.CART);
                return;
            }

            const updatedCartItems = await Promise.all(
                initialCartItems.map(async (item) => {
                    let updatedItem = { ...item };

                    // Lấy thông tin name và image từ API /api/Products/:id
                    try {
                        const productResponse = await fetch(`${API_URL}/api/Products/${item.productId}`);
                        if (productResponse.ok) {
                            const productData = await productResponse.json();
                            updatedItem = {
                                ...updatedItem,
                                name: productData.name || "Không có tên",
                                image: productData.image || null,
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching product ${item.productId}:`, error);
                    }

                    // Lấy thông tin color và size từ API /api/ColorSizes/:colorSizeId
                    try {
                        const colorSizeResponse = await fetch(`${API_URL}/api/ColorSizes/${item.colorSizeId}`);
                        if (colorSizeResponse.ok) {
                            const colorSizeData = await colorSizeResponse.json();
                            updatedItem = {
                                ...updatedItem,
                                color: colorSizeData.color || "Không có màu",
                                size: colorSizeData.size || "Không có kích thước",
                            };
                        }
                    } catch (error) {
                        console.error(`Error fetching colorSize ${item.colorSizeId}:`, error);
                        updatedItem = {
                            ...updatedItem,
                            color: "Không có màu",
                            size: "Không có kích thước",
                        };
                    }

                    return updatedItem;
                })
            );

            console.log("Updated cartItems:", updatedCartItems); // Log để kiểm tra dữ liệu
            setCartItems(updatedCartItems);
            const initialTotal = updatedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            setTotalAmount(initialTotal);
        };

        fetchProductDetails();
    }, [initialCartItems, navigate]);

    // Lấy danh sách mã giảm giá
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
        const initialTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discountAmount = Math.min(
            Math.floor((initialTotal * discount.value) / 100),
            discount.maxValue
        );
        setDiscountedAmount(discountAmount);
        setTotalAmount(initialTotal - discountAmount);
        setShowDiscountDialog(false);
    };

    const handleRemoveDiscount = () => {
        setSelectedDiscount(null);
        setDiscountedAmount(0);
        const initialTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalAmount(initialTotal);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleContinue = async () => {
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

        const finalAmount = totalAmount;
        let userIdToUse = userId;

        try {
            if (!userIdToUse) {
                const response = await fetch(`${API_URL}/api/Users/CheckUser/${customerInfo.phone}`);
                if (response.status === 404) {
                    const formData = new FormData();
                    formData.append("Name", customerInfo.name);
                    formData.append("Phone", customerInfo.phone);
                    formData.append("Address", customerInfo.address || storeAddress);
                    formData.append("Role", "1");
                    formData.append("TotalBuy", "0");

                    const createUserResponse = await fetch(`${API_URL}/api/Users`, {
                        method: "POST",
                        body: formData,
                    });
                    if (createUserResponse.status === 201) {
                        const createdUser = await createUserResponse.json();
                        userIdToUse = createdUser.id;
                        notification.success({
                            message: "Thành công!",
                            description: "Người dùng mới đã được tạo.",
                            duration: 4,
                            placement: "bottomLeft",
                        });
                    } else {
                        throw new Error("Không thể tạo người dùng mới");
                    }
                } else if (response.status === 200) {
                    const userCheck = await response.json();
                    userIdToUse = userCheck.id;
                }
            }

            const paymentData = {
                userId: userIdToUse,
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
                orderDetails: cartItems.map(item => ({
                    productId: item.productId,
                    colorSizeId: item.colorSizeId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            };
            if (paymentMethod === "MoMo") {
                try {
                    // Gọi API tạo thanh toán MOMO
                    const paymentResponse = await fetch(`${API_URL}/api/Payment/create-payment`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            amount: finalAmount,
                            orderInfo: `Thanh toán đơn hàng cho ${customerInfo.name}`,
                        }),
                    });

                    const result = await paymentResponse.json();

                    if (!paymentResponse.ok) {
                        throw new Error(
                            result.message || "Lỗi kết nối đến cổng thanh toán"
                        );
                    }

                    if (result.payUrl) {
                        localStorage.setItem("pendingOrder", JSON.stringify({
                            userId:userId,
                            totalPrice: finalAmount,
                            paymentMethod:paymentMethod,
                            phone: customerInfo.phone,
                            note: notes,
                            address:
                                shippingOption === "store" ? storeAddress : customerInfo.address,
                            status: "Đã thanh toán",
                            cartItems:[cartItems],
                        }));
                        // Chuyển hướng đến trang thanh toán MOMO
                        window.location.href = result.payUrl;
                    } else {

                        throw new Error("Không nhận được URL thanh toán");
                    }
                } catch (error) {
                    console.error("Lỗi khi xử lý thanh toán:", error);
                    notification.error({
                        message: "Lỗi thanh toán",
                        description:
                            error.message || "Có lỗi xảy ra khi xử lý thanh toán",
                        duration: 4,
                        placement: "bottomLeft",
                    });
                }
            } else{
                const orderResponse = await fetch(`${API_URL}/api/Orders`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(paymentData),
                });

                if (!orderResponse.ok) {
                    const errorData = await orderResponse.json();
                    const errorMessages = Object.entries(errorData.errors || {}).map(([field, messages]) => `${field}: ${messages.join(", ")}`).join("; ");
                    throw new Error(errorMessages || "Lỗi khi tạo đơn hàng");
                }

                if (!userId) {
                    localStorage.removeItem("localCart");
                }

                notification.success({
                    message: "Thành công!",
                    description: "Đơn hàng mới đã được tạo.",
                    duration: 4,
                    placement: "bottomLeft",
                });
                navigate(userId ? PathNames.MY_ORDERS : "/");
            }

        } catch (error) {
            console.error("Lỗi trong quá trình xử lý:", error);
            notification.error({
                message: "Thất bại",
                description: error.message || "Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.",
                duration: 4,
                placement: "bottomLeft",
            });
        }
    };

    const storeAddress = "806 QL22, ấp Mỹ Hoà 3, Hóc Môn, Hồ Chí Minh";

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Thông tin đặt hàng</h2>

            {/* Thông tin khách hàng */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">Thông tin khách hàng</h3>
                {userId ? (
                    <>
                        <p>Tên: {customerInfo.name}</p>
                        <p>Email: {customerInfo.email}</p>
                        <p>Số điện thoại: {customerInfo.phone}</p>
                    </>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block mb-2">Tên:</label>
                            <input
                                type="text"
                                name="name"
                                className="w-full p-2 border rounded-lg"
                                value={customerInfo.name}
                                onChange={handleInputChange}
                                placeholder="Nhập tên của bạn"
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Số điện thoại:</label>
                            <input
                                type="text"
                                name="phone"
                                className="w-full p-2 border rounded-lg"
                                value={customerInfo.phone}
                                onChange={handleInputChange}
                                placeholder="Nhập số điện thoại của bạn"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Hiển thị danh sách sản phẩm */}
            {cartItems.length > 0 ? (
                cartItems.map((item) => (
                    <div key={`${item.productId}-${item.colorSizeId}`} className="bg-white p-4 rounded-lg shadow mb-4">
                        <div className="flex items-center">
                            <img
                                src={item.image ? `data:image/jpeg;base64,${item.image}` : "/default-image.jpg"}
                                alt={item.name || "Sản phẩm"}
                                className="w-20 h-20 object-cover"
                            />
                            <div className="ml-4">
                            <h3 className="text-lg font-semibold">
                            {item.name } - {item.color} - {item.size}
                            </h3>
                                <p className="text-red-500">{item.price.toLocaleString()}đ</p>
                                <p>Số lượng: {item.quantity}</p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>Không có sản phẩm để hiển thị.</p>
            )}

            {/* Thông tin nhận hàng */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">Thông tin nhận hàng</h3>
                <div className="flex items-center space-x-8 mb-4">
                    <div className="flex items-center cursor-pointer" onClick={() => setShippingOption("store")}>
                        <div className={`w-5 h-5 rounded-full border-2 ${shippingOption === "store" ? "border-blue-500 bg-blue-500" : "border-gray-500"} mr-2 flex items-center justify-center`}>
                            {shippingOption === "store" && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                        </div>
                        <label className="text-gray-800">Nhận tại cửa hàng</label>
                    </div>
                    <div className="flex items-center cursor-pointer" onClick={() => setShippingOption("delivery")}>
                        <div className={`w-5 h-5 rounded-full border-2 ${shippingOption === "delivery" ? "border-blue-500 bg-blue-500" : "border-gray-500"} mr-2 flex items-center justify-center`}>
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
                    <>
                        <label className="block mb-2">Địa chỉ nhận hàng</label>
                        {userId ? (
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg mb-4"
                                value={customerInfo.address}
                                onChange={handleInputChange}
                            />
                        ) : (
                            <input
                                type="text"
                                name="address"
                                className="w-full p-2 border rounded-lg"
                                value={customerInfo.address}
                                onChange={handleInputChange}
                                placeholder="Nhập địa chỉ của bạn"
                            />
                        )}
                    </>
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
                    <option value="Tiền mặt">Tiền mặt</option>
                    <option value="MoMo">Thanh toán qua MOMO</option>
                    <option value="PayPal">Thanh toán qua PAYPAL</option>
                </select>
            </div>

            {/* Mã giảm giá */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Mã giảm giá</h3>
                    {!selectedDiscount ? (
                        <button onClick={() => setShowDiscountDialog(true)} className="text-blue-500 hover:text-blue-700">
                            Chọn mã giảm giá
                        </button>
                    ) : (
                        <button onClick={handleRemoveDiscount} className="text-red-500 hover:text-red-700">
                            Xóa mã giảm giá
                        </button>
                    )}
                </div>
                {selectedDiscount && (
                    <div className="mt-2 p-2 bg-blue-50 rounded">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="font-medium">{selectedDiscount.name}</p>
                                <p className="text-sm text-gray-600">Giảm {selectedDiscount.value}% (Tối đa {selectedDiscount.maxValue.toLocaleString()}đ)</p>
                                <p className="text-green-600 font-medium">-{discountedAmount.toLocaleString()}đ</p>
                            </div>
                            <button onClick={handleRemoveDiscount} className="text-gray-500 hover:text-gray-700">✕</button>
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
                            <button onClick={() => setShowDiscountDialog(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                        </div>
                        <div className="space-y-4">
                            {discountCodes.map((discount) => {
                                const initialTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
                                const isApplicable = initialTotal >= discount.minPrice;
                                return (
                                    <div key={discount.id} className={`border rounded p-3 ${isApplicable ? "hover:bg-gray-50" : "opacity-50"}`}>
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h4 className="font-semibold text-lg">{discount.name}</h4>
                                                <p className="text-sm text-gray-600">Giảm {discount.value}% (Tối đa {discount.maxValue.toLocaleString()}đ)</p>
                                                <p className="text-xs text-gray-500">Đơn tối thiểu {discount.minPrice.toLocaleString()}đ</p>
                                                {!isApplicable && <p className="text-xs text-red-500">Đơn hàng chưa đủ giá trị tối thiểu</p>}
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
                        <span>{cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}đ</span>
                    </div>
                    {selectedDiscount && (
                        <div className="flex justify-between text-green-600">
                            <span>Giảm giá:</span>
                            <span>-{discountedAmount.toLocaleString()}đ</span>
                        </div>
                    )}
                    <div className="flex justify-between font-semibold text-xl">
                        <span>Tổng cộng:</span>
                        <span className="text-red-500">{totalAmount.toLocaleString()}đ</span>
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

export default CheckoutBuyNow;