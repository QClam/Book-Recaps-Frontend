import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Select, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import api from '../Auth/AxiosInterceptors';

function WithdrawalRequest({ open, onClose, drawalId, onUpdate }) {

    const [withdrawalDetails, setWithdrawalDetails] = useState(null);
    const [previewImage, setPreviewImage] = useState(null); // URL preview ảnh
    const [selectedImage, setSelectedImage] = useState(null); // File ảnh
    const [responseText, setResponseText] = useState("");
    const [withdrawalStatus, setWithdrawalStatus] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (drawalId) {
            getWithdrawalInfo(drawalId)
        }
    }, [drawalId]);

    const getWithdrawalInfo = async (id) => {
        try {
            const response = await api.get(`/api/contributorwithdrawal/getdrawalbyid/${id}`)
            const withdrawal = response.data.data;
            console.log("Rút tiền nè: ", withdrawal);
            setWithdrawalDetails(withdrawal);
        } catch (error) {
            console.error("Error fetching withdrawal details:", error);
        }
    }

    const handleResponseChange = (e) => {
        setResponseText(e.target.value);
    };

    // Xử lý khi chọn ảnh
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file); // Tạo URL xem trước ảnh
            setPreviewImage(preview); // Cập nhật preview
            setSelectedImage(file); // Lưu file ảnh vào state
        }
    };

    // Xử lý khi thay đổi trạng thái
    const handleStatusChange = (e) => {

        setWithdrawalStatus(e.target.value);
    };

    const responseWithdrawal = async () => {

        setLoading(true);

        if (!drawalId) {
            return;
        }

        if (withdrawalStatus === 1 && !selectedImage) {
            alert('Vui lòng chọn ảnh trước khi gửi!');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        if (selectedImage) {
            formData.append('ImageURL', selectedImage); // Chỉ gửi ảnh nếu có
        }
        formData.append('Description', responseText);
        formData.append('Status', withdrawalStatus);

        try {
            const response = await api.put(`/api/contributorwithdrawal/processwithdrawal?withdrawalId=${drawalId}`, formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            )
           
            alert("Giao dịch đã hoàn tất!");
            setLoading(false);
            onClose();
            if (onUpdate) onUpdate(); // Gọi lại để cập nhật danh sách
        } catch (error) {
            console.error("Error updating withdrawal request:", error);
            alert("Đã xảy ra lỗi khi thực hiện giao dịch! Hãy kiểm tra đã có ảnh và thay đổi trạng thái hay chưa");
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm">
            {/* Tiêu đề */}
            <DialogTitle>
                Thông tin
                <Button onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16, color: 'gray' }}>✕</Button>
            </DialogTitle>
            {/* Nội dung */}
            <DialogContent>
                {withdrawalDetails ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Paper elevation={3}
                            sx={{
                                padding: 2,
                                borderRadius: 2,
                                border: '1px solid #ddd',
                                width: 350,
                            }}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    Người tạo:
                                </Typography>
                                <Typography>
                                    <strong>{withdrawalDetails.contributor?.fullName}</strong>
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    Hình thức:
                                </Typography>
                                <Typography>
                                    <strong>Chuyển khoản</strong>
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    <strong>Số dư còn lại:</strong>
                                </Typography>
                                <Typography>
                                    <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(withdrawalDetails.contributor?.earning)}</strong>
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    <strong>Tài khoản Ngân Hàng:</strong>
                                </Typography>
                                <Typography>
                                    <strong>{withdrawalDetails.contributor?.bankAccount}</strong>
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    Số tiền:
                                </Typography>
                                <Typography>
                                    <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(withdrawalDetails.amount)}</strong>
                                </Typography>
                            </Box>

                            {/* <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    Phí giao dịch:
                                </Typography>
                                <Typography>
                                    <strong>Miễn phí</strong>
                                </Typography>
                            </Box> */}

                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    Tổng tiền:
                                </Typography>
                                <Typography>
                                    <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(withdrawalDetails.amount)}</strong>
                                </Typography>
                            </Box>
                        </Paper>
                        <hr />

                        <Typography>
                            <strong>Ghi chú:</strong>
                        </Typography>
                        <TextField
                            label="Ghi chú"
                            multiline
                            rows={4}
                            fullWidth
                            value={responseText}
                            onChange={handleResponseChange}
                        />

                        <Typography>
                            <strong>Hình ảnh:</strong>
                        </Typography>
                        <Box display="flex"
                            alignItems="center"
                            flexDirection="column"
                            gap={2}
                        >
                            {previewImage && (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    style={{
                                        width: '300px',
                                        height: 'auto',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '4px',
                                        marginRight: '16px',
                                    }}
                                />
                            )}

                            <Button
                                variant="outlined"
                                component="label"
                                sx={{
                                    mt: 2,
                                    display: 'block',
                                    margin: '0 auto',
                                    zIndex: 1,
                                }}
                            >
                                {previewImage ? "Chọn lại ảnh" : "Tải ảnh lên"}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </Box>
                        <Box display="flex" alignItems="center">
                            <Typography sx={{ width: 100 }}><strong>Trạng thái</strong></Typography>
                            <Select
                                value={withdrawalStatus}
                                onChange={handleStatusChange}
                                displayEmpty
                                renderValue={(selected) => selected ? `${selected === 1 ? "Hoàn tất" : "Hủy"}` : "Đang mở"}
                            >
                                <MenuItem value={1}>Hoàn tất</MenuItem>
                                <MenuItem value={2}>Hủy</MenuItem>
                            </Select>
                        </Box>
                    </Box>
                ) : (
                    <Typography>Đang tải dữ liệu...</Typography>
                )}

            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="contained" color="error" disabled={loading}>Đóng</Button>
                <Button
                    onClick={responseWithdrawal}
                    variant="contained"
                    color="primary"
                    disabled={loading}                   
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : "Hoàn tất" }
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default WithdrawalRequest