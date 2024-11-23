import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import dayjs from 'dayjs';
import api from '../Auth/AxiosInterceptors';

function UpdateUserModal({ open, onClose, selectedUser, onUpdate }) {
    const [formData, setFormData] = useState({
        fullName: "",
        gender: 0,
        birthDate: "",
        address: ""
    });

    useEffect(() => {
        if (selectedUser) {
            setFormData({
                fullName: selectedUser.fullName,
                gender: selectedUser.gender, // 0 là nữ, 1 là nam
                birthDate: dayjs(selectedUser.birthDate).format('YYYY-MM-DD'),
                address: selectedUser.address
            });
        }
    }, [selectedUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await api.put(`api/users/updateuserprofile/${selectedUser.id}`, formData);
            if (response.status === 200) {
                onUpdate(); // Gọi lại hàm fetchUsers để cập nhật danh sách người dùng
                onClose(); // Đóng modal
            } else {
                console.error("Error updating user");
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Chỉnh sửa thông tin người dùng</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        label="Họ và tên"
                        fullWidth
                        margin="normal"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Giới tính</InputLabel>
                        <Select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                        >
                            <MenuItem value={0}>Nữ</MenuItem>
                            <MenuItem value={1}>Nam</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Ngày sinh"
                        fullWidth
                        margin="normal"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        label="Địa chỉ"
                        fullWidth
                        margin="normal"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                    />
                    <DialogActions>
                        <Button onClick={onClose} color="primary">
                            Hủy
                        </Button>
                        <Button type="submit" color="primary">
                            Cập nhật
                        </Button>
                    </DialogActions>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default UpdateUserModal;
