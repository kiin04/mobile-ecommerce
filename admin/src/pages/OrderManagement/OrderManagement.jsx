import { useState, useEffect } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Button,
    TextField,
    Pagination,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import apiConfigInstance from "../../../SingletonParttern.js";
const API_URL = apiConfigInstance.getApiUrl();
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { notification } from "antd";

const OrderManagement = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [colorSizes, setColorsizes] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""); // Search query state
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Orders`);
            console.log("res order", response);
            if (response.status == 200) {
                const data = response.data;
                setOrders(data);
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };
    const fetchOrderDetail = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/OrderDetails`);
            if (response.status == 200) {
                const data = response.data;
                setOrderDetails(data);
            } else {
                console.error("Failed to fetch orders");
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };
    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Products`);
            if (response.status === 200) {
                const data = response.data;
                setProducts(data);
            } else {
                console.error(
                    `Failed to fetch products: ${response.status} ${response.statusText}`
                );
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    const fetchColorSizes = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/ColorSizes`);
            if (response.status === 200) {
                const data = response.data;
                setColorsizes(data);
            } else {
                console.error(
                    `Failed to fetch products: ${response.status} ${response.statusText}`
                );
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    useEffect(() => {
        fetchProducts();
        fetchOrderDetail();
        fetchOrders();
        fetchColorSizes();
    }, []);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setSelectedOrderDetails(
            orderDetails.filter((od) => od.orderId === order.id)
        );
    };

    const handleCloseDialog = () => {
        setSelectedOrder(null);
    };

    const handleDeleteOrder = async (orderId) => {
        try {
            const response = await fetch(`${API_URL}/api/Orders/${orderId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setOrders(orders.filter((order) => order.id !== orderId));
                notification.success({
                    message: 'Thành công',
                    description: 'Đơn hàng được xóa thành công.',
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
            } else {
                console.error("Failed to delete order");
                notification.error({
                    message: 'Thất bại',
                    description: 'Thất bại khi xóa đơn hàng.',
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
            }
        } catch (error) {
            console.error("Error deleting order:", error);
            notification.error({
                message: 'Thất bại',
                description: "Lỗi xảy ra khi xóa đơn hàng:", error,
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true
            });
        }
    };

    const handleEditOrderStatus = (orderId) => {
        navigate(`/edit-order/${orderId}`);
    };

    const handleAddOrder = () => {
        navigate("/add-order");
    };

    // Function to determine color based on status
    const getStatusColor = (status) => {
        switch (status) {
            case "Đã thanh toán":
                return { color: "blue" };
            case "Đã xác nhận":
                return { color: "green" };
            case "Đã giao hàng":
                return { color: "green" };
            case "Đã hủy":
                return { color: "red" };
            default:
                return { color: "orange" };
        }
    };

    // Filter orders based on the search query
    // const filteredOrders = orders.filter(order =>
    //   order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    //   order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
    // );

    // Tính toán phân trang
    // const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
    // const paginatedOrders = filteredOrders.slice(
    //   (page - 1) * rowsPerPage,
    //   page * rowsPerPage
    // );
    const totalPages = Math.ceil(orders.length / rowsPerPage);
    const paginatedOrders = orders.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const getProduct = (proId) => {
        console.log(
            "product of order detail",
            products.filter((item) => item.id === proId)
        );
        return products.filter((item) => item.id === proId);
    };
    const getColors = (colorId) => {
        return colorSizes.filter((item) => item.id === colorId);
    };
    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Quản lý đơn hàng
            </Typography>

            {/* Search Bar */}
            <TextField
                label="Nhập mã order hoặc tên khách hàng"
                variant="outlined"
                fullWidth
                value={searchQuery}
                onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1); // Reset về trang 1 khi tìm kiếm
                }}
                style={{ marginBottom: "20px" }}
            />

            {/* Add Order Button */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleAddOrder}
                style={{ marginBottom: "20px" }}
            >
                Thêm đơn đặt hàng
            </Button>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên khách hàng</TableCell>
                            <TableCell>Địa chỉ giao hàng</TableCell>
                            <TableCell>Ngày đặt hàng</TableCell>

                            <TableCell>Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell>{order?.name}</TableCell>
                                <TableCell>{order?.address}</TableCell>
                                {/* Format date as dd/MM/yyyy */}
                                <TableCell>
                                    {new Date(
                                        order.createdAt
                                    ).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell>
                                    {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    }).format(order?.totalPrice)}
                                </TableCell>
                                <TableCell style={getStatusColor(order.status)}>
                                    {order.status}
                                </TableCell>
                                <TableCell>
                                    <Box
                                        display="flex"
                                        justifyContent="space-between"
                                    >
                                        <IconButton
                                            onClick={() =>
                                                handleViewDetails(order)
                                            }
                                            color="primary"
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            onClick={() =>
                                                handleEditOrderStatus(order.id)
                                            }
                                            color="secondary"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            onClick={() =>
                                                handleDeleteOrder(order.id)
                                            }
                                            color="error"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" marginTop={2}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>

            {selectedOrder && (
                <Dialog
                    open={true}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle
                        sx={{
                            borderBottom: "1px solid #e0e0e0",
                            padding: "16px 24px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6">
                            Chi tiết đơn hàng #{selectedOrder.id}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                ...getStatusColor(selectedOrder.status),
                                fontWeight: "bold",
                            }}
                        >
                            {selectedOrder.status}
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ padding: "24px" }}>
                        <Box display="flex" flexDirection="column" gap={3}>
                            {/* Thông tin khách hàng */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    color="primary"
                                >
                                    Thông tin khách hàng
                                </Typography>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(2, 1fr)",
                                        gap: 2,
                                        backgroundColor: "#f8f9fa",
                                        padding: 2,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography>
                                        <strong>Tên khách hàng:</strong>{" "}
                                        {selectedOrder?.name}
                                    </Typography>
                                    <Typography>
                                        <strong>Địa chỉ:</strong>{" "}
                                        {selectedOrder?.address}
                                    </Typography>
                                    <Typography>
                                        <strong>Ngày đặt:</strong>{" "}
                                        {new Date(
                                            selectedOrder?.createdAt
                                        ).toLocaleDateString("vi-VN")}
                                    </Typography>
                                    <Typography>
                                        <strong>Phương thức thanh toán:</strong>{" "}
                                        {selectedOrder?.paymentMethod || ""}
                                    </Typography>
                                    <Typography>
                                        <strong>Ghi chú:</strong>{" "}
                                        {selectedOrder?.notes || ""}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Chi tiết đơn hàng */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    color="primary"
                                >
                                    Chi tiết sản phẩm
                                </Typography>
                                <TableContainer
                                    sx={{
                                        backgroundColor: "#f8f9fa",
                                        borderRadius: 1,
                                    }}
                                >
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>
                                                    <strong>ID Sản phẩm</strong>
                                                </TableCell>
                                                <TableCell>
                                                    <strong>Số lượng</strong>
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrderDetails.map(
                                                (item, key) => {
                                                    // Lấy sản phẩm tương ứng với productId
                                                    const product = getProduct(
                                                        item.productId
                                                    )[0];
                                                    const colorSize = getColors(
                                                        item.colorSizeId
                                                    )[0];
                                                    return (
                                                        <TableRow key={key}>
                                                            <TableCell>
                                                                {item.productId}{" "}
                                                                {product
                                                                    ? product.name
                                                                    : "Không tìm thấy sản phẩm"}{" "}
                                                                -{" "}
                                                                {
                                                                    colorSize.color
                                                                }{" "}
                                                                -{" "}
                                                                {colorSize.size}
                                                            </TableCell>
                                                            <TableCell>
                                                                {item?.quantity}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>

                            {/* Thông tin thanh toán */}
                            <Box>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    color="primary"
                                >
                                    Thông tin thanh toán
                                </Typography>
                                <Box
                                    sx={{
                                        backgroundColor: "#f8f9fa",
                                        padding: 2,
                                        borderRadius: 1,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="h6">
                                        Tổng tiền:
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        {new Intl.NumberFormat("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        }).format(selectedOrder?.totalPrice)}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography>
                                <strong>Lý do huỷ:</strong>{" "}
                                {selectedOrder?.cancellationReason}
                            </Typography>
                            {/* Ghi chú */}
                            {selectedOrder.notes && (
                                <Box>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        color="primary"
                                    >
                                        Ghi chú
                                    </Typography>
                                    <Box
                                        sx={{
                                            backgroundColor: "#f8f9fa",
                                            padding: 2,
                                            borderRadius: 1,
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {selectedOrder.notes}
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
};

export default OrderManagement;
