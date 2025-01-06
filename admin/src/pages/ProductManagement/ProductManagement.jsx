import { useState, useEffect } from 'react';
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Dialog, DialogTitle, DialogContent, IconButton, Pagination } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../config.js';

const ProductManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/products`);
        if (response.status === 200) {
          const data = response.data;
          console.log('Fetched products:', data); // Log the products
          setProducts(data);
        } else {
          console.error(`Failed to fetch users: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDialog = () => {
    setSelectedProduct(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      // Kiểm tra sử dụng sản phẩm trước khi xóa
      const checkResponse = await fetch(`${BASE_URL}/api/products/${productId}/check-usage`);
      const checkData = await checkResponse.json();

      if (checkData.isInUse) {
        let message = 'Không thể xóa sản phẩm vì đang được sử dụng trong:';
        if (checkData.inOrders) message += '\n- Đơn hàng';
        if (checkData.inKho) message += '\n- Phiếu kho';
        
        alert(message);
        return;
      }

      // Nếu sản phẩm không được sử dụng, tiến hành xóa
      const response = await fetch(`${BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(product => product.id !== productId));
        alert('Sản phẩm đã được xóa thành công');
      } else {
        const data = await response.json();
        alert(data.message || 'Lỗi khi xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Đã xảy ra lỗi khi xóa sản phẩm');
    }
  };

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleEditProduct = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.id.includes(searchTerm)
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box padding={3}>
      <Typography variant="h4" gutterBottom>Quản lý sản phẩm</Typography>

      <TextField
        label="Tìm kiếm sản phẩm"
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
        <Button variant="contained" color="primary" onClick={handleAddProduct}>Thêm sản phẩm</Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã SP</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Màu</TableCell>
              <TableCell>Số lượng</TableCell>
              <TableCell>Giá (VNĐ)</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.color}</TableCell>
                <TableCell>{product.quantity}</TableCell>
                <TableCell>{formatPrice(product.price)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleViewDetails(product)} color="primary">
                    <Visibility />
                  </IconButton>
                  <IconButton onClick={() => handleEditProduct(product.id)} color="secondary">
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteProduct(product.id)} color="error">
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

      {selectedProduct && (
        <Dialog 
          open={true} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle 
            sx={{
              borderBottom: '1px solid #e0e0e0',
              padding: '16px 24px'
            }}
          >
            Chi tiết sản phẩm
          </DialogTitle>
          <DialogContent sx={{ padding: '24px' }}>
            <Box display="flex" gap={3}>
              <Box flex={1}>
                <img
                  src={`${BASE_URL}/${selectedProduct.image.replace(/\\/g, '/')}`}
                  alt={selectedProduct.name}
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
              
              <Box flex={1}>
                <Typography variant="h6" gutterBottom color="primary">
                  {selectedProduct.name}
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gap: 2,
                  '& .MuiTypography-root': { 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }
                }}>
                  <Typography>
                    <strong>Mã sản phẩm:</strong> {selectedProduct.id}
                  </Typography>
                  <Typography>
                    <strong>Màu sắc:</strong> {selectedProduct.color}
                  </Typography>
                  <Typography>
                    <strong>Số lượng:</strong> {selectedProduct.quantity}
                  </Typography>
                  <Typography>
                    <strong>Đơn giá:</strong> {formatPrice(selectedProduct.price)}
                  </Typography>
                  <Typography>
                    <strong>Mô tả:</strong>
                  </Typography>
                  <Typography sx={{ 
                    backgroundColor: '#f5f5f5',
                    padding: 2,
                    borderRadius: 1,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedProduct.description}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
};

export default ProductManagement;
