import React, { useState, useEffect } from 'react';
import {
  Box,
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
  TextField,
  MenuItem,
  Pagination,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config.js';
import * as XLSX from 'xlsx';

const KhoManagement = () => {
  const navigate = useNavigate();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(`${API_URL}/api/kho`);
        if (response.ok) {
          const data = await response.json();
          setEntries(data);
        } else {
          console.error('Failed to fetch entries:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching entries:', error.message || error);
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Failed to fetch products:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching products:', error.message || error);
      }
    };

    fetchEntries();
    fetchProducts();
  }, []);

  const handleViewDetails = async (entryId) => {
    try {
      const response = await fetch(`${API_URL}/api/kho/${entryId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedEntry(data);
      } else {
        console.error('Failed to fetch entry details:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching entry details:', error.message || error);
    }
  };

  const handleCloseDialog = () => {
    setSelectedEntry(null);
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      const response = await fetch(`${API_URL}/api/kho/${entryId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEntries(entries.filter(entry => entry.id !== entryId));
      } else {
        console.error('Failed to delete entry:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error deleting entry:', error.message || error);
    }
  };

  const handleEditEntry = (entryId) => {
    navigate(`/edit-kho/${entryId}`);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesType = typeFilter ? entry.type === typeFilter : true;
    const matchesDate = dateFilter ? entry.date.split('T')[0] === dateFilter : true;
    return matchesType && matchesDate;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage);
  const paginatedEntries = filteredEntries.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const exportToExcel = () => {
    if (!selectedEntry) return;

    // Chuẩn bị dữ liệu cho sheet thông tin chung
    const generalInfo = [
      ['Thông tin phiếu xuất/nhập kho'],
      ['Số phiếu', selectedEntry.id],
      ['Tên người quản lý', selectedEntry.managementPerson],
      ['Tên người xuất', selectedEntry.responsiblePerson],
      ['Ngày', selectedEntry.date.split('T')[0]],
      ['Mã kho', selectedEntry.warehouseCode],
      ['Địa điểm', selectedEntry.location],
      ['Ghi chú', selectedEntry.notes],
      [],
      ['Danh sách sản phẩm']
    ];

    // Chuẩn bị dữ liệu cho danh sách sản phẩm
    const productHeaders = ['STT', 'Mã sản phẩm', 'Tên sản phẩm', 'Màu sắc', 'Số lượng'];
    const productData = selectedEntry.products.map((product, index) => {
      const productDetails = products.find(p => p.id === product.productId) || {};
      return [
        index + 1,
        productDetails.id || product.productId,
        productDetails.name || product.productName,
        productDetails.color || product.color,
        product.quantity
      ];
    });

    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ...generalInfo,
      productHeaders,
      ...productData,
      [],
      ['Xác nhận'],
      ['Nhân viên xuất hàng', selectedEntry.responsiblePerson],
      ['Nhân viên quản lý kho', selectedEntry.managementPerson]
    ]);

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Phiếu xuất nhập kho');

    // Tải file Excel
    XLSX.writeFile(wb, `Phieu_xuat_nhap_kho_${selectedEntry.id}.xlsx`);
  };

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>Quản lý phiếu xuất nhập kho</Typography>

      <Box marginBottom={2} display="flex" alignItems="center">
        <TextField
          select
          label="Loại phiếu"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);  // Reset về trang 1 khi lọc
          }}
          variant="outlined"
          style={{ marginRight: '1rem', minWidth: '120px' }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="Xuất">Xuất</MenuItem>
          <MenuItem value="Nhập">Nhập</MenuItem>
        </TextField>

        <TextField
          type="date"
          label="Ngày"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setPage(1);
          }}
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
          style={{ minWidth: '150px' }}
        />
      </Box>

      <Button variant="contained" color="primary" onClick={() => navigate('/add-inout')}>
        Thêm phiếu
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Phiếu</TableCell>
              <TableCell>Tên người quản lý</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Mã kho</TableCell>
              <TableCell>Loại phiếu</TableCell>
              <TableCell>Ngày xuất</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEntries.map((entry) => (
              entry.products.map(product => (
                <TableRow key={`${entry.id}-${product.productId}`}>
                  <TableCell>{entry.id}</TableCell>
                  <TableCell>{entry.managementPerson}</TableCell>
                  <TableCell>{product.productName}</TableCell>
                  <TableCell>{entry.warehouseCode}</TableCell>
                  <TableCell>{entry.type}</TableCell>
                  <TableCell>{entry.date.split('T')[0]}</TableCell>
                  <TableCell>
                    <Button variant="outlined" onClick={() => handleViewDetails(entry.id)}>Xem</Button>
                    <Button variant="outlined" color="secondary" onClick={() => handleDeleteEntry(entry.id)}>Xóa</Button>
                    <Button variant="outlined" color="primary" onClick={() => handleEditEntry(entry.id)}>Sửa</Button>
                  </TableCell>
                </TableRow>
              ))
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

      {selectedEntry && (
        <Dialog open={true} onClose={handleCloseDialog}>
          <DialogTitle>
            Chi tiết phiếu
            <Button 
              variant="contained" 
              color="primary" 
              onClick={exportToExcel}
              style={{ float: 'right' }}
            >
              Xuất Excel
            </Button>
          </DialogTitle>
          <DialogContent>
            <Typography variant="h6">Số phiếu: {selectedEntry.id}</Typography>
            <Typography>Tên người quản lý: {selectedEntry.managementPerson}</Typography>
            <Typography>Tên người xuất: {selectedEntry.responsiblePerson}</Typography>
            <Typography>Ngày: {selectedEntry.date.split('T')[0]}</Typography>
            <Typography>Mã kho: {selectedEntry.warehouseCode}</Typography>
            <Typography>Địa điểm: {selectedEntry.location}</Typography>

            <Typography variant="h6" marginTop={2}>Danh sách sản phẩm</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>STT</TableCell>
                    <TableCell>Mã sản phẩm</TableCell>
                    <TableCell>Tên sản phẩm</TableCell>
                    <TableCell>Màu sắc</TableCell>
                    <TableCell>Số lượng</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedEntry.products.map((product, index) => {
                    const productDetails = products.find(p => p.id === product.productId) || {};
                    return (
                      <TableRow key={product.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{productDetails.id || product.productId}</TableCell>
                        <TableCell>{productDetails.name || product.productName}</TableCell>
                        <TableCell>{productDetails.color || product.color}</TableCell>
                        <TableCell>{product.quantity}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" marginTop={2}>Ghi chú:</Typography>
            <Typography>{selectedEntry.notes}</Typography>

            <Box marginTop={2}>
              <Typography>Nhân viên xuất hàng: {selectedEntry.responsiblePerson}</Typography>
              <Typography>Nhân viên quản lý kho: {selectedEntry.managementPerson}</Typography>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default KhoManagement;
