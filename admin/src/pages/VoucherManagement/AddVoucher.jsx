import { useState } from "react";
import { Box, TextField, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config";

const AddVoucher = () => {
    const navigate = useNavigate();
    const [voucher, setVoucher] = useState({
        name: '',
        startDate: '',
        endDate: '',
        discountPercent: '',
        code: '',
        minOrderValue: '',
        maxDiscountAmount: ''
    });

    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        // Validate tên voucher
        if (!voucher.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên voucher';
        } else if (voucher.name.length < 3) {
            newErrors.name = 'Tên voucher phải có ít nhất 3 ký tự';
        }

        // Validate ngày bắt đầu
        if (!voucher.startDate) { // Đổi tên field
            newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
        }

        // Validate ngày kết thúc
        if (!voucher.endDate) { // Đổi tên field
            newErrors.endDate = 'Vui lòng chọn ngày kết thúc';
        } else if (new Date(voucher.endDate) <= new Date(voucher.startDate)) {
            newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        // Validate tỷ lệ giảm giá
        const discountPercent = Number(voucher.discountPercent);
        if (!voucher.discountPercent) {
            newErrors.discountPercent = 'Vui lòng nhập tỷ lệ giảm giá';
        } else if (isNaN(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
            newErrors.discountPercent = 'Tỷ lệ giảm giá phải từ 1% đến 100%';
        }

        // Validate mã áp dụng
        if (!voucher.code.trim()) { // Đổi tên field
            newErrors.code = 'Vui lòng nhập mã voucher';
        } else if (!/^[A-Z0-9]{3,20}$/.test(voucher.code)) {
            newErrors.code = 'Mã voucher chỉ được chứa chữ hoa và số, độ dài 3-20 ký tự';
        }

        // Validate giá trị đơn hàng tối thiểu
        if (!voucher.minOrderValue) {
            newErrors.minOrderValue = 'Vui lòng nhập giá trị đơn hàng tối thiểu';
        } else if (Number(voucher.minOrderValue) < 0) {
            newErrors.minOrderValue = 'Giá trị đơn hàng tối thiểu không thể âm';
        }

        // Validate số tiền giảm tối đa
        if (!voucher.maxDiscountAmount) {
            newErrors.maxDiscountAmount = 'Vui lòng nhập số tiền giảm tối đa';
        } else if (Number(voucher.maxDiscountAmount) < 0) {
            newErrors.maxDiscountAmount = 'Số tiền giảm tối đa không thể âm';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setVoucher(prev => ({
            ...prev,
            [name]: value
        }));
        // Xóa lỗi khi người dùng thay đổi giá trị
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Chuyển đổi dữ liệu để khớp với model
            const voucherData = {
                name: voucher.name,
                code: voucher.code,  // Đổi từ applicableCode sang code
                discountPercent: Number(voucher.discountPercent), // Đổi từ discountRate sang discountPercent
                startDate: voucher.startDate, // Đổi từ usageDate sang startDate
                endDate: voucher.endDate, // Đổi từ expirationDate sang endDate
                minOrderValue: Number(voucher.minOrderValue), // Thêm các trường bắt buộc theo model
                maxDiscountAmount: Number(voucher.maxDiscountAmount)
            };

            const response = await axios.post(`${BASE_URL}/api/addDiscountCode`, voucherData, {
                headers: { "Content-Type": "application/json" },
            });
            
            if (response.status === 201) {
                alert("Thêm voucher thành công");
                navigate("/voucher-management");
            } else {
                alert("Không thể thêm voucher");
            }
        } catch (error) {
            console.error("Lỗi khi thêm voucher:", error);
            alert(error.response?.data?.message || "Đã xảy ra lỗi khi thêm voucher");
        }
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
                            label="Ngày bắt đầu"
                            name="startDate"
                            type="date"
                            value={voucher.startDate}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={!!errors.startDate}
                            helperText={errors.startDate}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Ngày kết thúc"
                            name="endDate"
                            type="date"
                            value={voucher.endDate}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            error={!!errors.endDate}
                            helperText={errors.endDate}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Tỷ lệ giảm giá (%)"
                            name="discountPercent"
                            type="number"
                            value={voucher.discountPercent}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            inputProps={{ min: 1, max: 100 }}
                            error={!!errors.discountPercent}
                            helperText={errors.discountPercent}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Mã áp dụng"
                            name="code"
                            value={voucher.code}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.code}
                            helperText={errors.code || 'Chỉ sử dụng chữ hoa và số'}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Giá trị đơn hàng tối thiểu"
                            name="minOrderValue"
                            type="number"
                            value={voucher.minOrderValue}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            inputProps={{ min: 0 }}
                            error={!!errors.minOrderValue}
                            helperText={errors.minOrderValue}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Số tiền giảm tối đa"
                            name="maxDiscountAmount"
                            type="number"
                            value={voucher.maxDiscountAmount}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            inputProps={{ min: 0 }}
                            error={!!errors.maxDiscountAmount}
                            helperText={errors.maxDiscountAmount}
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
