import { useState, useEffect } from "react";
import {
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Pagination,
} from "@mui/material";
import { Delete, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import apiConfigInstance from "../../../SingletonParttern.js";
const API_URL = apiConfigInstance.getApiUrl();
import axios from "axios";

const UserManagement = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [page, setPage] = useState(1);
    const [accounts, setAccounts] = useState([]);

    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Roles`);
                console.log("role res", response);
                if (response.status === 200) {
                    setRoles(response.data); // Fix: Store role data in the roles state
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách roles:", error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Users`);
                if (response.status === 200) {
                    const data = response.data;
                    console.log("Fetched users:", data);
                    setUsers(data);
                } else {
                    console.error(
                        `Failed to fetch users: ${response.status} ${response.statusText}`
                    );
                    setUsers([]);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                setUsers([]);
            }
        };

        const fetchAccounts = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Accounts`);
                console.log("Accounts data:", response.data);
                if (response.status === 200) {
                    setAccounts(response.data);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh sách tài khoản:", error);
            }
        };

        fetchRole();
        fetchUsers();
        fetchAccounts();
    }, []);

    const handleViewDetails = (user) => {
        // Find the matching account for this user
        const matchingAccount = accounts.find((acc) => acc.userId === user.id);

        setSelectedUser({
            ...user,
            email: matchingAccount?.email || "Không có email",
        });
    };

    const handleCloseDialog = () => {
        setSelectedUser(null);
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setUsers(users.filter((user) => user.id !== userId));
            } else {
                console.error("Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleAddAccount = async (e) => {
        navigate("/add-user");
        e.preventDefault();
    };

    const filteredUsers = users
        .map((user) => {
            const account = accounts.find((acc) => acc.userId === user.id);
            return {
                ...user,
                email: account?.email || "Không có email",
                password: account?.password || "Không có mật khẩu",
            };
        })
        .filter(
            (user) =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.id?.toString().includes(searchTerm) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    // Tính toán số trang và dữ liệu hiển thị
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    // Fixed getRoleNameById function
    const getRoleNameById = (roleId) => {
        const role = roles.find((r) => r.id === roleId);
        return role ? role.name : "Unknown Role";
    };

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Quản lý người dùng
            </Typography>

            <TextField
                label="Tìm kiếm người dùng"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                }}
                margin="normal"
            />

            <Box marginY={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddAccount}
                >
                    Thêm người dùng
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Họ tên</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Số điện thoại liên lạc</TableCell>
                            <TableCell>Địa chỉ giao hàng</TableCell>
                            <TableCell>Quyền truy cập</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.id}</TableCell>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>
                                    {user.email || "Không có email"}
                                </TableCell>
                                <TableCell>
                                    {user.phone || "Không có"}
                                </TableCell>
                                <TableCell>{user.address}</TableCell>
                                <TableCell>
                                    {getRoleNameById(user.role)}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleViewDetails(user)}
                                        color="primary"
                                    >
                                        <Visibility />
                                    </IconButton>
                                    <IconButton
                                        onClick={() =>
                                            handleDeleteUser(user.id)
                                        }
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" marginTop={2}>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                />
            </Box>

            {selectedUser && (
                <Dialog
                    open={true}
                    onClose={handleCloseDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle
                        sx={{
                            borderBottom: "1px solid #e0e0e0",
                            padding: "16px 24px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6" component="div">
                            Thông tin chi tiết người dùng
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            component="span"
                            sx={{
                                backgroundColor:
                                    getRoleNameById(selectedUser.role) ===
                                    "ADMIN"
                                        ? "#ff9800"
                                        : "#4caf50",
                                color: "white",
                                padding: "4px 12px",
                                borderRadius: "16px",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                            }}
                        >
                            {getRoleNameById(selectedUser.role)}
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{ padding: "24px" }}>
                        <Box display="flex" gap={3}>
                            {/* Cột trái - Avatar và thông tin cơ bản */}
                            <Box flex={1}>
                                {selectedUser.userAvatar ? (
                                    <Box
                                        sx={{
                                            width: "200px",
                                            height: "200px",
                                            margin: "0 auto 20px",
                                            position: "relative",
                                            "& img": {
                                                width: "100%",
                                                height: "100%",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                border: "3px solid #e0e0e0",
                                            },
                                        }}
                                    >
                                        <img
                                            src={`${API_URL}/${selectedUser.userAvatar.replace(
                                                /\\/g,
                                                "/"
                                            )}`}
                                            alt={selectedUser.name}
                                        />
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            width: "200px",
                                            height: "200px",
                                            backgroundColor: "#f5f5f5",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto 20px",
                                            border: "3px solid #e0e0e0",
                                        }}
                                    >
                                        <Typography
                                            variant="h2"
                                            color="primary"
                                        >
                                            {selectedUser.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </Typography>
                                    </Box>
                                )}

                                <Box
                                    sx={{
                                        backgroundColor: "#f8f9fa",
                                        padding: 2,
                                        borderRadius: 1,
                                        textAlign: "center",
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        color="primary"
                                        gutterBottom
                                    >
                                        {selectedUser.name}
                                    </Typography>
                                    <Typography
                                        color="text.secondary"
                                        gutterBottom
                                    >
                                        @
                                        {selectedUser.accountName ||
                                            selectedUser.name
                                                .toLowerCase()
                                                .replace(/\s+/g, "_")}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            backgroundColor: "#e3f2fd",
                                            padding: "4px 8px",
                                            borderRadius: "4px",
                                            color: "#1976d2",
                                        }}
                                    >
                                        ID: {selectedUser.id}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Cột phải - Thông tin chi tiết */}
                            <Box flex={1.5}>
                                <Box
                                    sx={{
                                        display: "grid",
                                        gap: 2,
                                        "& .info-item": {
                                            backgroundColor: "#f8f9fa",
                                            padding: 2,
                                            borderRadius: 1,
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 0.5,
                                        },
                                        "& .label": {
                                            color: "#666",
                                            fontSize: "0.875rem",
                                            fontWeight: 500,
                                        },
                                        "& .value": {
                                            fontSize: "1rem",
                                            fontWeight: 400,
                                        },
                                    }}
                                >
                                    <Box className="info-item">
                                        <Typography className="label">
                                           Thành viên
                                        </Typography>
                                        <Typography className="value">
                                               { getRoleNameById(selectedUser.role)}
                                        </Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">
                                            Đã mua
                                        </Typography>
                                        <Typography className="value">
                                            {selectedUser.totalBuy || ""} VNĐ
                                        </Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">
                                            Email
                                        </Typography>
                                        <Typography className="value">
                                            {selectedUser.email ||
                                                "Không có email"}
                                        </Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">
                                            Số điện thoại
                                        </Typography>
                                        <Typography className="value">
                                            {selectedUser.phone || "Không có"}
                                        </Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">
                                            Địa chỉ giao hàng
                                        </Typography>
                                        <Typography className="value">
                                            {selectedUser.address ||
                                                "Không có thông tin"}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
};

export default UserManagement;
