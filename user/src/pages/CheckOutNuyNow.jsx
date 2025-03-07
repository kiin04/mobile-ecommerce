import { useState } from "react";
import { API_URL } from "../config.js";
import { useLocation, useNavigate } from "react-router-dom";
import { notification, message } from "antd";
import PathNames from "../PathNames.js";
import { useDispatch, useSelector } from "react-redux";
const CheckoutBuyNow = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    console.log("user", user);
    const userId = user?.id;
    const productBuyNow = location.state?.product;
    const [paymentMethod, setPaymentMethod] = useState("Tiền mặt");
    const [accounts, setAccount] = useState([]);
    console.log("productBuyNow", productBuyNow);
    const [customerInfo, setCustomerInfo] = useState({
        name: user.name || "",
        email: localStorage.getItem("email"),
        phone: user.phone || "",
        address: user.address || "",
    });
    const [shippingOption, setShippingOption] = useState("store");
    const [totalAmount, setTotalAmount] = useState(productBuyNow?.price);
    const [notes, setNotes] = useState(""); // Lưu trữ ghi chú từ người dùng

    const handleContinue = async () => {
        const finalAmount = totalAmount;

        try {
            let userIdToUse = userId;

            if (userIdToUse == null) {
                // Gửi yêu cầu kiểm tra số điện thoại
                const response = await fetch(
                    `${API_URL}/api/Users/CheckUser/${customerInfo.phone}`
                );

                if (response.status === 404) {
                    // Không tìm thấy người dùng, tạo mới
                    const formData = new FormData();
                    formData.append("Name", customerInfo.name);
                    formData.append("Phone", customerInfo.phone);
                    formData.append(
                        "Address",
                        customerInfo.address || storeAddress
                    );
                    formData.append("Role", "1");
                    formData.append("TotalBuy", "0");

                    const createUserResponse = await fetch(
                        `${API_URL}/api/Users`,
                        {
                            method: "POST",
                            body: formData,
                        }
                    );
                    if (createUserResponse.status === 201) {
                        const createdUser = await createUserResponse.json();
                        userIdToUse = createdUser.id; // Lấy id của người dùng vừa tạo

                        notification.success({
                            message: "Thành công!",
                            description: "Người dùng mới đã được tạo.",
                            duration: 4,
                            placement: "bottomRight",
                        });
                    } else {
                        notification.error({
                            message: 'Thất bại',
                            description: 'Đã xảy ra lỗi khi tạo người dùng. Vui lòng thử lại.',
                            duration: 4,
                            placement: "bottomRight",
                            showProgress: true,
                            pauseOnHover: true
                        });
                        return; // Dừng quá trình nếu không tạo được user
                    }
                } else if (response.status === 200) {
                    // Người dùng đã tồn tại trong hệ thống và có tài khoản
                    const userCheck = await response.json();
                    const responseAccount = await fetch(
                        `${API_URL}/api/Accounts/CheckUser/${userCheck.id}`
                    );
                    if (responseAccount.status === 200) {
                        notification.warning({
                            message: "Lỗi",
                            description:
                                "Người dùng đã tồn tại, vui lòng đăng nhập",
                            duration: 4,
                            placement: "bottomRight",
                        });
                    } else {
                        // Người dùng chưa có tài khoản
                        const createAccount = confirm(
                            "Bạn đã từng mua hàng nhưng chưa có tài khoản. Bạn có muốn tạo tài khoản để hưởng ưu đãi không?"
                        );

                        if (createAccount) {
                            // Chuyển hướng sang trang đăng ký
                            window.location.href = "/register";
                            return; // Dừng xử lý để người dùng đăng ký
                        }
                    }
                    userIdToUse = userCheck.id; // Lấy id của người dùng đã tồn tại
                }
            }

            // Tạo dữ liệu đơn hàng
            const paymentData = {
                userId: userIdToUse,
                name: customerInfo.name,
                totalPrice: finalAmount,
                paymentMethod: paymentMethod,
                phone: customerInfo.phone,
                paymentStatus: "Chưa thanh toán",
                status: "Chờ xác nhận",
                address:
                    shippingOption === "store"
                        ? storeAddress
                        : customerInfo.address,
            };

            // Gửi yêu cầu tạo đơn hàng
            const orderResponse = await fetch(`${API_URL}/api/Orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(paymentData),
            });

            if (orderResponse.status === 201) {
                const orderRes = await orderResponse.json();
                const orderDetail = {
                    orderId: orderRes.id,
                    colorSizeId: productBuyNow.colorSizeId,
                    quantity: productBuyNow.quantity,
                    price: productBuyNow.price,
                    productId: productBuyNow.productId,
                };
                const orderDetailResponse = await fetch(
                    `${API_URL}/api/OrderDetails`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(orderDetail),
                    }
                );
                if (orderDetailResponse.status === 201) {
                    notification.success({
                        message: "Thành công!",
                        description: "Đơn hàng mới đã được tạo",
                        duration: 4,
                        placement: "bottomRight",
                    });
                    navigate("/my-orders");
                }
            } else {
                notification.error({
                    message: 'Thất bại',
                    description: 'Đã xảy ra lỗi khi tạo đơn hàng. Vui lòng thử lại.',
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
            }
        } catch (error) {
            console.error("Lỗi trong quá trình xử lý:", error);
            message.error("Đã xảy ra lỗi. Vui lòng thử lại sau.");
        }
    };

    const storeAddress = "806 QL22, ấp Mỹ Hoà 3, Hóc Môn, Hồ Chí Minh";

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-4">Thông tin đặt hàng</h2>

            {/* Hiển thị thông tin khách hàng */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">
                    Thông tin khách hàng
                </h3>
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
                                className="w-full p-2 border rounded-lg"
                                value={customerInfo.name}
                                onChange={(e) =>
                                    setCustomerInfo({
                                        ...customerInfo,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Nhập tên của bạn"
                            />
                        </div>

                        <div>
                            <label className="block mb-2">Số điện thoại:</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={customerInfo.phone}
                                onChange={(e) =>
                                    setCustomerInfo({
                                        ...customerInfo,
                                        phone: e.target.value,
                                    })
                                }
                                placeholder="Nhập số điện thoại của bạn"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center">
                <img
                    src={
                        productBuyNow?.image
                            ? `data:image/jpeg;base64,${productBuyNow.image}`
                            : "/default-image.jpg"
                    }
                    alt={productBuyNow.name}
                    className="w-20 h-20 object-cover"
                />
                <div className="ml-4">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold">
                            {productBuyNow.name}
                        </h3>
                        <p className="text-lg">
                            {productBuyNow?.color} - {productBuyNow?.size}
                        </p>
                    </div>

                    <p className="text-red-500">
                        {productBuyNow.price.toLocaleString()}{" "}
                        {/* <span className="line-through text-gray-500">
                            {productBuyNow.price
                                ?.toLocaleString()}
                        </span> */}
                    </p>
                    <p>Số lượng: {productBuyNow.quantity}</p>
                </div>
            </div>

            {/* Thông tin giao / nhận hàng */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">
                    Thông tin nhận hàng
                </h3>
                <div className="flex items-center space-x-8 mb-4">
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => setShippingOption("store")}
                    >
                        <div
                            className={`w-5 h-5 rounded-full border-2 ${
                                shippingOption === "store"
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-500"
                            } mr-2 flex items-center justify-center`}
                        >
                            {shippingOption === "store" && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                            )}
                        </div>
                        <label className="text-gray-800">
                            Nhận tại cửa hàng
                        </label>
                    </div>
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={() => setShippingOption("delivery")}
                    >
                        <div
                            className={`w-5 h-5 rounded-full border-2 ${
                                shippingOption === "delivery"
                                    ? "border-blue-500 bg-blue-500"
                                    : "border-gray-500"
                            } mr-2 flex items-center justify-center`}
                        >
                            {shippingOption === "delivery" && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                            )}
                        </div>
                        <label className="text-gray-800">
                            Giao hàng tận nơi
                        </label>
                    </div>
                </div>
                {shippingOption === "store" ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2">
                                    Tỉnh / Thành phố
                                </label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    disabled
                                >
                                    <option value="Ho Chi Minh">
                                        Hồ Chí Minh
                                    </option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2">Quận/huyện</label>
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    disabled
                                >
                                    <option value="Hoc Mon">Hóc Môn</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block mb-2">
                                Địa chỉ cửa hàng
                            </label>
                            <p className="bg-gray-100 p-2 rounded-lg">
                                {storeAddress}
                            </p>
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
                                readOnly
                            />
                        ) : (
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg"
                                value={customerInfo.address}
                                onChange={(e) =>
                                    setCustomerInfo({
                                        ...customerInfo,
                                        address: e.target.value,
                                    })
                                }
                                placeholder="Nhập địa chỉ của bạn"
                            />
                        )}
                    </>
                )}
            </div>

            {/* Thêm ghi chú */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">
                    Ghi chú khác (nếu có)
                </h3>
                <textarea
                    className="w-full p-2 border rounded-lg"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)} // Cập nhật ghi chú
                    placeholder="Nhập ghi chú"
                />
            </div>

            {/* Dropdown phương thức thanh toán */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">
                    Phương thức thanh toán
                </h3>
                <select
                    className="w-full p-2 border rounded-lg"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <option value="Tiền mặt">Tiền mặt</option>

                    <option value="MoMo">Thanh toán qua MOMO</option>
                    <option value="Thanh toán qua VNpay">
                        Thanh toán qua VNpay
                    </option>
                </select>
            </div>

            {/* Cập nhật phần tổng tiền */}
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <h3 className="text-lg font-semibold mb-2">Tổng tiền</h3>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>Tạm tính:</span>
                        <span>{totalAmount.toLocaleString()}đ</span>
                    </div>

                    <div className="flex justify-between font-semibold text-xl">
                        <span>Tổng cộng:</span>
                        <span className="text-red-500">
                            {totalAmount.toLocaleString()}đ
                        </span>
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
