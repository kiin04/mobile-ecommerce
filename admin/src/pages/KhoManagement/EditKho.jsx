import { useState, useEffect } from "react";
import { message, notification } from "antd";
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    MenuItem,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../../config.js";

const EditKho = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [kho, setKho] = useState({
        managementPerson: "",
        responsiblePerson: "",
        date: "", // Keep the date in state but don't edit it
        warehouseCode: "",
        location: "",
        products: [{ productId: "", productName: "", quantity: 1, color: "" }],
        notes: "",
    });

    useEffect(() => {
        const fetchKho = async () => {
            try {
                const response = await fetch(`${API_URL}/api/kho/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setKho(data);
                } else {
                    console.error("Failed to fetch kho data");
                }
            } catch (error) {
                console.error("Error fetching kho data:", error);
            }
        };

        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products`);
                if (response.ok) {
                    const data = await response.json();
                    setProducts(data);
                    setFilteredProducts(data);
                } else {
                    console.error("Failed to fetch products");
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchKho();
        fetchProducts();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setKho({ ...kho, [name]: value });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...kho.products];
        updatedItems[index][field] = value;
        setKho({ ...kho, products: updatedItems });
    };

    const handleAddItem = () => {
        setKho({
            ...kho,
            products: [
                ...kho.products,
                { productId: "", productName: "", quantity: 1, color: "" },
            ],
        });
    };

    const handleRemoveItem = (index) => {
        const updatedItems = [...kho.products];
        updatedItems.splice(index, 1);
        setKho({ ...kho, products: updatedItems });
    };

    const handleProductFilter = (index, value) => {
        const selectedProduct = products.find(
            (product) => product.name === value
        );
        const updatedItems = [...kho.products];

        if (selectedProduct) {
            updatedItems[index]["productId"] = selectedProduct.id;
            updatedItems[index]["color"] = selectedProduct.color;
        } else {
            updatedItems[index]["productId"] = "";
            updatedItems[index]["color"] = "";
        }

        updatedItems[index]["productName"] = value;
        setKho({ ...kho, products: updatedItems });

        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredProducts(filtered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/api/kho/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(kho),
            });

            if (response.ok) {
                notification.success({
                    message: 'Thành công',
                    description: "Phiếu đã được cập nhật thành công",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                })
                navigate("/kho-management");
            } else {
                notification.error({
                    message: 'Thất bại',
                    description: "Cập nhật phiếu thất bại",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                })
            }
        } catch (error) {
            console.error("Error updating phiếu:", error);
        }
    };

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Chỉnh sửa phiếu xuất kho
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Quản lý"
                            name="managementPerson"
                            value={kho.managementPerson}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Người chịu trách nhiệm"
                            name="responsiblePerson"
                            value={kho.responsiblePerson}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Mã kho"
                            name="warehouseCode"
                            value={kho.warehouseCode}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Địa điểm"
                            name="location"
                            value={kho.location}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Sản phẩm trong phiếu
                        </Typography>
                        {kho.products.map((item, index) => (
                            <Grid
                                container
                                spacing={2}
                                key={index}
                                alignItems="center"
                            >
                                <Grid item xs={4}>
                                    <TextField
                                        select
                                        label="Chọn sản phẩm"
                                        value={item.productName || ""}
                                        onChange={(e) =>
                                            handleProductFilter(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        fullWidth
                                        margin="normal"
                                        required
                                    >
                                        {filteredProducts.map((product) => (
                                            <MenuItem
                                                key={product.id}
                                                value={product.name}
                                            >
                                                {product.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        label="ID"
                                        value={item.productId}
                                        fullWidth
                                        required
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        margin="normal"
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        label="Màu sắc"
                                        value={item.color}
                                        fullWidth
                                        required
                                        InputProps={{
                                            readOnly: true,
                                        }}
                                        margin="normal"
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
                                                e.target.value
                                            )
                                        }
                                        fullWidth
                                        required
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => handleRemoveItem(index)}
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
                    <Grid item xs={12}>
                        <TextField
                            label="Ghi chú"
                            name="notes"
                            value={kho.notes}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            multiline
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Loại phiếu"
                            name="type"
                            value={kho.type || ""} // Default to kho.type or empty string if not set
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        >
                            <MenuItem value="Nhập">Nhập</MenuItem>
                            <MenuItem value="Xuất">Xuất</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h6">
                            Ngày: {new Date(kho.date).toLocaleString()}
                        </Typography>
                    </Grid>
                </Grid>

                <Box mt={3}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Cập nhật phiếu
                    </Button>
                    <Button
                        onClick={() => navigate("/kho-management")}
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

export default EditKho;
