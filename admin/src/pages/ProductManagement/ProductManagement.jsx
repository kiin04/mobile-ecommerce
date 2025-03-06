import { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
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
    Pagination,
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import apiConfigInstance from "../../../SingletonParttern.js";
import { message, notification } from "antd";
const API_URL = apiConfigInstance.getApiUrl();

const ProductManagement = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    useEffect(() => {
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
        fetchProducts();
    }, []);
    const fetchApiColorSizes = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/ColorSizes`);
            // console.log('Fetched colors:', res.data);
            return res.data; // Đảm bảo đây là một mảng
        } catch (error) {
            console.error("Error fetching data:", error);
            throw error;
        }
    };

    const queryColorSizes = useQuery({
        queryKey: ["colorsizes"],
        queryFn: fetchApiColorSizes,
    });
    const listColorSizes = queryColorSizes.data || [];
    //console.log('listColorSizes: ',listColorSizes)
    const getStock = (id) => {
        let stock = 0;
        if (Array.isArray(listColorSizes)) {
            stock = listColorSizes
                .filter((item) => item.productId === id)
                .reduce((total, item) => total + (item.quantity || 0), 0);
        }

        return stock;
    };

    const handleViewDetails = (product) => {
        setSelectedProduct(product);
    };

    const handleCloseDialog = () => {
        setSelectedProduct(null);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            // Kiểm tra sử dụng sản phẩm trước khi xóa
            // const checkResponse = await fetch(`${API_URL}/api/Product/${productId}/check-usage`);
            // const checkData = await checkResponse.json();

            // if (checkData.isInUse) {
            //   let message = 'Không thể xóa sản phẩm vì đang được sử dụng trong:';
            //   if (checkData.inOrders) message += '\n- Đơn hàng';
            //   if (checkData.inKho) message += '\n- Phiếu kho';

            //   return;
            // }

            // Nếu sản phẩm không được sử dụng, tiến hành xóa
            const response = await fetch(
                `${API_URL}/api/Products/${productId}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setProducts(
                    products.filter((product) => product.id !== productId)
                );
                ("Sản phẩm đã được xóa thành công");
            } else {
                const data = await response.json();
                notification.error({
                    message: 'Thất bại',
                    description: data.message || "Lỗi khi xóa sản phẩm",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
            }
        } catch (error) {
            console.error("Error:", error);
            message.error("Lỗi kết nối đến server");
        }
    };

    const handleAddProduct = () => {
        navigate("/add-product");
    };

    const handleEditProduct = (productId) => {
        navigate(`/edit-product/${productId}`);
    };

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id.includes(searchTerm)
    );

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Quản lý sản phẩm
            </Typography>

            <TextField
                label="Tìm kiếm sản phẩm"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset về trang 1 khi tìm kiếm
                }}
                margin="normal"
            />

            <Box marginY={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddProduct}
                >
                    Thêm sản phẩm
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã SP</TableCell>
                            <TableCell>Tên sản phẩm</TableCell>
                            <TableCell>Đã bán</TableCell>
                            <TableCell>Số lượng</TableCell>
                            <TableCell>Giá (VNĐ)</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedProducts.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.id}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.sold}</TableCell>
                                <TableCell>
                                    {getStock(product.id) > 0 ? (
                                        getStock(product.id)
                                    ) : (
                                        <p style={{ color: "red" }}>Hết hàng</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {formatPrice(product.price)}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() =>
                                            handleViewDetails(product)
                                        }
                                        color="primary"
                                    >
                                        <Visibility />
                                    </IconButton>
                                    <IconButton
                                        onClick={() =>
                                            handleEditProduct(product.id)
                                        }
                                        color="secondary"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        onClick={() =>
                                            handleDeleteProduct(product.id)
                                        }
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
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

            {selectedProduct && (
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
                        }}
                    >
                        Chi tiết sản phẩm
                    </DialogTitle>
                    <DialogContent sx={{ padding: "24px" }}>
                        <Box display="flex" gap={3}>
                            <Box flex={1}>
                                <img
                                    src={
                                        selectedProduct?.image ? `data:image/jpeg;base64,${selectedProduct.image}` : ""
                                    }
                                    alt={selectedProduct.name}
                                    style={{
                                        width: "100%",
                                        height: "auto",
                                        borderRadius: "8px",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    }}
                                />
                            </Box>

                            <Box flex={1}>
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    color="primary"
                                >
                                    {selectedProduct.name}
                                </Typography>

                                <Box
                                    sx={{
                                        display: "grid",
                                        gap: 2,
                                        "& .MuiTypography-root": {
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        },
                                    }}
                                >
                                    <Typography>
                                        <strong>Mã sản phẩm:</strong>{" "}
                                        {selectedProduct.id}
                                    </Typography>
                                    <Typography>
                                        <strong>Thương hiệu:</strong>{" "}
                                        {selectedProduct?.brand}
                                    </Typography>
                                    <Typography>
                                        <strong>Đá bán:</strong>{" "}
                                        {selectedProduct.sold}
                                    </Typography>
                                    <Typography>
                                        <strong>Số lượng:</strong>{" "}
                                        {getStock(selectedProduct.id) > 0 ? (
                                            getStock(selectedProduct.id)
                                        ) : (
                                            <p style={{ color: "red" }}>
                                                Hết hàng
                                            </p>
                                        )}
                                    </Typography>
                                    <Typography>
                                        <strong>Đơn giá:</strong>{" "}
                                        {formatPrice(selectedProduct.price)}
                                    </Typography>
                                    <Typography>
                                        <strong>Giảm giá giá:</strong>{" "}
                                        {selectedProduct.promo}%
                                    </Typography>
                                    <Typography>
                                        <strong>Mô tả:</strong>
                                    </Typography>
                                    <Typography
                                        sx={{
                                            backgroundColor: "#f5f5f5",
                                            padding: 2,
                                            borderRadius: 1,
                                            whiteSpace: "pre-wrap",
                                        }}
                                    >
                                        {selectedProduct.description}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
};

export default ProductManagement;
