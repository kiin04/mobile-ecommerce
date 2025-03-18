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
const AddCategory = () => {
    const navigate = useNavigate();
   
    const [error, setError] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); 
    const [errors, setErrors] = useState({});

   const [category, setCategory] = useState({
          name: "",
          description: "",
          image: null,
      });
   

    const handleChange = (e) => {
        const { name, value } = e.target;
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
            formData.append("name", category.name);
            formData.append("description", category.description);
           
            if (category.image instanceof File) {
                formData.append("image", category.image);
            }
          
        });
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        try {
            const response = await fetch(
                `${API_URL}/api/Categories`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            console.log("post response", response);
            console.log(response);
            if (response.ok) {
                notification.success({
                    message: 'Thành công',
                    description: "Danh mục đã thêm nhật thành công",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
                navigate("/category-management");
            }
        } catch (error) {
            console.error("Lỗi khi thêm danh mục:", error);
            notification.error({
                message: 'Thất bại',
                description: "Lỗi khi thêm danh mục: " + error.message,
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
  
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
               Thêm danh mục
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
                        {imagePreview &&(
                            <Box mt={4}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    style={{ maxWidth: "400px" }}
                                />
                            </Box>
                        )  }
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
                        Thêm danh mục danh mục
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

export default AddCategory;
