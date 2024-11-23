import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import api from '../Auth/AxiosInterceptors';

function WithdrawalInfo({ open, onClose, drawalId }) {

    const [withdrawalDetails, setWithdrawalDetails] = useState(null);

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
                                    Rút về:
                                </Typography>
                                <Typography>
                                    <strong>Nhận trực tiếp</strong>
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

                            <Box display="flex" justifyContent="space-between">
                                <Typography>
                                    Phí giao dịch:
                                </Typography>
                                <Typography>
                                    <strong>Miễn phí</strong>
                                </Typography>
                            </Box>

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
                        {/* Trạng thái */}
                        <Typography>
                            <strong>Trạng thái:</strong> <span style={{ color: "green" }}>Hoàn tất</span>
                        </Typography>
                        {/* Ghi chú */}
                        <Typography>
                            <strong>Ghi chú:</strong> {withdrawalDetails.description}
                        </Typography>
                        {/* Hình ảnh */}
                        <Typography>
                            <strong>Hình ảnh:</strong>
                        </Typography>
                        <Box
                            sx={{
                                width: '300px',
                                height: 'auto',
                                border: '1px solid #ddd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f5f5f5',
                                overflow: 'hidden',
                            }}
                        >
                            {withdrawalDetails.imageUrl ? (
                                <img src={withdrawalDetails.imageUrl} alt="Ảnh chuyển tiền" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Typography>Không có hình ảnh</Typography>
                            )}
                        </Box>
                    </Box>
                ) : (
                    <Typography>Đang tải dữ liệu...</Typography>
                )}

            </DialogContent>
            {/* Nút đóng */}
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">Đóng</Button>
            </DialogActions>
        </Dialog>
    )
}

export default WithdrawalInfo