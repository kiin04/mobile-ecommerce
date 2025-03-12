import { useState } from "react";
import {  message } from 'antd';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Box,
    Input,
} from "@mui/material";

import { API_URL } from "../config";
import { Label } from "@mui/icons-material";

// Fetch danh sách màu từ API
const fetchColorSize = async (productId) => {
    const response = await axios.get(
        `${API_URL}/api/ColorSizes/ProductColorSize/${productId}`
    );
    return response.data;
};

// Hàm thêm màu mới
const addColorSize = async (newColorSize) => {
    const response = await axios.post(
        `${API_URL}/api/ColorSizes`,
        newColorSize
    );
    return response.data;
};
// Cập nhật màu
const updateColorSize = async (updatedColorSize) => {
    const response = await axios.put(
        `${API_URL}/api/ColorSizes/${updatedColorSize.id}`,
        updatedColorSize
    );
    return response.data;
};

// Xóa màu
const deleteColorSize = async (id) => {
    await axios.delete(`${API_URL}/api/ColorSizes/${id}`);
};

const ColorSize = ({ productId }) => {
    const [selectedColor, setSelectedColor] = useState(null);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newColorSize, setNewColorSize] = useState({
        color: "",
        size: "",
        quantity: "",
        price: 0,
    });

    const queryClient = useQueryClient();

    // Fetch danh sách màu
    const {
        data: ColorSizes = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["colorsizes", productId],
        queryFn: () => fetchColorSize(productId),
        enabled: !!productId,
    });

    // Mutation để thêm màu mới
    const mutation = useMutation({
        mutationFn: addColorSize,
        onSuccess: () => {
            queryClient.invalidateQueries(["colorsizes", productId]); 
            fetchColorSize();
            setOpenAddDialog(false); // Đóng dialog sau khi thêm
            setNewColorSize({ color: "", size: "", quantity: "", price: 0 }); // Reset form
        },
    });
    // Mutation để cập nhật màu
    const updateMutation = useMutation({
        mutationFn: updateColorSize,
        onSuccess: () => {
            queryClient.invalidateQueries(["colorsizes", productId]); // Refresh danh sách
            setSelectedColor(null); // Đóng dialog sau khi cập nhật
        },
    });

    // Mutation để xóa màu
    const deleteMutation = useMutation({
        mutationFn: deleteColorSize,
        onSuccess: () => {
            queryClient.invalidateQueries(["colorsizes", productId]); // Refresh danh sách
            setSelectedColor(null); // Đóng dialog sau khi xóa
        },
    });
    const handleUpdateColor = () => {
        if (
            !selectedColor.color ||
            !selectedColor.size ||
            !selectedColor.quantity 
        ) {
            message.warning("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        updateMutation.mutate(selectedColor);
    };
    const handleDeleteColor = () => {
        if (window.confirm("Bạn có chắc muốn xóa phiên bản này?")) {
            deleteMutation.mutate(selectedColor.id);
        }
    };

    const handleViewColor = (color) => {
        setSelectedColor(color);
    };

    const handleCloseDialog = () => {
        setSelectedColor(null);
    };

    const handleAddColor = () => {
        setOpenAddDialog(true);
    };

    const handleSaveNewColor = () => {
        if (
            !newColorSize.color ||
            !newColorSize.size ||
            !newColorSize.quantity
        ) {
            message.warning("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        console.log("Dữ liệu gửi lên:", { ...newColorSize, productId });
        mutation.mutate({ ...newColorSize, productId });
    };

    return (
        <Grid item xs={12} sm={8} >
            <Typography variant="h6" sx={{ mt: 2, mb: 2, ml:2 }}>
                Màu và phiên bản
                <Button
                    variant="contained"
                    color="primary"
                    size="medium"
                    sx={{ ml: 1 }}
                    onClick={handleAddColor}
                >
                    +
                </Button>
            </Typography>

            {isLoading ? (
                <Typography variant="body2">Đang tải...</Typography>
            ) : error ? (
                <Typography variant="body2" color="error">
                    Lỗi tải dữ liệu
                </Typography>
            ) : ColorSizes.length > 0 ? (
                ColorSizes.map((item) => (
                    <Grid item xs={10} sm={10} mx={3} key={item.id} >
                        <Card
                            variant="outlined"
                            sx={{
                                backgroundColor: "#f9f9f9",
                                maxHeight: "120px",
                                margin: "10px 0",
                                padding: "4px",
                            }}
                            onClick={() => handleViewColor(item)}
                        >
                            <CardContent>
                                <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                >
                                    Màu: {item.color} - {item.size}
                                </Typography>
                              
                                <Typography variant="body2">
                                    Số lượng: {item.quantity}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))
            ) : (
                <Typography variant="body2" color="textSecondary">
                    Không có dữ liệu màu và phiên bản.
                </Typography>
            )}

            {/* Dialog hiển thị chi tiết */}
            <Dialog
                open={Boolean(selectedColor)}
                onClose={handleCloseDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Chi tiết màu</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Màu"
                        value={selectedColor?.color || ""}
                        onChange={(e) =>
                            setSelectedColor({
                                ...selectedColor,
                                color: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Phiên bản"
                        value={selectedColor?.size || ""}
                        onChange={(e) =>
                            setSelectedColor({
                                ...selectedColor,
                                size: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Số lượng"
                        type="number"
                        value={selectedColor?.quantity || ""}
                        onChange={(e) =>
                            setSelectedColor({
                                ...selectedColor,
                                quantity: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                  
                    <label style={{ marginLeft: "4px" }}>Mã màu </label>
                    <TextField
                        label="Mã màu"
                        type="code"
                        value={selectedColor?.code || ""}
                        onChange={(e) =>
                            setSelectedColor({
                                ...selectedColor,
                                code: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <Input
                        label="Mã màu"
                        type="color"
                        value={selectedColor?.code || ""}
                        onChange={(e) =>
                            setSelectedColor({
                                ...selectedColor,
                                code: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap={2}
                        mt={2}
                    >
                        <Button
                            variant="contained"
                            onClick={handleUpdateColor}
                            disabled={updateMutation.isLoading}
                        >
                            {updateMutation.isLoading
                                ? "Đang cập nhật..."
                                : "Cập nhật"}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteColor}
                            disabled={deleteMutation.isLoading}
                        >
                            {deleteMutation.isLoading ? "Đang xóa..." : "Xóa"}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCloseDialog}
                        >
                            Hủy
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Dialog thêm màu mới */}
            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Thêm màu mới</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Màu"
                        value={newColorSize.color}
                        onChange={(e) =>
                            setNewColorSize({
                                ...newColorSize,
                                color: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <label style={{ marginLeft: "4px" }}>Mã màu </label>
                    <TextField
                        label="Mã màu"
                        type="test"
                        value={newColorSize?.code || ""}
                        onChange={(e) =>
                            setNewColorSize({
                                ...newColorSize,
                                code: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <Input
                        label="Mã màu"
                        type="color"
                        value={newColorSize?.code || ""}
                        onChange={(e) =>
                            setNewColorSize({
                                ...newColorSize,
                                code: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Phiên bản"
                        value={newColorSize.size}
                        onChange={(e) =>
                            setNewColorSize({
                                ...newColorSize,
                                size: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                    
                    <TextField
                        label="Số lượng"
                        type="number"
                        value={newColorSize.quantity}
                        onChange={(e) =>
                            setNewColorSize({
                                ...newColorSize,
                                quantity: e.target.value,
                            })
                        }
                        fullWidth
                        margin="normal"
                    />
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        gap={2}
                        mt={2}
                    >
                        <Button
                            variant="contained"
                            onClick={handleSaveNewColor}
                            disabled={mutation.isLoading}
                        >
                            {mutation.isLoading ? "Đang lưu..." : "Lưu"}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setOpenAddDialog(false)}
                        >
                            Hủy
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Grid>
    );
};

export default ColorSize;
