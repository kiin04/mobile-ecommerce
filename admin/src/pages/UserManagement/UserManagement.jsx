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
import { BASE_URL } from '../../config.js';

const UserManagement = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/users`);
                if (response.ok) {
                    const data = await response.json();
                    setUsers(data);
                } else {
                    console.error(`Failed to fetch users: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    const handleViewDetails = (user) => {
        setSelectedUser(user);
    };

    const handleCloseDialog = () => {
        setSelectedUser(null);
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await fetch(
                `${BASE_URL}/api/users/${userId}`,
                {
                    method: "DELETE",
                }
            );
            if (response.ok) {
                setUsers(users.filter((user) => user.id !== userId));
            } else {
                console.error("Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleAddUser = () => {
        navigate("/add-user");
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.includes(searchTerm)
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
                <Button variant="contained" color="primary" onClick={handleAddUser}>
                    Thêm người dùng
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Họ tên</TableCell>
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
                                <TableCell>{user.phoneNumber}</TableCell>
                                <TableCell>{user.address}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleViewDetails(user)}
                                        color="primary"
                                    >
                                        <Visibility />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDeleteUser(user.id)}
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
                            borderBottom: '1px solid #e0e0e0',
                            padding: '16px 24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Typography variant="h6">Thông tin chi tiết người dùng</Typography>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                backgroundColor: selectedUser.role === 'ADMIN' ? '#ff9800' : '#4caf50',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '16px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}
                        >
                            {selectedUser.role}
                        </Typography>
                    </DialogTitle>

                    <DialogContent sx={{ padding: '24px' }}>
                        <Box display="flex" gap={3}>
                            {/* Cột trái - Avatar và thông tin cơ bản */}
                            <Box flex={1}>
                                {selectedUser.userAvatar ? (
                                    <Box 
                                        sx={{
                                            width: '200px',
                                            height: '200px',
                                            margin: '0 auto 20px',
                                            position: 'relative',
                                            '& img': {
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                objectFit: 'cover',
                                                border: '3px solid #e0e0e0'
                                            }
                                        }}
                                    >
                                        <img 
                                            src={`${BASE_URL}/${selectedUser.userAvatar.replace(/\\/g, '/')}`}
                                            alt={selectedUser.name}
                                        />
                                    </Box>
                                ) : (
                                    <Box 
                                        sx={{
                                            width: '200px',
                                            height: '200px',
                                            backgroundColor: '#f5f5f5',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 20px',
                                            border: '3px solid #e0e0e0'
                                        }}
                                    >
                                        <Typography variant="h2" color="primary">
                                            {selectedUser.name.charAt(0).toUpperCase()}
                                        </Typography>
                                    </Box>
                                )}

                                <Box 
                                    sx={{ 
                                        backgroundColor: '#f8f9fa',
                                        padding: 2,
                                        borderRadius: 1,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h6" color="primary" gutterBottom>
                                        {selectedUser.name}
                                    </Typography>
                                    <Typography color="text.secondary" gutterBottom>
                                        @{selectedUser.accountName}
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            backgroundColor: '#e3f2fd',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            color: '#1976d2'
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
                                        display: 'grid',
                                        gap: 2,
                                        '& .info-item': {
                                            backgroundColor: '#f8f9fa',
                                            padding: 2,
                                            borderRadius: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.5
                                        },
                                        '& .label': {
                                            color: '#666',
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        },
                                        '& .value': {
                                            fontSize: '1rem',
                                            fontWeight: 400
                                        }
                                    }}
                                >
                                    <Box className="info-item">
                                        <Typography className="label">MongoDB ID</Typography>
                                        <Typography className="value">{selectedUser._id}</Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">Ngày sinh</Typography>
                                        <Typography className="value">
                                            {new Date(selectedUser.dayOfBirth).toLocaleDateString('vi-VN')}
                                        </Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">Giới tính</Typography>
                                        <Typography className="value">{selectedUser.gender}</Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">Email</Typography>
                                        <Typography className="value">{selectedUser.email}</Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">Số điện thoại</Typography>
                                        <Typography className="value">{selectedUser.phoneNumber}</Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">Địa chỉ giao hàng</Typography>
                                        <Typography className="value">{selectedUser.address}</Typography>
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
