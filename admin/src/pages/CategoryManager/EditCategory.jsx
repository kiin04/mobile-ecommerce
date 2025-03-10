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
const EditCategory = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // Thêm state cho hình ảnh mới
    const [catogoyImage, setCatogoryImage] = useState(
            category?.image ? `data:image/jpeg;base64,${category.image}` : ""
        );
    const [errors, setErrors] = useState({});


    // Fetch dữ liệu từ API
   
    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await fetch(
                    `${API_URL}/api/Categories/${categoryId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setCategory({ ...data });
                    console.log(data);
                    setCatogoryImage(
                        data.image ? `data:image/jpeg;base64,${data.image}` : ""
                    );
                } else {
                    throw new Error("Failed to fetch category");
                }
            } catch (error) {
                console.error("Error fetching category:", error);
                setError("Failed to load category data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [categoryId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Xóa error khi người dùng bắt đầu nhập lại
        setErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));

        setCategory({ ...category, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCategory({ ...category, image: file });
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        Object.keys(category).forEach((key) => {
            if (key === "image") {
                // Nếu có ảnh mới, thêm vào formData, nếu không giữ nguyên ảnh cũ
                if (imagePreview && category.image instanceof File) {
                    formData.append("image", category.image);
                }
            } else {
                formData.append(key, category[key]);
            }
            formData.append("createdAt", category.createdAt);
        });
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        try {
            const response = await fetch(
                `${API_URL}/api/Categories/${categoryId}`,
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
                    description: "Danh mục đã được cập nhật thành công",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
                navigate("/category-management");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật danh mục:", error);
            notification.error({
                message: 'Thất bại',
                description: "Lỗi khi cập nhật danh mục: " + error.message,
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true
            });
        }
    };

    const handleCancel = () => {
        navigate("/category-management"); // Quay lại trang quản lý danh mục
    };

    // Thêm hàm validate
    const validateForm = () => {
        const newErrors = {};

        // Validate tên danh mục
        if (!category?.name || !category.name.trim()) {
            newErrors.name = "Vui lòng nhập tên danh mục";
        }
  
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (!category) return <Typography>Không tìm thấy danh mục</Typography>;

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Chỉnh sửa danh mục
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}  md={10}>
                        <TextField
                            label="Tên danh mục"
                            name="name"
                            value={category?.name || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                        />
                    </Grid>

                 
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
                            catogoyImage && (
                                <Box mt={4}>
                                    <img
                                        src={catogoyImage}
                                        alt="Preview"
                                        style={{ maxWidth: "400px" }}
                                    />
                                </Box>
                            )
                        )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            label="Mô tả"
                            name="description"
                            value={category?.description || ""}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            multiline
                            rows={4}
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
                        Cập nhật danh mục
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

export default EditCategory;
