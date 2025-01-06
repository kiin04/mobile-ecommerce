import { useState, useEffect } from "react";
import { Box, TextField, Button, CircularProgress, Grid, Typography } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config";

const EditVoucher = () => {
    const { voucherId } = useParams();
    const navigate = useNavigate();
    const [voucher, setVoucher] = useState({
        name: '',
        startDate: '',
        endDate: '',
        discountPercent: 0,
        code: '',
        minOrderValue: 0,
        maxDiscountAmount: 0
    });
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchVoucher = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/discountCodes/${voucherId}`);
                if (response.data) {
                    console.log('Received voucher data:', response.data); // Thêm log
                    const voucherData = {
                        id: response.data.id,
                        name: response.data.name || '',
                        startDate: response.data.startDate ? new Date(response.data.startDate).toISOString().split('T')[0] : '',
                        endDate: response.data.endDate ? new Date(response.data.endDate).toISOString().split('T')[0] : '',
                        discountPercent: response.data.discountPercent || 0,
                        code: response.data.code || '',
                        minOrderValue: response.data.minOrderValue || 0,
                        maxDiscountAmount: response.data.maxDiscountAmount || 0
                    };
                    console.log('Processed voucher data:', voucherData); // Thêm log
                    setVoucher(voucherData);
                }
            } catch (error) {
                console.error("Lỗi khi tải voucher:", error);
                alert("Không thể tải thông tin voucher");
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

        // Validate ngày sử dụng
        if (!voucher?.startDate) {
            newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
        }

        // Validate ngày hết hạn
        if (!voucher?.endDate) {
            newErrors.endDate = 'Vui lòng chọn ngày hết hạn';
        } else if (new Date(voucher.endDate) <= new Date(voucher.startDate)) {
            newErrors.endDate = 'Ngày hết hạn phải sau ngày bắt đầu';
        }

        // Validate tỷ lệ giảm giá
        const discountPercent = Number(voucher?.discountPercent);
        if (!voucher?.discountPercent && voucher?.discountPercent !== 0) {
            newErrors.discountPercent = 'Vui lòng nhập tỷ lệ giảm giá';
        } else if (isNaN(discountPercent) || discountPercent < 0 || discountPercent > 100) {
            newErrors.discountPercent = 'Tỷ lệ giảm giá phải từ 0% đến 100%';
        }

        // Validate mã áp dụng
        if (!voucher?.code || !voucher.code.trim()) {
            newErrors.code = 'Vui lòng nhập mã voucher';
        } else if (!/^[A-Z0-9]{3,20}$/.test(voucher.code)) {
            newErrors.code = 'Mã voucher chỉ được chứa chữ hoa và số, độ dài 3-20 ký tự';
        }

        // Validate giá trị đơn hàng tối thiểu
        if (!voucher?.minOrderValue && voucher?.minOrderValue !== 0) {
            newErrors.minOrderValue = 'Vui lòng nhập giá trị đơn hàng tối thiểu';
        } else if (Number(voucher.minOrderValue) < 0) {
            newErrors.minOrderValue = 'Giá trị đơn hàng tối thiểu không thể âm';
        }

        // Validate số tiền giảm tối đa
        if (!voucher?.maxDiscountAmount && voucher?.maxDiscountAmount !== 0) {
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
            const updateData = {
                name: voucher.name,
                startDate: voucher.startDate,
                endDate: voucher.endDate,
                discountPercent: Number(voucher.discountPercent),
                code: voucher.code,
                minOrderValue: Number(voucher.minOrderValue),
                maxDiscountAmount: Number(voucher.maxDiscountAmount)
            };

            const response = await axios.put(
                `${BASE_URL}/api/discountCodes/${voucherId}`,
                updateData,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.status === 200) {
                alert("Cập nhật voucher thành công");
                navigate("/voucher-management");
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật voucher:", error);
            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật voucher";
            alert(errorMessage);
        }
    };

    if (loading) return <CircularProgress />;
    if (!voucher) return <div>Không tìm thấy voucher</div>;

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
                            label="Ngày hết hạn"
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
                            inputProps={{ min: 0, max: 100 }}
                            error={!!errors.discountPercent}
                            helperText={errors.discountPercent}
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
