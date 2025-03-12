import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    IconButton,
    Autocomplete,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import apiConfigInstance from "../../../SingletonParttern.js";
const API_URL = apiConfigInstance.getApiUrl();
import { MenuItem } from "@mui/material";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Detail from "../../components/Detail.jsx";
import { message, notification } from "antd";
const AddProduct = () => {
    const navigate = useNavigate();
    // Fetch dữ liệu từ API
    const fetchCategory = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Categories`);
            //  console.log("API Response:", response);
            return response.data;
        } catch (error) {
            console.error("Lỗi khi gọi API:", error);
            return []; // Trả về mảng rỗng nếu API lỗi
        }
    };

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: () => fetchCategory(),
    });
    const [product, setProduct] = useState({
        name: "",
        rate: 0,
        sold: 0,
        price: 0,
        categortId: 1,
        brand: "SphoneC",
        startRate : 0,
        description: "",
        image: null,
    });
    const [detail, setDetail] = useState({
        screenSize: "",
        screenTechnology: " ",
        rearCamera: "",
        frontCamera: "",
        chipset: "",
        gpu: "",
        nfc: "",
        ram: "",
        internalStorage: "",
        battery: "",
        simcard: "",
        screenResolution: "",
        chargingTechnology: "",
    });
    const [imagePreview, setImagePreview] = useState(null); // Thêm state để lưu URL hình ảnh

    // Thêm state cho validation errors
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProduct({ ...product, image: file });
        setImagePreview(URL.createObjectURL(file)); // Tạo URL tạm thời cho hình ảnh
    };
    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setDetail({ ...detail, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("unit", "Cái");
        formData.append("price", product.price);
        formData.append("brand", product.brand);
        formData.append("description", product.description);
        formData.append("categoryId", product.categortId);
        formData.append("sold", 0);
        formData.append("rate", 0);
        formData.append("startRate", 0);
        if (product.image) {
            formData.append("image", product.image);
        }
        console.log("product:", formData);
        validateForm();
        try {
            const response = await fetch(`${API_URL}/api/Products`, {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                notification.success({
                    message: 'Thành công',
                    description: "Sản phẩm đã được thêm thành công",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
                navigate("/product-management"); // Chuyển hướng sau khi thêm thành công
            } else {
                const result = await response.json();
                notification.error({
                    message: 'Thất bại',
                    description: "Lỗi khi thêm sản phẩm: " + result.message,
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
            }
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            message.error("Lỗi kết nối đến server");
        }
    };

    const handleCancel = () => {
        navigate("/product-management"); // Quay lại /product-management
    };

    const colorOptions = [
        "Đen",
        "Trắng",
        "Vàng",
        "Xanh",
        "Đỏ",
        "Hồng",
        "Tím",
        "Xám",
    ];
    const osOptions = ["Android", "IOS"];
    
    const screenTechOptions = [
        "OLED",
        "AMOLED",
        "LCD",
        "IPS LCD",
        "Super AMOLED",
    ];
    const nfcOptions = ["Có", "Không"];
    const simOptions = ["1 SIM", "2 SIM", "eSIM"];
    const chargingPortOptions = ["Lightning", "Type-C", "Micro USB"];

    // Hàm validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate tên sản phẩm
        if (!product.name || product.name.trim() === "") {
            newErrors.name = "Vui lòng nhập tên sản phẩm";
        }
        // Validate số lượng
        if (!product.quantity || product.quantity <= 0) {
            newErrors.quantity = "Số lượng phải lớn hơn 0";
        }

        // Validate giá
        if (!product.price || product.price <= 0) {
            newErrors.price = "Giá phải lớn hơn 0";
        }

        setErrors(newErrors);
    };

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Thêm sản phẩm mới
            </Typography>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Thông tin cơ bản
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Tên sản phẩm"
                            name="name"
                            value={product.name}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Giá (VNĐ)"
                            name="price"
                            value={product.price}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                        />
                    </Grid>
                 
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Danh mục"
                            name="categoryId"
                            value={
                                categories.length > 0
                                    ? product?.categoryId || ""
                                    : ""
                            }
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        >
                            {categories.map((option) => (
                                <MenuItem key={option.id} value={option.id}>
                                    {option.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Giảm giá"
                                                name="promo"
                                                type="number"
                                                value={product?.promo}
                                                onChange={handleChange}
                                                fullWidth
                                                required
                                                margin="normal"
                                                inputProps={{ min: 0 }}
                                            />
                     </Grid>

                    <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1" gutterBottom>
                            Hình ảnh sản phẩm
                        </Typography>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        {imagePreview && (
                            <Box mt={2}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{ width: 325, height: 325 }}
                                />
                            </Box>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Mô tả"
                            name="description"
                            value={product.description}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            multiline
                            rows={4}
                        />
                    </Grid>

                    {/* Thêm thông tin cấu hình */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                            Cấu hình sản phẩm
                        </Typography>
                    </Grid>
                    {Object.keys(detail).map((key) => (
                        <Grid item xs={12} sm={6} key={key}>
                            <TextField
                                label={key}
                                name={key}
                                value={detail[key]}
                                onChange={handleDetailChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid>
                    ))}
                </Grid>

                <Box mt={3}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Thêm sản phẩm
                    </Button>
                    <Button
                        onClick={handleCancel}
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

export default AddProduct;
