import { useState, useEffect } from "react";
import AccountSidebar from "../components/AccountSidebar.jsx";
import { Modal, Button, Input, Rate } from "antd";
import axios from "axios";
import { API_URL } from "../config.js";
import { useDispatch, useSelector } from "react-redux";

const MyOrders = () => {
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewingProduct, setReviewingProduct] = useState(null);
    const [reviewContent, setReviewContent] = useState("");
    const [reviewStars, setReviewStars] = useState(0);
    const [userReviews, setUserReviews] = useState([]);

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(5);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [productOrder, setProductOrder] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancellingOrder, setCancellingOrder] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const user = useSelector((state) => state.user);
    const [userId, setUserId] = useState(user?.id);

    useEffect(() => {
        setUserId(user?.id);
    }, [user]);

    const fetchOrders = async (id) => {
        if (!id) {
            setError("User is not logged in");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/Orders/User/${id}`);
            if (!response.ok) {
                throw new Error(await response.text());
            }
            const data = await response.json();
            setOrders(data || []);
            setError(null);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/products`);
                if (response.status === 200) {
                    setProducts(response.data);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };
        fetchProducts();
    }, [userId, refreshTrigger]);

    useEffect(() => {
        if (userId) {
            fetchOrders(userId);
        } else {
            setLoading(false);
        }
    }, [userId]);

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const showOrderDetails = async (order) => {
        try {
            const response = await axios.get(
                `${API_URL}/api/OrderDetails/ByOrder/${order.id}`
            );
            if (response.status === 200) {
                setOrderDetails(response.data);
                setSelectedOrder(order);
                setIsModalVisible(true);
            }
        } catch (error) {
            setError(
                error.response?.data.message || "Failed to load order details"
            );
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedOrder(null);
        setOrderDetails([]);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusStyle = (status) => {
        const styles = {
            "Chờ xác nhận": {
                bg: "bg-yellow-100",
                text: "text-yellow-800",
                border: "border-yellow-200",
            },
            "Đã xác nhận": {
                bg: "bg-blue-100",
                text: "text-blue-800",
                border: "border-blue-200",
            },
            "Đang xử lý": {
                bg: "bg-purple-100",
                text: "text-purple-800",
                border: "border-purple-200",
            },
            "Đang giao hàng": {
                bg: "bg-indigo-100",
                text: "text-indigo-800",
                border: "border-indigo-200",
            },
            "Đã giao hàng": {
                bg: "bg-green-100",
                text: "text-green-800",
                border: "border-green-200",
            },
            "Đã thanh toán": {
                bg: "bg-emerald-100",
                text: "text-emerald-800",
                border: "border-emerald-200",
            },
            "Thanh toán lỗi": {
                bg: "bg-red-100",
                text: "text-red-800",
                border: "border-red-200",
            },
            "Đã hủy": {
                bg: "bg-gray-100",
                text: "text-gray-800",
                border: "border-gray-200",
            },
            "Đã hoàn tiền": {
                bg: "bg-orange-100",
                text: "text-orange-800",
                border: "border-orange-200",
            },
        };
        return styles[status] || styles["Chờ xác nhận"];
    };

    const handleCancelOrder = async (order, e) => {
        e.stopPropagation();
        setCancellingOrder(order);
        setCancelModalVisible(true);
    };

    const handleCancelSubmit = async () => {
        if (!cancelReason.trim()) {
            Modal.error({
                title: "Lỗi",
                content: "Vui lòng nhập lý do hủy đơn hàng",
            });
            return;
        }
        try {
            const response = await axios.put(
                `${API_URL}/api/Orders/${cancellingOrder.id}`,
                {
                    ...cancellingOrder,
                    status: "Đã hủy",
                    cancelReason: cancelReason,
                }
            );
            if (response.status === 204) {
                Modal.success({
                    title: "Thành công",
                    content: "Đơn hàng đã được hủy thành công",
                });
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id !== cancellingOrder.id
                            ? { ...order, status: "Đã hủy" }
                            : order
                    )
                );
                setRefreshTrigger((prev) => prev + 1);
            }
        } catch (error) {
            Modal.error({
                title: "Lỗi",
                content:
                    error.response?.data.message || "Không thể hủy đơn hàng",
            });
        } finally {
            setCancelModalVisible(false);
            setCancelReason("");
            setCancellingOrder(null);
        }
    };

    useEffect(() => {
        const fetchUserReviews = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(
                    `${API_URL}/api/Comments/User/${userId}`
                );
                if (response.status === 200) {
                    setUserReviews(response.data);
                }
            } catch (error) {
                console.error(
                    "Error fetching user reviews:",
                    error.response || error.message
                );
                setUserReviews([]);
            }
        };
        fetchUserReviews();
    }, [userId, refreshTrigger]);

    const handleOpenReviewModal = (product) => {
        const existingReview = userReviews.find(
            (review) =>
                review.productId === product.id && review.userId === userId
        );
        if (existingReview) {
            setReviewStars(existingReview.stars);
            setReviewContent(existingReview.content);
        } else {
            setReviewStars(0);
            setReviewContent("");
        }
        setReviewingProduct(product);
        setReviewModalVisible(true);
    };

    const handleSubmitReview = async () => {
        if (!reviewStars || !reviewContent.trim()) {
            Modal.error({
                title: "Lỗi",
                content: "Vui lòng nhập nội dung và đánh giá sao.",
            });
            return;
        }

        try {
            const existingReview = userReviews.find(
                (review) =>
                    review.productId === reviewingProduct.id &&
                    review.userId === userId
            );

            if (existingReview) {
                const response = await axios.put(
                    `${API_URL}/api/Comments/${existingReview.id}`,
                    {
                        ...existingReview,
                        stars: reviewStars,
                        content: reviewContent,
                    }
                );

                if (response.status === 204) {
                    Modal.success({
                        title: "Thành công",
                        content: "Đánh giá của bạn đã được cập nhật.",
                    });
                    setUserReviews((prevReviews) =>
                        prevReviews.map((review) =>
                            review.id === existingReview.id
                                ? {
                                      ...review,
                                      stars: reviewStars,
                                      content: reviewContent,
                                  }
                                : review
                        )
                    );
                    setRefreshTrigger((prev) => prev + 1); // Trigger refetch
                }
            } else {
                const response = await axios.post(`${API_URL}/api/Comments`, {
                    productId: reviewingProduct.id,
                    userId: userId,
                    name: user.name,
                    stars: reviewStars,
                    content: reviewContent,
                });

                Modal.success({
                    title: "Thành công",
                    content: "Đánh giá của bạn đã được gửi.",
                });

                setUserReviews((prevReviews) => [
                    ...prevReviews,
                    response.data,
                ]);
                setRefreshTrigger((prev) => prev + 1);
            }

            setReviewModalVisible(false);
            setReviewContent("");
            setReviewStars(0);
            setReviewingProduct(null);
        } catch (error) {
            Modal.error({
                title: "Lỗi",
                content: "Không thể gửi đánh giá. Vui lòng thử lại sau.",
            });
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-[690px] bg-gray-100 p-5 mb-20">
            <AccountSidebar />
            <div className="flex-1 ml-0 md:ml-10 bg-white p-6 rounded-lg shadow-lg overflow-y-auto">
                <h1 className="text-2xl font-semibold mb-6 text-blue-800">
                    Lịch sử giao dịch
                </h1>
                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p className="text-red-600">Error: {error}</p>
                ) : orders.length === 0 ? (
                    <p className="text-center text-lg">
                        Bạn không có đơn hàng nào.
                    </p>
                ) : (
                    <>
                        <ul className="grid gap-5">
                            {currentOrders.map((order) => {
                                const statusStyle = getStatusStyle(
                                    order.status
                                );
                                const canCancel = ![
                                    "Đã hủy",
                                    "Đã giao hàng",
                                    "Đang giao hàng",
                                    "Đã hoàn tiền",
                                ].includes(order.status);

                                return (
                                    <li
                                        key={order.id}
                                        className="bg-white border border-gray-200 p-6 rounded-lg hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        onClick={() => showOrderDetails(order)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-lg font-semibold text-gray-800">
                                                    Mã đơn hàng: #{order.id}
                                                </p>
                                                <p className="text-lg text-gray-600">
                                                    Tổng tiền:{" "}
                                                    {formatCurrency(
                                                        order.totalPrice
                                                    )}
                                                </p>
                                                <p className="text-md text-gray-500">
                                                    Ngày đặt:{" "}
                                                    {formatDate(
                                                        order.createdAt
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div
                                                    className={`px-4 py-2 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                                                >
                                                    {order.status}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    showOrderDetails(order);
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                                            >
                                                Xem chi tiết
                                            </button>
                                            {canCancel && (
                                                <button
                                                    onClick={(e) =>
                                                        handleCancelOrder(
                                                            order,
                                                            e
                                                        )
                                                    }
                                                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-300"
                                                >
                                                    Hủy đơn hàng
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Pagination controls */}
                        <div className="flex justify-between items-center mt-6">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
                            >
                                Trang trước
                            </button>
                            <span>Trang {currentPage}</span>
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={indexOfLastOrder >= orders.length}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-300"
                            >
                                Trang sau
                            </button>
                        </div>

                        {/* Modal for order details */}
                        {selectedOrder && (
                            <Modal
                                title={`Chi tiết đơn hàng #${selectedOrder.id}`}
                                open={isModalVisible}
                                onCancel={handleCancel}
                                footer={null}
                                width={800}
                                className="rounded-lg"
                            >
                                <div className="p-6 bg-white rounded-lg">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-gray-600">
                                                Thời gian đặt hàng
                                            </p>
                                            <p className="font-semibold">
                                                {formatDate(
                                                    selectedOrder.createdAt
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                Trạng thái
                                            </p>
                                            <p
                                                className={`font-semibold ${
                                                    getStatusStyle(
                                                        selectedOrder.status
                                                    ).text
                                                } ${
                                                    getStatusStyle(
                                                        selectedOrder.status
                                                    ).bg
                                                } px-3 py-1 rounded-full inline-block mt-1`}
                                            >
                                                {selectedOrder.status}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                Tổng giá
                                            </p>
                                            <p className="font-semibold">
                                                {formatCurrency(
                                                    selectedOrder.totalPrice
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                Địa chỉ giao hàng
                                            </p>
                                            <p className="font-semibold">
                                                {selectedOrder.address}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">
                                                Phương thức thanh toán
                                            </p>
                                            <p className="font-semibold">
                                                {selectedOrder.paymentMethod}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Table for order items */}
                                    <h3 className="text-xl font-semibold mb-4">
                                        Sản phẩm trong đơn hàng:
                                    </h3>
                                    <table className="min-w-full bg-gray-100 rounded-md shadow-md">
                                        <thead className="bg-blue-200">
                                            <tr>
                                                <th className="border px-4 py-2 text-left">
                                                    Mã sản phẩm
                                                </th>
                                                <th className="border px-4 py-2 text-left">
                                                    Tên sản phẩm
                                                </th>
                                                <th className="border px-4 py-2 text-left">
                                                    Số lượng
                                                </th>
                                                <th className="border px-4 py-2 text-left">
                                                    Giá
                                                </th>
                                                {selectedOrder.status ===
                                                    "Đã giao hàng" && (
                                                    <th className="border px-4 py-2 text-left">
                                                        Đánh giá
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderDetails.map((detail) => {
                                                const product = products.find(
                                                    (prod) =>
                                                        prod.id ===
                                                        detail.productId
                                                );
                                                const userReview =
                                                    userReviews.find(
                                                        (review) =>
                                                            review.productId ===
                                                            detail.productId
                                                    );
                                                return (
                                                    <tr
                                                        key={detail.id}
                                                        className="hover:bg-gray-200 transition-colors duration-200"
                                                    >
                                                        <td className="border px-4 py-2">
                                                            {detail.productId}
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            {product
                                                                ? product.name
                                                                : "Unknown Product"}
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            {detail.quantity}
                                                        </td>
                                                        <td className="border px-4 py-2">
                                                            {formatCurrency(
                                                                detail.price
                                                            )}
                                                        </td>
                                                        {selectedOrder.status ===
                                                            "Đã giao hàng" && (
                                                            <td className="border px-4 py-2">
                                                                {userReviews.find(
                                                                    (review) =>
                                                                        review.productId ===
                                                                            detail.productId &&
                                                                        review.userId ===
                                                                            userId
                                                                ) ? (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleOpenReviewModal(
                                                                                products.find(
                                                                                    (
                                                                                        prod
                                                                                    ) =>
                                                                                        prod.id ===
                                                                                        detail.productId
                                                                                )
                                                                            )
                                                                        }
                                                                    >
                                                                        <Rate
                                                                            value={
                                                                                userReviews.find(
                                                                                    (
                                                                                        review
                                                                                    ) =>
                                                                                        review.productId ===
                                                                                            detail.productId &&
                                                                                        review.userId ===
                                                                                            userId
                                                                                )
                                                                                    .stars
                                                                            }
                                                                            allowHalf
                                                                            disabled
                                                                        />
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() =>
                                                                            handleOpenReviewModal(
                                                                                products.find(
                                                                                    (
                                                                                        prod
                                                                                    ) =>
                                                                                        prod.id ===
                                                                                        detail.productId
                                                                                )
                                                                            )
                                                                        }
                                                                        className="text-yellow-500 hover:text-yellow-600"
                                                                    >
                                                                        <Rate
                                                                            allowClear={
                                                                                true
                                                                            }
                                                                        />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </Modal>
                        )}

                        {/* Modal for writing reviews */}
                        <Modal
                            title={`Đánh giá sản phẩm: ${reviewingProduct?.name}`}
                            open={reviewModalVisible}
                            onCancel={() => setReviewModalVisible(false)}
                            footer={[
                                <Button
                                    key="cancel"
                                    onClick={() => setReviewModalVisible(false)}
                                >
                                    Hủy
                                </Button>,
                                <Button
                                    key="submit"
                                    type="primary"
                                    onClick={handleSubmitReview}
                                >
                                    {userReviews.find(
                                        (review) =>
                                            review.productId ===
                                            reviewingProduct?.id
                                    )
                                        ? "Cập nhật đánh giá"
                                        : "Gửi đánh giá"}
                                </Button>,
                            ]}
                        >
                            <div className="space-y-4">
                                <Rate
                                    value={reviewStars}
                                    onChange={(value) => setReviewStars(value)}
                                    allowHalf
                                />
                                <Input.TextArea
                                    value={reviewContent}
                                    onChange={(e) =>
                                        setReviewContent(e.target.value)
                                    }
                                    placeholder="Nhập nội dung đánh giá"
                                    rows={4}
                                />
                            </div>
                        </Modal>

                        {/* Modal hủy đơn hàng */}
                        <Modal
                            title="Hủy đơn hàng"
                            open={cancelModalVisible}
                            onCancel={() => {
                                setCancelModalVisible(false);
                                setCancelReason("");
                                setCancellingOrder(null);
                            }}
                            footer={[
                                <Button
                                    key="back"
                                    onClick={() => setCancelModalVisible(false)}
                                >
                                    Đóng
                                </Button>,
                                <Button
                                    key="submit"
                                    type="primary"
                                    danger
                                    onClick={handleCancelSubmit}
                                >
                                    Xác nhận hủy
                                </Button>,
                            ]}
                        >
                            <div className="space-y-4">
                                <p>Bạn có chắc chắn muốn hủy đơn hàng này?</p>
                                <div>
                                    <p className="mb-2">Lý do hủy đơn:</p>
                                    <Input.TextArea
                                        value={cancelReason}
                                        onChange={(e) =>
                                            setCancelReason(e.target.value)
                                        }
                                        placeholder="Vui lòng nhập lý do hủy đơn hàng"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </Modal>
                    </>
                )}  
            </div>
        </div>
    );
};

export default MyOrders;
