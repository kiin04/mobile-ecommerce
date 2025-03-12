import { useState, useEffect } from "react";
import {
    Grid,
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
import { notification, message } from "antd";
import { Edit, Delete, Visibility } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import apiConfigInstance from "../../../SingletonParttern.js";
const API_URL = apiConfigInstance.getApiUrl();

const CategoryManager = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setselectedCategory] = useState(null);
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Categories`);

                if (response.status === 200) {
                    const data = response.data;
                    setCategories(data);
                } else {
                    console.error(
                        `Failed to fetch Categories: ${response.status} ${response.statusText}`
                    );
                }
            } catch (error) {
                console.error("Error fetching Categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleViewDetails = (product) => {
        setselectedCategory(product);
    };

    const handleCloseDialog = () => {
        setselectedCategory(null);
    };

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
            return res.data; 
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

    const getStock = (id) => {
        const getStockOfProduct = (productId) => {
            let stock = 0;
            if (Array.isArray(listColorSizes)) {
                stock = listColorSizes
                    .filter((item) => item.productId === productId)
                    .reduce((total, item) => total + (item.quantity || 0), 0);
            }
            return stock;
        };

        let stock = 0;
        if (Array.isArray(products)) {
            stock = products
                .filter((item) => item.categoryId === id)
                .reduce(
                    (total, item) => total + (getStockOfProduct(item.id) || 0),
                    0
                );
        }

        return stock;
    };
    const getProduct = (id) => {
        return products.filter((item) => item.categoryId === id);
    };

    const handleDeleteCategory = async (productId) => {
        try {
            const response = await fetch(
                `${API_URL}/api/Categories/${productId}`,
                {
                    method: "DELETE",
                }
            );

            if (response.ok) {
                setCategories(
                    categories.filter((product) => product.id !== productId)
                );
                message.success("Danh muc đã được xóa thành công");
            } else {
                const data = await response.json();
                notification.error({
                    message: "Đã xảy ra lỗi",
                    description: data.message || "Lỗi khi xóa sản phẩm",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true,
                });
                notification.error({
                    message: "Thành công",
                    description: "Thanh toán thành công!",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true,
                });
            }
        } catch (error) {
            console.error("Error:", error);
            notification.error({
                message: "Thất bại",
                description: "Đã xảy ra lỗi khi xóa sản phẩm: " + error.message,
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true,
            });
        }
    };

    const handleAddCategory = () => {
        navigate("/add-category");
    };

    const handleEditCategory = (categoryId) => {
        navigate(`/edit-category/${categoryId}`);
    };

    const filteredCategories = categories.filter(
        (categories) =>
            categories.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            categories.id.includes(searchTerm)
    );

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredCategories.length / rowsPerPage);
    const paginatedCategories = filteredCategories.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Quản lý Danh mục
            </Typography>

            <TextField
                label="Tìm kiếm danh mục"
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
                    onClick={handleAddCategory}
                >
                    Thêm danh mục
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: "120px" }}>Mã DM</TableCell>
                            <TableCell sx={{ width: "220px" }}>
                                Tên danh mục
                            </TableCell>
                            <TableCell sx={{ width: "150px" }}>
                                Số lượng
                            </TableCell>
                            <TableCell sx={{ width: "180px" }}>
                                Hành động
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedCategories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>{category.id}</TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>
                                    {getStock(category.id) > 0 ? (
                                        getStock(category.id)
                                    ) : (
                                        <p style={{ color: "red" }}>Hết hàng</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() =>
                                            handleViewDetails(category)
                                        }
                                        color="primary"
                                    >
                                        <Visibility />
                                    </IconButton>
                                    <IconButton
                                        onClick={() =>
                                            handleEditCategory(category.id)
                                        }
                                        color="secondary"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        onClick={() =>
                                            handleDeleteCategory(category.id)
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

            {selectedCategory && (
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
                        Chi tiết danh mục
                    </DialogTitle>
                    <DialogContent sx={{ padding: "24px" }}>
                        <Box display="flex" gap={3}>
                            <Box flex={1}>
                                <img
                                    src={
                                        selectedCategory?.image
                                            ? `data:image/jpeg;base64,${selectedCategory.image}`
                                            : ""
                                    }
                                    alt={selectedCategory.name}
                                    style={{
                                        width: "60%",
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
                                    {selectedCategory.name}
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
                                        <strong>Mã danh mục:</strong>{" "}
                                        {selectedCategory.id}
                                    </Typography>
                                    <Typography>
                                        <strong>Số lượng:</strong>
                                        {getStock(selectedCategory.id) > 0 ? (
                                            getStock(selectedCategory.id)
                                        ) : (
                                            <p style={{ color: "red" }}>
                                                Hết hàng
                                            </p>
                                        )}
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
                                        {selectedCategory.description}
                                    </Typography>
                                    <Typography>
                                        <strong>Sản phẩm:</strong>
                                    </Typography>
                                    <Grid>
                                        {getProduct(selectedCategory.id).map(
                                            (pro) => {
                                                return (
                                                    <Typography
                                                        key={pro.id}
                                                        mt={1}
                                                        sx={{
                                                            backgroundColor:
                                                                "#f5f5f5",
                                                            padding: 2,
                                                            borderRadius: 1,
                                                            whiteSpace:
                                                                "pre-wrap",
                                                        }}
                                                    >
                                                        <img
                                                            src={
                                                                pro?.image
                                                                    ? `data:image/jpeg;base64,${pro.image}`
                                                                    : ""
                                                            }
                                                            alt={
                                                                selectedCategory.name
                                                            }
                                                            style={{
                                                                width: "40px",
                                                                height: "auto",
                                                                borderRadius:
                                                                    "8px",
                                                                boxShadow:
                                                                    "0 2px 8px rgba(0,0,0,0.1)",
                                                            }}
                                                        />
                                                        <Link
                                                            to={`/edit-product/${pro.id}`}
                                                        >
                                                            {pro.name}
                                                        </Link>
                                                    </Typography>
                                                );
                                            }
                                        )}
                                    </Grid>
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
};

export default CategoryManager;
