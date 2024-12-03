import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import React from 'react'
import avatar from "../../data/avatar.png"

function UserDetail({ open, onClose, selectedUser }) {

    if (!selectedUser) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onclose} maxWidth="sm" fullWidth>
            <DialogTitle>Thông tin chi tiết</DialogTitle>

            <DialogContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <img src={selectedUser.imageUrl || avatar}
                        alt='Avatar'
                        style={{ width: 240, height: 200 }}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null;
                            currentTarget.src = avatar
                        }} />
                    <Box padding={1}>
                        <Typography variant="body1"><strong>Họ và tên:</strong> {selectedUser.fullName}</Typography>
                        <Typography variant="body1"><strong>Email:</strong> {selectedUser.email}</Typography>
                        <Typography variant="body1"><strong>Ngày sinh:</strong> {new Date(selectedUser.birthDate).toLocaleDateString()}</Typography>
                        <Typography variant="body1"><strong>Số điện thoại:</strong> {selectedUser.phoneNumber}</Typography>
                        <Typography variant="body1"><strong>Địa chỉ:</strong> {selectedUser.address || "Chưa cập nhật"}</Typography>
                        <Typography variant="body1"><strong>Giới tính:</strong> {selectedUser.gender === 0 ? 'Nam' : 'Nữ'}</Typography>
                        <Typography variant="body1"><strong>Số dư trong ví:</strong> <strong>{(selectedUser.earning ?? 0).toLocaleString("vi-VN")} VND</strong></Typography>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} color='error'>Đóng</Button>
            </DialogActions>
        </Dialog>
    )
}

export default UserDetail