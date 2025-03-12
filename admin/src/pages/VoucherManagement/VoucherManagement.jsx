import { useState, useEffect } from "react";
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Dialog, DialogTitle, DialogContent, IconButton, Pagination } from "@mui/material";
import { Edit, Delete, Visibility, Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {format} from "date-fns"
import axios from "axios";
import { API_URL } from '../../config.js'

const examplePromotion = [
    {
        id: "V001",
        name: "GIAM10",
        startDate: "2024/09/09",
        endDate: "31/12/2023",
        discountRate: 10,
        applyCode: "ALL"
    },
    {
        id: "V002",
        name: "MUADOI",
        startDate: "2023/12/01",
        endDate: "2023/12/10",
        discountRate: 50,
        applyCode: "SP001"
    }
];

const VoucherManagement = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [promotion, setPromotion] = useState(examplePromotion);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/Promotions`);
                if (response.status === 200) {
                    const data = response.data;
                    setPromotion(data);
                } else {
                    console.error(`Failed to fetch Promotion: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error("Error fetching Promotion:", error);
            }
        };
        fetchPromotion();
    }, []);

    const handleViewDetails = (voucher) => {
        setSelectedVoucher(voucher);
    };

    const handleCloseDialog = () => {
        setSelectedVoucher(null);
    };

    const handleDeleteVoucher = async (voucherId) => {
        try {
            const response = await axios.delete(`${API_URL}/api/Promotions/${voucherId}`);
            if (response.status === 204) {
                setPromotion(promotion.filter((voucher) => voucher.id !== voucherId));
            } else {
                console.error("Failed to delete voucher");
            }
        } catch (error) {
            console.error("Error deleting voucher:", error);
        }
    };

    const handleAddVoucher = () => {
        navigate("/add-voucher");
    };

    const handleEditVoucher = (voucherId) => {
        navigate(`/edit-voucher/${voucherId}`);
    };

    const filteredPromotion = promotion.filter(
        (promotion) =>
            (promotion.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (promotion.id?.includes(searchTerm) || false)
    );

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredPromotion.length / rowsPerPage);
    const paginatedPromotion = filteredPromotion.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    );

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    return (
        <Box padding={3}>
            <Typography variant="h4" gutterBottom>
                Quản lý mã giảm giá
            </Typography>

            <TextField
                label="Tìm kiếm mã giảm giá"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);  // Reset về trang 1 khi tìm kiếm
                }}
                margin="normal"
            />

            <Box marginY={2}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddVoucher}
                >
                    Thêm mã giảm giá
                </Button>
            </Box>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Tên mã</TableCell>
                            <TableCell>Ngày sử dụng</TableCell>
                            <TableCell>Ngày hết hạn</TableCell>
                            <TableCell>Tỉ lệ chiết khấu</TableCell>
                            <TableCell>Mã áp dụng</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedPromotion.map((voucher) => (
                            <TableRow key={voucher.id}>
                                <TableCell>{voucher.id}</TableCell>
                                <TableCell>{voucher.name}</TableCell>
                                <TableCell>
                                    {new Date(voucher.createdAt || voucher.usageDate).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell>
                                    {new Date(voucher.endAt || voucher.expirationDate).toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell>
                                    {(voucher.value || voucher.value)}%
                                </TableCell>
                                <TableCell>{voucher.code }</TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => handleViewDetails(voucher)}
                                        color="primary"
                                    >
                                        <Visibility />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleEditVoucher(voucher.id)}
                                        color="secondary"
                                    >
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDeleteVoucher(voucher.id)}
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

            {selectedVoucher && (
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
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Chi tiết mã giảm giá
                            </Typography>
                            <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                    color: 'text.secondary',
                                    fontWeight: 500
                                }}
                            >
                                #{selectedVoucher.id}
                            </Typography>
                        </Box>
                        <IconButton onClick={handleCloseDialog} size="small">
                            <Close />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ padding: '24px' }}>
                        <Box display="flex" gap={3}>
                            {/* Cột trái - Thông tin cơ bản */}
                            <Box flex={1}>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    Thông tin chung
                                </Typography>
                                
                                <Box 
                                    sx={{ 
                                        backgroundColor: '#f8f9fa',
                                        padding: 3,
                                        borderRadius: 2,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2.5
                                    }}
                                >
                                    <Box>
                                        <Typography 
                                            variant="h4" 
                                            sx={{ 
                                                color: 'primary.main',
                                                fontWeight: 'bold',
                                                textAlign: 'center',
                                                backgroundColor: '#fff',
                                                padding: 2,
                                                borderRadius: 1,
                                                border: '2px dashed',
                                                borderColor: 'primary.main'
                                            }}
                                        >
                                            {selectedVoucher.name}
                                        </Typography>
                                    </Box>

                                    <Box 
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Typography 
                                            variant="h3" 
                                            color="error.main" 
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            {(selectedVoucher.value || s0)}%
                                        </Typography>
                                        <Typography variant="h6">giảm</Typography>
                                    </Box>

                                    <Box 
                                        sx={{ 
                                            textAlign: 'center',
                                            backgroundColor: '#fff',
                                            padding: 1.5,
                                            borderRadius: 1
                                        }}
                                    >
                                        <Typography 
                                            sx={{ 
                                                color: selectedVoucher.code === 'ALL' ? 'success.main' : 'text.primary',
                                                fontWeight: 500
                                            }}
                                        >
                                            Mã áp dụng: {selectedVoucher.code }
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Cột phải - Thông tin chi tiết */}
                            <Box flex={1.5}>
                                <Typography variant="h6" color="primary" gutterBottom>
                                    Điều kiện áp dụng
                                </Typography>

                                <Box 
                                    sx={{ 
                                        display: 'grid',
                                        gap: 2,
                                        '& .info-item': {
                                            backgroundColor: '#f8f9fa',
                                            padding: 2,
                                            borderRadius: 1,
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        },
                                        '& .label': {
                                            color: '#666',
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        },
                                        '& .value': {
                                            fontSize: '1rem',
                                            fontWeight: 500
                                        }
                                    }}
                                >
                                    <Box className="info-item">
                                        <Typography className="label">Thời gian bắt đầu</Typography>
                                        <Typography className="value">
                                            {format(new Date(selectedVoucher.createdAt), 'dd/MM/yyyy HH:mm')}
                                        </Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">Thời gian kết thúc</Typography>
                                        <Typography className="value">
                                            {format(new Date(selectedVoucher.endAt ), 'dd/MM/yyyy HH:mm')}
                                        </Typography>
                                    </Box>

                                    <Box className="info-item">
                                        <Typography className="label">Đơn hàng tối thiểu</Typography>
                                        <Typography className="value" color="primary">
                                            {selectedVoucher.minPrice?.toLocaleString('vi-VN')} ₫
                                        </Typography>
                                    </Box>

                                    {/* <Box className="info-item">
                                        <Typography className="label">Giảm tối đa</Typography>
                                        <Typography className="value" color="error">
                                            {selectedVoucher.maxDiscountAmount?.toLocaleString('vi-VN')} ₫
                                        </Typography>
                                    </Box> */}

                                    <Box 
                                        sx={{ 
                                            backgroundColor: '#fff3e0', 
                                            padding: 2, 
                                            borderRadius: 1,
                                            border: '1px solid #ffe0b2'
                                        }}
                                    >
                                        <Typography variant="body2" color="warning.dark">
                                            <strong>Lưu ý:</strong> Mã giảm giá chỉ áp dụng một lần cho mỗi đơn hàng và không thể kết hợp với các mã giảm giá khác.
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

export default VoucherManagement;
