import { useState } from "react";
import { Box, TextField, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import { notification } from "antd";

const AddVoucher = () => {
    const navigate = useNavigate();
    const [voucher, setVoucher] = useState({
        name: "",
        endAt: "",
        value: "",
        code: "",
        minPrice: "",
        maxValue: "",
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Validate tên voucher
        if (!voucher.name.trim()) {
            newErrors.name = "Vui lòng nhập tên voucher";
        } else if (voucher.name.length < 3) {
            newErrors.name = "Tên voucher phải có ít nhất 3 ký tự";
        }

        // Validate ngày kết thúc
        if (!voucher.endAt) {
            // Đổi tên field
            newErrors.endAt = "Vui lòng chọn ngày kết thúc";
        } 

        // Validate tỷ lệ giảm giá
        const value = Number(voucher.value);
        if (!voucher.value) {
            newErrors.value = "Vui lòng nhập tỷ lệ giảm giá";
        } else if (
            isNaN(value) ||
            value <= 0 ||
            value > 100
        ) {
            newErrors.value = "Tỷ lệ giảm giá phải từ 1% đến 100%";
        }

        // Validate mã áp dụng
        if (!voucher.code.trim()) {
            // Đổi tên field
            newErrors.code = "Vui lòng nhập mã voucher";
        } else if (!/^[A-Z0-9]{3,20}$/.test(voucher.code)) {
            newErrors.code =
                "Mã voucher chỉ được chứa chữ hoa và số, độ dài 3-20 ký tự";
        }

        // Validate giá trị đơn hàng tối thiểu
        if (!voucher.maxValue) {
            newErrors.maxValue =
                "Vui lòng nhập giá trị đơn hàng tối thiểu";
        } else if (Number(voucher.maxValue) < 0) {
            newErrors.maxValue = "Giá trị đơn hàng tối thiểu không thể âm";
        }

        // Validate số tiền giảm tối đa
        if (!voucher.maxValue) {
            newErrors.maxValue = "Vui lòng nhập số tiền giảm tối đa";
        } else if (Number(voucher.maxValue) < 0) {
            newErrors.maxValue = "Số tiền giảm tối đa không thể âm";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setVoucher((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Xóa lỗi khi người dùng thay đổi giá trị
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        const formattedVoucher = {
            ...voucher,
            endAt: `${voucher.endAt}T00:00:00`, 
        };
        console.log('promotion data: ', formattedVoucher);
        try {
           
            const response = await axios.post(
                `${API_URL}/api/Promotions`,
                formattedVoucher,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.status === 201) {
                notification.success({
                    message: 'Thành công',
                    description: "Thêm voucher thành công",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
                navigate("/voucher-management");
            } else {
                notification.error({
                    message: 'Thất bại',
                    description: "Không thể thêm voucher",
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
            }
        } catch (error) {
            console.error("Lỗi khi thêm voucher:", error);
            notification.error({
                message: "Thất bại",
                description:
                    error.response?.data?.message ||
                    "Đã xảy ra lỗi khi thêm voucher",
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true,
            });
        }
    };
    const formatDateForInput = (dateString) => {
        return dateString.split('T')[0]; 
    };
    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Thêm Voucher Mới
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Tên Voucher"
                            name="name"
                            value={voucher.name}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>
                   
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Ngày kết thúc"
                            name="endAt"
                            type="date"
                            value={voucher.endAt}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={!!errors.endAt}
                            helperText={errors.endAt}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Tỷ lệ giảm giá (%)"
                            name="value"
                            type="number"
                            value={voucher.value}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            inputProps={{ min: 1, max: 100 }}
                            error={!!errors.value}
                            helperText={errors.value}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Mã áp dụng"
                            name="code"
                            value={voucher.code}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.code}
                            helperText={
                                errors.code || "Chỉ sử dụng chữ hoa và số"
                            }
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Giá trị đơn hàng tối thiểu"
                            name="minPrice"
                            type="number"
                            value={voucher.minPrice}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            inputProps={{ min: 0 }}
                            error={!!errors.minPrice}
                            helperText={errors.minPrice}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Số tiền giảm tối đa"
                            name="maxValue"
                            type="number"
                            value={voucher.maxValue}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            inputProps={{ min: 0 }}
                            error={!!errors.maxValue}
                            helperText={errors.maxValue}
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
                        Thêm Voucher
                    </Button>
                    <Button
                        onClick={() => navigate("/voucher-management")}
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

export default AddVoucher;
