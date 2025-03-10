import { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    Grid,
    Typography,
    MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config.js";
import { message, notification } from "antd";

const AddUser = () => {
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        DateofBirth: "",
        role: "",
        address: "",
        accountName: "",
        totalBuy: 0,
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Roles`);
                if (response.status === 200) {
                    setRoles(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách vai trò:", error);
            }
        };
        fetchRole();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên";
        if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
        if (!formData.password.trim())
            newErrors.password = "Vui lòng nhập mật khẩu";
        if (!formData.phone.trim())
            newErrors.phone = "Vui lòng nhập số điện thoại";
        if (!formData.DateofBirth.trim())
            newErrors.DateofBirth = "Vui lòng chọn ngày sinh";
        if (!formData.address.trim())
            newErrors.address = "Vui lòng nhập địa chỉ";
        if (!formData.role) newErrors.role = "Vui lòng chọn vai trò";
        if (!formData.accountName.trim())
            newErrors.accountName = "Vui lòng nhập tên tài khoản";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            // Tạo FormData để gửi dữ liệu dạng multipart
            const formDataToSend = new FormData();
            formDataToSend.append("Name", formData.name);
            formDataToSend.append("Phone", formData.phone);
            formDataToSend.append("Address", formData.address);
            formDataToSend.append("Role", formData.role);
            formDataToSend.append("TotalBuy", formData.totalBuy || 0);

            formDataToSend.append("Password", formData.password);
            formDataToSend.append("CreatedAt", new Date().toISOString());

            // Gửi dữ liệu người dùng
            const userResponse = await axios.post(
                `${API_URL}/api/Users`,
                formDataToSend,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Response from Users:", userResponse.data);
            const userId = userResponse.data.id;

            // Gửi dữ liệu tài khoản
            const accountData = {
                userId: userId,
                email: formData.email,
                password: formData.password,
            };

            await axios.post(`${API_URL}/api/Accounts`, accountData, {
                headers: { "Content-Type": "application/json" },
            });

            notification.success({
                message: "Thành công",
                description: "Tạo tài khoản và người dùng thành công!",
                duration: 4,
                placement: "bottomRight",
            });

            navigate("/user-management");
        } catch (error) {
            console.error(
                "Lỗi khi tạo tài khoản hoặc người dùng:",
                error.response?.data || error
            );
            notification.error({
                message: "Thất bại",
                description: "Đã xảy ra lỗi khi tạo tài khoản hoặc người dùng.",
                duration: 4,
                placement: "bottomRight",
            });
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
                            value={formData.name}
                            onChange={handleInputChange}
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
                            name="DateofBirth"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            value={formData.DateofBirth}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.DateofBirth}
                            helperText={errors.DateofBirth}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
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
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.phone}
                            helperText={errors.phone}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Tên tài khoản"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleInputChange}
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
                            value={formData.password}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            select
                            label="Vai trò"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            margin="normal"
                            error={!!errors.role}
                            helperText={errors.role}
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.id} value={role.id}>
                                    {role.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Địa chỉ"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
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
