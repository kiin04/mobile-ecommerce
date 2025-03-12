import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    CircularProgress,
    MenuItem,
    DialogTitle,
    DialogContent,
    IconButton,
    Pagination,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../../config.js";
import { useQuery } from "@tanstack/react-query";
import ColorSize from "../../components/ColorSize.jsx";
import Detail from "../../components/Detail.jsx";
import axios from "axios";
import { notification } from "antd";
const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // Thêm state cho hình ảnh mới
    const [productImage, setProductImage] = useState(
            product?.image ? `data:image/jpeg;base64,${product.image}` : ""
        );
    const [errors, setErrors] = useState({});

    const brandOptions = [
        "Apple",
        "Samsung",
        "Oppo",
        "Xiaomi",
        "Vivo",
        "Realme",
        "Huawei",
        "Nokia",
        "LG",
        "Lenovo",
        "Asus",
        "Google",
        "Microsoft",
        "BlackBerry",
        "HTC",
        "Sony",
        "Motorola",
        "OnePlus",
        "Razer",
        "ZTE",
        "Meizu",
        "Nubia",
    ];

    // Fetch dữ liệu từ API
    const fetchCategory = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Categories`);

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
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/Products/${productId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setProduct({ ...data });
                    setProductImage(
                        data.image ? `data:image/jpeg;base64,${data.image}` : ""
                    );
                    console.log('product detail ', data);
                } else {
                    throw new Error("Failed to fetch product");
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                setError("Failed to load product data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Xóa error khi người dùng bắt đầu nhập lại
        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));

        if (name === "price" && Number(value) <= 0) {
            setErrors((prev) => ({
                ...prev,
                price: "Giá phải lớn hơn 0",
            }));
        }

        setProduct({ ...product, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProduct({ ...product, image: file });
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (!validateForm()) {
        //     return;
        // }

        const formData = new FormData();

        Object.keys(product).forEach((key) => {
            if (key === "image") {
                // Nếu có ảnh mới, thêm vào formData, nếu không giữ nguyên ảnh cũ
                if (imagePreview && product.image instanceof File) {
                    formData.append("image", product.image);
                }
            } else {
                formData.append(key, product[key]);
            }
            formData.append("createdAt", product.createdAt);
        });
        console.log("📝 FormData nội dung:");
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        try {
            const response = await fetch(
                `${API_URL}/api/Products/${productId}`,
                {
                    method: "PUT",
                    body: formData,
                }
            );
            console.log("update response", response);
            console.log(response);
            if (response.ok) {
                notification.success({
                    message: 'Thành công',
                    description: "Sản phẩm đã được cập nhật thành công",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
                navigate("/product-management");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật sản phẩm:", error);
            notification.error({
                message: 'Thất bại',
                description: "Lỗi khi cập nhật sản phẩm: " + error.message,
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true
            });
        }
    };

    const handleCancel = () => {
        navigate("/product-management"); // Quay lại trang quản lý sản phẩm
    };

    // Thêm hàm validate
    const validateForm = () => {
        const newErrors = {};

        // Validate tên sản phẩm
        if (!product?.name || !product.name.trim()) {
            newErrors.name = "Vui lòng nhập tên sản phẩm";
        }

        // Validate giá
        if (!product?.price || product.price <= 0) {
            newErrors.price = "Giá phải lớn hơn 0";
        }
        // Validate cấu hình
        if (product?.cauhinh) {
            // Validate kích thước màn hình
            if (!product.cauhinh.kichThuocManHinh) {
                newErrors["cauhinh.kichThuocManHinh"] =
                    "Vui lòng nhập kích thước màn hình";
            } else if (
                !/^\d+(\.\d+)?\"$/.test(product.cauhinh.kichThuocManHinh)
            ) {
                newErrors["cauhinh.kichThuocManHinh"] =
                    'Định dạng không hợp lệ (ví dụ: 6.1")';
            }

            // Validate camera sau
            if (!product.cauhinh.cameraSau) {
                newErrors["cauhinh.cameraSau"] = "Vui lòng nhập camera sau";
            } else if (!/^\d+MP$/.test(product.cauhinh.cameraSau)) {
                newErrors["cauhinh.cameraSau"] =
                    "Định dạng không hợp lệ (ví dụ: 12MP)";
            }

            // Validate camera trước
            if (!product.cauhinh.cameraTruoc) {
                newErrors["cauhinh.cameraTruoc"] = "Vui lòng nhập camera trước";
            } else if (!/^\d+MP$/.test(product.cauhinh.cameraTruoc)) {
                newErrors["cauhinh.cameraTruoc"] =
                    "Định dạng không hợp lệ (ví dụ: 12MP)";
            }

            // Validate chipset
            if (!product.cauhinh.chipset) {
                newErrors["cauhinh.chipset"] = "Vui lòng nhập chipset";
            }

            // Validate GPU
            if (!product.cauhinh.gpu) {
                newErrors["cauhinh.gpu"] = "Vui lòng nhập GPU";
            }

            // Validate RAM
            if (!product.cauhinh.dungLuongRAM) {
                newErrors["cauhinh.dungLuongRAM"] = "Vui lòng nhập RAM";
            } else if (!/^\d+GB$/.test(product.cauhinh.dungLuongRAM)) {
                newErrors["cauhinh.dungLuongRAM"] =
                    "Định dạng không hợp lệ (ví dụ: 8GB)";
            }

            // Validate bộ nhớ trong
            if (!product.cauhinh.boNhoTrong) {
                newErrors["cauhinh.boNhoTrong"] = "Vui lòng nhập bộ nhớ trong";
            } else if (!/^\d+GB$/.test(product.cauhinh.boNhoTrong)) {
                newErrors["cauhinh.boNhoTrong"] =
                    "Định dạng không hợp lệ (ví dụ: 128GB)";
            }

            // Validate thẻ SIM
            if (!product.cauhinh.theSIM) {
                newErrors["cauhinh.theSIM"] = "Vui lòng chọn thẻ SIM";
            }

            // Validate cổng sạc
            if (!product.cauhinh.congSac) {
                newErrors["cauhinh.congSac"] = "Vui lòng chọn cổng sạc";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!product) return <Typography>Không tìm thấy sản phẩm</Typography>;

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Chỉnh sửa sản phẩm
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Tên sản phẩm"
                            name="name"
                            value={product?.name || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Giá"
                            name="price"
                            type="number"
                            value={product?.price || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            inputProps={{ min: 0 }}
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

                  {/* <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            label="Thương hiệu"
                            name="brand"
                            value={product?.brand || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        >
                            {brandOptions.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>*/ }  
                 

                 

                    <Grid item xs={12} sm={4}>
                        <input
                            accept="image/*"
                            type="file"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            id="image-upload"
                        />
                        <label htmlFor="image-upload">
                            <Button variant="contained" component="span">
                                Chọn hình ảnh
                            </Button>
                        </label>
                        {imagePreview ? (
                            <Box mt={4}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{ maxWidth: "400px" }}
                                />
                            </Box>
                        ) : (
                            productImage && (
                                <Box mt={4}>
                                    <img
                                        src={productImage}
                                        alt="Preview"
                                        style={{ maxWidth: "400px" }}
                                    />
                                </Box>
                            )
                        )}
                    </Grid>
                    <ColorSize productId={product.id}></ColorSize>
                    <Grid item xs={12}>
                        <TextField
                            label="Mô tả"
                            name="description"
                            value={product?.description || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            multiline
                            rows={4}
                        />
                    </Grid>
                    <Detail productId={product.id}></Detail>
                </Grid>

                <Box mt={3}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Cập nhật sản phẩm
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

export default EditProduct;
