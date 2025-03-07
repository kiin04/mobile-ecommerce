import { useState, useEffect } from "react";
import { message, notification } from "antd";
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    MenuItem,
    Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config.js";

const AddOrder = () => {
    const navigate = useNavigate();
    const [productId, setProductId] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [order, setOrder] = useState({
        customerId: "",
        customerName: "",
        shippingAddress: "",
        items: [{ productId: "", quantity: 1 }],
        paymentMethod: "Tiền mặt",
        totalAmount: 0,
        orderStatus: "Chờ xác nhận",
        paymentStatus: "Chưa thanh toán",
        orderDate: new Date().toISOString().slice(0, 16), // Set default order date to current date and time
        notes: "",
    });

    // Thêm state cho errors
    const [errors, setErrors] = useState({});

    // Thêm hàm kiểm tra ngày trong quá khứ
    const isPastDate = (date) => {
        const orderDate = new Date(date).getTime();
        const now = new Date().getTime();
        return orderDate < now - 24 * 60 * 60 * 1000; // Cho phép đặt đơn trong vòng 24h
    };

    // Thêm hàm validate
    const validateForm = () => {
        const newErrors = {};

        // Validate thông tin khách hàng
        if (!order.customerId?.trim()) {
            newErrors.customerId = "Vui lòng nhập ID khách hàng";
        }

        if (!order.customerName?.trim()) {
            newErrors.customerName = "Không tìm thấy thông tin khách hàng";
        }

        if (!order.shippingAddress?.trim()) {
            newErrors.shippingAddress = "Vui lòng nhập địa chỉ giao hàng";
        }

        // Validate sản phẩm
        if (!order.items || order.items.length === 0) {
            newErrors.items = "Vui lòng thêm ít nhất một sản phẩm";
        } else {
            order.items.forEach((item, index) => {
                if (!item.productId) {
                    newErrors[`items.${index}.productId`] =
                        "Vui lòng chọn sản phẩm";
                }

                if (!item.quantity || item.quantity < 1) {
                    newErrors[`items.${index}.quantity`] =
                        "Số lượng phải lớn hơn 0";
                }

                // Kiểm tra số lượng tồn kho
                const product = products.find((p) => p.id === item.productId);
                if (product && item.quantity > product.quantity) {
                    newErrors[
                        `items.${index}.quantity`
                    ] = `Chỉ còn ${product.quantity} sản phẩm trong kho`;
                }
            });
        }

        // Validate phương thức thanh toán
        if (!order.paymentMethod) {
            newErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
        }

        // Validate ngày đặt hàng
        if (!order.orderDate) {
            newErrors.orderDate = "Vui lòng chọn ngày đặt hàng";
        } else if (isPastDate(order.orderDate)) {
            newErrors.orderDate = "Không thể chọn ngày trong quá khứ";
        }

        if (!order.status) {
            newErrors.status = "Vui lòng chọn trạng thái đơn hàng";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Fetch products for selection
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products`);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                    setFilteredProducts(data); // Initially set filtered products to all products
                } else {
                    console.error("Failed to fetch products");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    // Fetch customer info when customerId changes
    useEffect(() => {
        const fetchCustomerInfo = async () => {
            if (order.customerId) {
                try {
                    const response = await fetch(
                        `${API_URL}/api/users/${order.customerId}`
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setOrder((prevOrder) => ({
                            ...prevOrder,
                            customerName: data.name,
                        }));
                    } else {
                        console.error("Customer not found");
                        setOrder((prevOrder) => ({
                            ...prevOrder,
                            customerName: "",
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching customer info:", error);
                }
            } else {
                setOrder((prevOrder) => ({ ...prevOrder, customerName: "" }));
            }
        };

        fetchCustomerInfo();
    }, [order.customerId]);

    // Recalculate total whenever the items or quantities change
    useEffect(() => {
        let total = 0;
        order.items.forEach((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (product) {
                total += product.price * item.quantity;
            }
        });
        setOrder((prevOrder) => ({
            ...prevOrder,
            totalAmount: total,
        }));
    }, [order.items, products]);

    // Format the total amount as VND
    const formatVND = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrder((prev) => ({ ...prev, [name]: value }));
        // Xóa lỗi khi người dùng thay đổi giá trị
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...order.items];
        updatedItems[index][field] = value;
        setOrder((prev) => ({ ...prev, items: updatedItems }));
        // Xóa lỗi khi người dùng thay đổi giá trị
        if (errors[`items.${index}.${field}`]) {
            setErrors((prev) => ({
                ...prev,
                [`items.${index}.${field}`]: undefined,
            }));
        }
    };

    const handleAddItem = () => {
        setOrder({
            ...order,
            items: [...order.items, { productId: "", quantity: 1 }],
        });
    };

    const handleRemoveItem = (index) => {
        const updatedItems = [...order.items];
        updatedItems.splice(index, 1);
        setOrder({ ...order, items: updatedItems });
    };

    // Filter products based on input in the product dropdown
    const handleProductFilter = (index, value) => {
        const updatedItems = [...order.items];
        updatedItems[index]["productId"] = value;
        setOrder({ ...order, items: updatedItems });

        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    // Submit the form and place the order
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Log để kiểm tra dữ liệu trước khi gửi
            console.log("Order data being sent:", {
                ...order,
                paymentMethod: order.paymentMethod, // Kiểm tra giá trị này
            });

            const response = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(order),
            });

            const data = await response.json();
            console.log("Response from server:", data); // Log response từ server

            if (!response.ok) {
                throw new Error(
                    data.error || data.message || "Không thể tạo đơn hàng"
                );
            }
            notification.success({
                message: 'Thành công',
                description: 'Đơn hàng đã được tạo thành công.',
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true
            });
            navigate("/order-management");
        } catch (error) {
            console.error("Error details:", error);
            notification.error({
                message: 'Thất bại',
                description: `Lỗi xảy ra khi tạo đơn hàng: ${error.message}`,
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true
            });
        }
    };

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
    const paymentMethodOptions = [
        "Tiền mặt",
        "MoMo",
        "VNPay",
        "Chuyển khoản ngân hàng",
    ];

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Thêm đơn đặt hàng
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Id khách hàng"
                            name="customerId"
                            value={order.customerId}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.customerId}
                            helperText={errors.customerId}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Tên khách hàng"
                            name="customerName"
                            value={order.customerName}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            disabled
                            error={!!errors.customerName}
                            helperText={errors.customerName}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Địa chỉ giao hàng"
                            name="shippingAddress"
                            value={order.shippingAddress}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.shippingAddress}
                            helperText={errors.shippingAddress}
                            multiline
                            rows={2}
                        />
                    </Grid>

                    {/* Order Date and Time */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Ngày đặt hàng"
                            name="orderDate"
                            type="datetime-local"
                            value={order.orderDate}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.orderDate}
                            helperText={errors.orderDate}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Sản phẩm đặt
                        </Typography>
                        {order.items.map((item, index) => (
                            <Grid
                                container
                                spacing={2}
                                key={index}
                                alignItems="center"
                            >
                                <Grid item xs={6}>
                                    <Autocomplete
                                        options={filteredProducts}
                                        getOptionLabel={(option) =>
                                            `${option.name} - Còn ${option.quantity} sản phẩm`
                                        }
                                        value={
                                            products.find(
                                                (p) => p.id === item.productId
                                            ) || null
                                        }
                                        onChange={(event, newValue) => {
                                            handleItemChange(
                                                index,
                                                "productId",
                                                newValue ? newValue.id : ""
                                            );
                                        }}
                                        onInputChange={(event, value) =>
                                            handleProductFilter(index, value)
                                        }
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Chọn sản phẩm"
                                                required
                                                error={
                                                    !!errors[
                                                        `items.${index}.productId`
                                                    ]
                                                }
                                                helperText={
                                                    errors[
                                                        `items.${index}.productId`
                                                    ]
                                                }
                                                sx={{
                                                    marginTop: 0,
                                                    marginBottom: 0,
                                                }} // Xóa margin
                                            />
                                        )}
                                        sx={{ marginTop: 2, marginBottom: 1 }} // Thêm margin vào Autocomplete
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        label="Số lượng"
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            handleItemChange(
                                                index,
                                                "quantity",
                                                parseInt(e.target.value)
                                            )
                                        }
                                        fullWidth
                                        required
                                        inputProps={{ min: 1 }}
                                        error={
                                            !!errors[`items.${index}.quantity`]
                                        }
                                        helperText={
                                            errors[`items.${index}.quantity`]
                                        }
                                        sx={{ marginTop: 2, marginBottom: 1 }} // Căn chỉnh margin giống Autocomplete
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleRemoveItem(index)}
                                        disabled={order.items.length === 1}
                                        sx={{ marginTop: 2 }} // Căn chỉnh button theo các trường khác
                                    >
                                        Xoá
                                    </Button>
                                </Grid>
                            </Grid>
                        ))}
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddItem}
                            style={{ marginTop: "10px" }}
                        >
                            Thêm sản phẩm
                        </Button>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            options={orderStatusOptions}
                            value={order.status}
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
                            value={order.paymentMethod}
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
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Tổng tiền"
                            name="totalAmount"
                            value={formatVND(order.totalAmount)} // Format total amount as VND
                            fullWidth
                            margin="normal"
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Ghi chú"
                            name="notes"
                            value={order.notes}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            multiline
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
                        Thêm đơn đặt hàng
                    </Button>
                    <Button
                        onClick={() => navigate("/order-management")}
                        variant="outlined"
                        color="secondary"
                        size="large"
                        style={{ marginLeft: "16px" }}
                    >
                        Huỷ
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default AddOrder;
