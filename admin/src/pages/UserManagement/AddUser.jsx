import { useState } from "react";
import { Box, TextField, Button, Grid, Typography, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from '../../config.js';

const AddUser = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        dayOfBirth: "",
        gender: "",
        address: "",
        accountName: "",
    });

    const [errors, setErrors] = useState({});

    const genderOptions = [
        { value: 'Nam', label: 'Nam' },
        { value: 'Nữ', label: 'Nữ' },
        { value: 'Khác', label: 'Khác' }
    ];

    const validateForm = () => {
        const newErrors = {};
        
        // Validate tên
        if (!user.name.trim()) {
            newErrors.name = 'Vui lòng nhập tên';
        } else if (user.name.length < 2) {
            newErrors.name = 'Tên phải có ít nhất 2 ký tự';
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!user.email) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!emailRegex.test(user.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        // Validate mật khẩu
        if (!user.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (user.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        // Validate số điện thoại
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!user.phoneNumber) {
            newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
        } else if (!phoneRegex.test(user.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
        }

        // Validate ngày sinh
        if (!user.dayOfBirth) {
            newErrors.dayOfBirth = 'Vui lòng chọn ngày sinh';
        } else {
            const birthDate = new Date(user.dayOfBirth);
            const today = new Date();
            if (birthDate > today) {
                newErrors.dayOfBirth = 'Ngày sinh không hợp lệ';
            }
        }

        // Validate giới tính
        if (!user.gender) {
            newErrors.gender = 'Vui lòng chọn giới tính';
        }

        // Validate địa chỉ
        if (!user.address.trim()) {
            newErrors.address = 'Vui lòng nhập địa chỉ';
        }

        // Validate tên tài khoản
        if (!user.accountName.trim()) {
            newErrors.accountName = 'Vui lòng nhập tên tài khoản';
        } else if (user.accountName.length < 4) {
            newErrors.accountName = 'Tên tài khoản phải có ít nhất 4 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser({ ...user, [name]: value });
        // Xóa lỗi khi người dùng thay đổi giá trị
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const response = await axios.post(`${BASE_URL}/api/addUser`, user);
            if (response.status === 201) {
                alert(response.data.message);
                navigate("/user-management");
            }
        } catch (error) {
            console.error("Lỗi khi tạo tài khoản:", error);
            if (error.response?.data?.message) {
                // Hiển thị thông báo lỗi cụ thể từ server
                alert(error.response.data.message);
                
                // Nếu có lỗi về trùng lặp, cập nhật trạng thái lỗi
                if (error.response.data.emailExists) {
                    setErrors(prev => ({ ...prev, email: 'Email đã tồn tại' }));
                }
                if (error.response.data.phoneExists) {
                    setErrors(prev => ({ ...prev, phoneNumber: 'Số điện thoại đã tồn tại' }));
                }
                if (error.response.data.accountNameExists) {
                    setErrors(prev => ({ ...prev, accountName: 'Tên tài khoản đã tồn tại' }));
                }
            } else {
                alert("Đã xảy ra lỗi khi tạo tài khoản");
            }
        }
    };

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Thêm người dùng
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Tên"
                            name="name"
                            value={user.name}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Ngày sinh"
                            name="dayOfBirth"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={user.dayOfBirth}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.dayOfBirth}
                            helperText={errors.dayOfBirth}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Giới tính"
                            name="gender"
                            value={user.gender}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.gender}
                            helperText={errors.gender}
                        >
                            {genderOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={user.email}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Số điện thoại"
                            name="phoneNumber"
                            value={user.phoneNumber}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.phoneNumber}
                            helperText={errors.phoneNumber}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Tên tài khoản"
                            name="accountName"
                            value={user.accountName}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.accountName}
                            helperText={errors.accountName}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Mật khẩu"
                            name="password"
                            type="password"
                            value={user.password}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Địa chỉ"
                            name="address"
                            value={user.address}
                            onChange={handleChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.address}
                            helperText={errors.address}
                            multiline
                            rows={2}
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
                        Thêm người dùng
                    </Button>
                    <Button
                        onClick={() => navigate("/user-management")}
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

export default AddUser;
