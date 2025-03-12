import { useState, useEffect } from "react";
import { message, notification } from "antd";
import { Box, TextField, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {format} from "date-fns";
import { API_URL } from "../../config";

const EditVoucher = () => {
    const { voucherId } = useParams();
    const navigate = useNavigate();
    const [voucher, setVoucher] = useState({
    });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchVoucher = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Promotions/${voucherId}`);
                console.log(response.data);
                if (response.status == 200) {
                    const data = await response.data;
                    console.log('voucher data', data);
                    setVoucher(data);
                }
            } catch (error) {
                console.error("Lỗi khi tải voucher:", error);
                message.error("Không thể tải thông tin voucher");
            } finally {
                setLoading(false);
            }
        };

        if (voucherId) {
            fetchVoucher();
        }
    }, [voucherId]);

    const validateForm = () => {
        const newErrors = {};

        // Validate tên voucher
        if (!voucher?.name || !voucher.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên voucher';
        } else if (voucher.name.length < 3) {
            newErrors.name = 'Tên voucher phải có ít nhất 3 ký tự';
        }

        // Validate ngày hết hạn
        if (!voucher?.endAt) {
            newErrors.endAt = 'Vui lòng chọn ngày hết hạn';
        } else if (new Date(voucher.endAt) <= new Date(voucher.createdAt)) {
            newErrors.endAt = 'Ngày hết hạn phải sau ngày bắt đầu';
        }

        // Validate tỷ lệ giảm giá
        const value = Number(voucher?.value);
        if (!voucher?.value && voucher?.value !== 0) {
            newErrors.value = 'Vui lòng nhập tỷ lệ giảm giá';
        } else if (isNaN(value) || value < 0 || value > 100) {
            newErrors.value = 'Tỷ lệ giảm giá phải từ 0% đến 100%';
        }

        // Validate mã áp dụng
        if (!voucher?.code || !voucher.code.trim()) {
            newErrors.code = 'Vui lòng nhập mã voucher';
        } else if (!/^[A-Z0-9]{3,20}$/.test(voucher.code)) {
            newErrors.code = 'Mã voucher chỉ được chứa chữ hoa và số, độ dài 3-20 ký tự';
        }

        // Validate giá trị đơn hàng tối thiểu
        if (!voucher?.minPrice && voucher?.minPrice !== 0) {
            newErrors.minPrice = 'Vui lòng nhập giá trị đơn hàng tối thiểu';
        } else if (Number(voucher.minPrice) < 0) {
            newErrors.minPrice = 'Giá trị đơn hàng tối thiểu không thể âm';
        }

        // Validate số tiền giảm tối đa
        if (!voucher?.maxValue && voucher?.maxValue !== 0) {
            newErrors.maxValue = 'Vui lòng nhập số tiền giảm tối đa';
        } else if (Number(voucher.maxValue) < 0) {
            newErrors.maxValue = 'Số tiền giảm tối đa không thể âm';
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
          

            const response = await axios.put(
                `${API_URL}/api/Promotions/${voucherId}`,voucher,
                {headers: { "Content-Type": "application/json" },}
            );
            console.log('response update', response);
            if (response.status == 204) {
                notification.success({
                    message: 'Thành công',
                    description: 'Cập nhật voucher thành công.',
                    duration: 4,
                    placement: "bottomRight",
                    showProgress: true,
                    pauseOnHover: true
                });
                navigate("/voucher-management");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật voucher:", error);
            notification.error({
                message: 'Thất bại',
                description: error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật voucher",
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true
            });
        }
    };

    if (loading) return <CircularProgress />;
    if (!voucher) return <div>Không tìm thấy voucher</div>;
    const formatDateForInput = (dateString) => {
        return dateString.split('T')[0]; 
    };
    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Chỉnh sửa Voucher
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
                            label="Ngày tạo"
                          
                            value={formatDateForInput(voucher.createdAt)} 
                            fullWidth
                            required
                            aria-readonly:true
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
                            label="Ngày hết hạn"
                            name="endAt"
                            type="date"
                            value={formatDateForInput(voucher.endAt)} 
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
                            inputProps={{ min: 0, max: 100 }}
                            error={!!errors.value}
                            helperText={errors.value}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                        Cập nhật Voucher
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

export default EditVoucher;
