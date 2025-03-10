import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    CircularProgress,
    MenuItem,
    Autocomplete,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import apiConfigInstance from "../../../SingletonParttern.js";
import { notification } from "antd";
const API_URL = apiConfigInstance.getApiUrl();

const EditOrder = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [colorSizes, setColorSizes] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [products, setProducts] = useState([]);

    // Options cho các dropdown
    const orderStatusOptions = [
        "Chờ xác nhận",
        "Đã xác nhận",
        "Đang xử lý",
        "Đang giao hàng",
        "Đã giao hàng",
        "Đã thanh toán",
        "Thanh toán lỗi",
        "Đã hủy",
        "Đã hoàn tiền",
    ];

    // Thêm options cho phương thức thanh toán
    const paymentMethodOptions = [
        "Tiền mặt",
        "MoMo",
        "VNPay",
        "Chuyển khoản ngân hàng",
    ];

    // Thêm hàm để format ngày giờ cho input datetime-local
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return ""; // Kiểm tra ngày hợp lệ

        // Format thành YYYY-MM-DDThh:mm
        return date.toISOString().slice(0, 16);
    };
    const fetchOrder = async () => {
        try {
            const response = await fetch(`${API_URL}/api/Orders/${orderId}`);
            if (response.status == 200) {
                const data = await response.json();
                setOrder(data);
            } else {
                throw new Error("Failed to fetch order");
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            setError("Failed to load order data");
        } finally {
            setLoading(false);
        }
    };
    const fetchColorSize = async () => {
        try {
            const response = await fetch(`${API_URL}/api/ColorSizes`);
            if (response.status == 200) {
                const data = await response.json();
                setColorSizes(data);
            } else {
                throw new Error("Failed to fetch order");
            }
        } catch (error) {
            console.error("Error fetching order:", error);
            setError("Failed to load order data");
        } finally {
            setLoading(false);
        }
    };
    const fetchOrderDetails = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/OrderDetails/ByOrder/${orderId}`
            );

            if (response.status == 200) {
                const data = await response.json();
                setOrderDetails(data);
            } else {
                throw new Error("Failed to fetch order detail");
            }
        } catch (error) {
            console.error("Error fetching order detail:", error);
            setError("Failed to load order data");
        } finally {
            setLoading(false);
        }
    };
    const fetchProducts = async () => {
        try {
            const response = await fetch(` ${API_URL}/api/Products `);
            if (response.ok) {
                const data = await response.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };
    // Fetch order data
    useEffect(() => {
        fetchOrderDetails();
        fetchOrder();
        fetchColorSize();
        fetchProducts();
    }, [orderId]);

    const [orderProducts, setOrderProduct] = useState([]);
    useEffect(() => {
        if (orderDetails && products.length > 0) {
            const matchedProducts = orderDetails.map((order) =>
                products.find((product) => product.id === order.productId)
            );
            setOrderProduct(matchedProducts);
        }
    }, [orderDetails, products]);
    const getColors = (colorSizeId) => {
        if (colorSizes)
            return colorSizes.find((item) => item.id === colorSizeId);
    };
    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate customer info
        if (!order.userId) {
            newErrors.userId = "Vui lòng nhập ID khách hàng";
        }

        if (!order.name) {
            newErrors.name = "Vui lòng nhập tên khách hàng";
        }

        if (!order.address) {
            newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
        }

        // // Validate items
        // if (!order.items || order.items.length === 0) {
        //   newErrors.items = 'Đơn hàng phải có ít nhất một sản phẩm';
        // } else {
        //   order.items.forEach((item, index) => {
        //     if (!item.productId) {
        //       newErrors[`items[${index}].productId`] = 'Vui lòng chọn sản phẩm';
        //     }
        //     if (!item.quantity || item.quantity <= 0) {
        //       newErrors[`items[${index}].quantity`] = 'Số lượng phải lớn hơn 0';
        //     }
        //   });
        // }

        // Validate ngày đặt hàng
        if (!order.createdAt) {
            newErrors.createdAt = "Vui lòng chọn ngày đặt hàng";
        }

        if (!order.status) {
            newErrors.status = "Vui lòng chọn trạng thái đơn hàng";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrder((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when field is changed
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...order.items];
        updatedItems[index][field] = value;
        setOrder((prev) => ({
            ...prev,
            items: updatedItems,
        }));
        // Clear error for this item field
        if (errors[`items[${index}].${field}`]) {
            setErrors((prev) => ({
                ...prev,
                [`items[${index}].${field}`]: undefined,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/Orders/${orderId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(order),
            });
            console.log("response update order", response);
            if (response.ok) {
                notification.success({
                    message: 'Thành công',
                    description: "Đơn hàng đã được cập nhật thành công",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
                navigate("/order-management");
            } else {
                const data = await response.json();
                throw new Error(data.message || "Failed to update order");
            }
        } catch (error) {
            console.error("Error updating order:", error);
            notification.error({
                message: 'Thất bại',
                description: "Lỗi khi cập nhật đơn hàng: " + error.message,
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true
            });
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!order) return <Typography>Không tìm thấy đơn hàng</Typography>;

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Chỉnh sửa đơn hàng
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    {/* Customer Information */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="ID Khách hàng"
                            name="userId"
                            value={order?.userId || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.userId}
                            helperText={errors.userId}
                            margin="normal"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Tên khách hàng"
                            name="name"
                            value={order?.name || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            // error={!!order?.name}
                            helperText={errors.name}
                            margin="normal"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Địa chỉ giao hàng"
                            name="shippingAddress"
                            value={order.address || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            error={!!errors.address}
                            helperText={errors.address}
                            margin="normal"
                            multiline
                            rows={2}
                        />
                    </Grid>

                    {/* Order Items */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Sản phẩm
                        </Typography>
                        {orderDetails &&
                            orderDetails.map((item, index) => {
                                const colorSize = getColors(item.colorSizeId);
                                return (
                                    <Grid container spacing={2} key={index}>
                                        <Grid item xs={6}>
                                            <Autocomplete
                                                options={orderProducts}
                                                getOptionLabel={(option) =>
                                                    `${option.name} - ${colorSize.color} - Còn ${colorSize.quantity} sản phẩm`
                                                }
                                                value={
                                                    orderProducts.find(
                                                        (p) =>
                                                            p.id ===
                                                            item.productId
                                                    ) || null
                                                }
                                                onChange={(event, newValue) => {
                                                    handleItemChange(
                                                        index,
                                                        "productId",
                                                        newValue
                                                            ? newValue.id
                                                            : ""
                                                    );
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Chọn sản phẩm"
                                                        required
                                                        margin="normal"
                                                        error={
                                                            !!errors[
                                                                `items[${index}].productId`
                                                            ]
                                                        }
                                                        helperText={
                                                            errors[
                                                                `items[${index}].productId`
                                                            ]
                                                        }
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="Số lượng"
                                                type="number"
                                                value={item.quantity || ""}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "quantity",
                                                        e.target.value
                                                    )
                                                }
                                                fullWidth
                                                required
                                                error={
                                                    !!errors[
                                                        `items[${index}].quantity`
                                                    ]
                                                }
                                                helperText={
                                                    errors[
                                                        `items[${index}].quantity`
                                                    ]
                                                }
                                                margin="normal"
                                                inputProps={{ min: 1 }}
                                            />
                                        </Grid>
                                    </Grid>
                                );
                            })}
                    </Grid>

                    {/* Order Status and Payment */}
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            options={orderStatusOptions}
                            value={order.status || ""}
                            onChange={(event, newValue) => {
                                handleChange({
                                    target: { name: "status", value: newValue },
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Trạng thái đơn hàng"
                                    required
                                    margin="normal"
                                    error={!!errors.status}
                                    helperText={errors.status}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            options={paymentMethodOptions}
                            value={order.paymentMethod || ""}
                            onChange={(event, newValue) => {
                                handleChange({
                                    target: {
                                        name: "paymentMethod",
                                        value: newValue,
                                    },
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Phương thức thanh toán"
                                    required
                                    margin="normal"
                                    error={!!errors.paymentMethod}
                                    helperText={errors.paymentMethod}
                                />
                            )}
                        />
                    </Grid>

                    {/* Notes */}
                    {/* <Grid item xs={12}>
            <TextField
              label="Ghi chú"
              name="notes"
              value={order.notes || ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
          </Grid> */}

                    {/* Ngày đặt hàng */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Ngày đặt hàng"
                            name="orderDate"
                            type="datetime-local"
                            value={order.createdAt || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.createdAt}
                            helperText={errors.createdAt}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>
                </Grid>

                <Box mt={3}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Cập nhật đơn hàng
                    </Button>
                    <Button
                        onClick={() => navigate("/order-management")}
                        variant="outlined"
                        color="secondary"
                        size="large"
                        style={{ marginLeft: 16 }}
                    >
                        Huỷ
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default EditOrder;
