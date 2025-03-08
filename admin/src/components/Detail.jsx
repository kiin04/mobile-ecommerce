import { useState } from "react";
import { notification } from "antd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Grid, Typography, TextField, Button } from "@mui/material";
import { API_URL } from "../config";

// Fetch dữ liệu từ API
const fetchDetail = async (productId) => {
    const response = await axios.get(
        `${API_URL}/api/Details/ProductDetail/${productId}`
    );
    return response.data;
};

// API cập nhật chi tiết sản phẩm
const updateDetail = async (updatedDetail) => {
    const response = await axios.put(
        `${API_URL}/api/Details/${updatedDetail.id}`,
        updatedDetail
    );
    return response.data;
};
const addDetail = async (newDetail) => {
    const response = await axios.post(`${API_URL}/api/Details`, newDetail);
    return response.data;
};
// Nhãn hiển thị cho các thuộc tính
const detailLable = {
    screenSize: "Kích thước màn hình",
    screenTechnology: "Công nghệ màn hình",
    rearCamera: "Camera sau",
    frontCamera: "Camera trước",
    chipset: "Chipset",
    gpu: "GPU",
    nfc: "Hỗ trợ NFC",
    ram: "Dung lượng RAM",
    internalStorage: "Bộ nhớ trong",
    battery: "Dung lượng pin",
    simcard: "Loại SIM",
    screenResolution: "Độ phân giải màn hình",
    chargingTechnology: "Công nghệ sạc",
};
const detailKeys = Object.keys(detailLable);
const Detail = ({ productId }) => {
    const queryClient = useQueryClient();
    const {
        data: details = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["details", productId],
        queryFn: () => fetchDetail(productId),
        enabled: !!productId,
    });

    // State để lưu dữ liệu chỉnh sửa
    const [editedDetail, setEditedDetail] = useState({});

    // Mutation để cập nhật dữ liệu
    const updateMutation = useMutation({
        mutationFn: updateDetail,
        onSuccess: () => {
            queryClient.invalidateQueries(["details", productId]);
            notification.success({
                message: 'Thành công',
                description: "Cập nhật cấu hình thành công",
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true
            });
        },
    });
    const addMutation = useMutation({
        mutationFn: addDetail,
        onSuccess: () => {
            queryClient.invalidateQueries(["details", productId]);
            notification.success({
                message: 'Thành công',
                description: "Thêm cấu hình thành công",
                duration: 4,
                placement: "bottomRight",
                showProgress: true,
                pauseOnHover: true
            });
        },
    });
    if (isLoading) return <Typography>Đang tải...</Typography>;
    if (error) return <Typography>Lỗi khi tải dữ liệu!</Typography>;

    return (
        <Grid container spacing={2} ml={1}>
            <Grid item xs={10}>
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                    Cấu hình sản phẩm
                </Typography>
            </Grid>

            {detailKeys.map((key) => (
                <Grid item xs={10} sm={6} key={key}>
                    <TextField
                        label={detailLable[key] || key}
                        value={editedDetail[key] ?? (details[0]?.[key] || "")}
                        fullWidth
                        margin="normal"
                        onChange={(e) =>
                            setEditedDetail({
                                ...editedDetail,
                                [key]: e.target.value,
                            })
                        }
                    />
                </Grid>
            ))}

            <Grid item xs={10} sm={6} mt={3}>
                {details.length > 0 ? (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                            updateMutation.mutate({
                                ...details[0],
                                ...editedDetail,
                            })
                        }
                        disabled={updateMutation.isLoading}
                        size="large"
                    >
                        {updateMutation.isLoading
                            ? "Đang cập nhật..."
                            : "Cập nhật cấu hình sản phẩm"}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() =>
                            addMutation.mutate({ productId, ...editedDetail })
                        }
                        disabled={addMutation.isLoading}
                        size="large"
                    >
                        {addMutation.isLoading
                            ? "Đang thêm..."
                            : "Thêm cấu hình sản phẩm"}
                    </Button>
                )}
            </Grid>
        </Grid>
    );
};

export default Detail;
