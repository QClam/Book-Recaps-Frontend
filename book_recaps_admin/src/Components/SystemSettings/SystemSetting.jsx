import { Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import api from '../Auth/AxiosInterceptors';
import { Hourglass } from 'react-loader-spinner';
import { Delete, Edit } from '@mui/icons-material';
import Swal from 'sweetalert2';

function SystemSetting() {

    const [systemSetting, setSystemSetting] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isHover, setIsHover] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false); // Modal visibility state
    const [formSystemSetting, setFormSystemSetting] = useState({
        name: '',
        settingType: 0,
        value: 0,
        description: ''
    });
    const [editSystemSetting, setEditSystemSetting] = useState(null); // state để lưu thông tin hệ thống cần chỉnh sửa

    const handleEditSystemSetting = (systemSetting) => {
        setEditSystemSetting(systemSetting); // Lưu thông tin hệ thống đang được chỉnh sửa vào state
        setFormSystemSetting(systemSetting); // Cập nhật form với dữ liệu cần chỉnh sửa
        setModalIsOpen(true); // Mở modal
    };

    const getSystemSetting = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/systemsettings/getallsettings');
            const systemSetting = response.data.data.$values;
            setSystemSetting(systemSetting);
            setLoading(false);
        } catch (error) {
            alert("Có lỗi xảy ra trong quá trình lấy dữ liệu")
            console.error("Error fetching SystemSetting", error);
            setLoading(false);
        }
    }

    const handleAddSystemSetting = async () => {
        setLoading(true);
        try {
            await api.post('/api/systemsettings/createsetting', formSystemSetting);
            getSystemSetting();
            setModalIsOpen(false);
            setFormSystemSetting({
                name: '',
                settingType: 0,
                value: 0,
                description: ''
            });
        } catch (error) {
            console.error("Error adding system setting", error);
            alert("Có lỗi xảy ra khi thêm hệ thống");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSystemSetting = async () => {
        setLoading(true);
        try {
            await api.put(`/api/systemsettings/updatesetting/${editSystemSetting.id}`, editSystemSetting);
            getSystemSetting();
            setModalIsOpen(false); // Đóng modal
            setEditSystemSetting(null); // Reset state sau khi cập nhật
        } catch (error) {
            console.error("Error updating system setting", error);
            alert("Có lỗi xảy ra khi cập nhật hệ thống");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSystemSetting = async (id) => {
        const result = await Swal.fire({
            title: 'Bạn chắc chắn muốn xóa?',
            text: "Dữ liệu này sẽ không thể phục hồi!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Có, xóa nó!'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/api/systemsettings/deletesetting/${id}`);
                getSystemSetting();
                Swal.fire(
                    'Đã xóa!',
                    'Hệ thống đã được xóa thành công.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting system setting", error);
                Swal.fire(
                    'Lỗi!',
                    'Có lỗi xảy ra khi xóa hệ thống.',
                    'error'
                );
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSystemSetting();
    }, []);

    const handleMouseEnter = () => {
        setIsHover(true);
    }

    const handleMouseLeave = () => {
        setIsHover(false);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editSystemSetting) {
            // Cập nhật dữ liệu trong khi chỉnh sửa
            setEditSystemSetting((prev) => ({
                ...prev,
                [name]: value
            }));
        } else {
            // Cập nhật dữ liệu khi thêm mới
            setFormSystemSetting((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" width="80vw">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    colors={["#306cce", "#72a1ed"]}
                />
            </Box>
        );
    }

    return (
        <Box width='80vw'>
            <Typography variant='h5'>Hệ thống</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 2 }}>
                <Chip label='Thêm hệ thống'
                    variant={isHover ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => {
                        setEditSystemSetting(null);  // Reset state khi thêm mới
                        setFormSystemSetting({
                            name: '',
                            settingType: 0,
                            value: 0,
                            description: ''
                        }); // Reset form
                        setModalIsOpen(true);  // Mở modal
                    }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave} />
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Hệ thống</TableCell>
                            <TableCell>Giá trị</TableCell>
                            <TableCell>Mô tả</TableCell>
                            <TableCell>Loại hệ thống</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {systemSetting.map((val) => (
                            <TableRow key={val.id}>
                                <TableCell>{val.name}</TableCell>
                                <TableCell>{val.settingType === 0 ? (
                                    <Typography variant='subtitle2' color='primary'>{val.value} %</Typography>
                                ) : val.settingType === 3 ? (
                                    <Typography variant='subtitle2' color='success'>{val.value} Lượt xem</Typography>
                                ) : (
                                    <Typography variant='subtitle2'>{val.value}</Typography>
                                )}</TableCell>
                                <TableCell>{val.description}</TableCell>
                                <TableCell>{val.settingType === 0 ? (
                                    <Typography variant='subtitle2'>
                                        Doanh thu chia sẽ cho Người đóng góp
                                    </Typography>
                                ) : val.settingType === 1 ? (
                                    <Typography variant='subtitle2'>
                                        Số dư Hệ thống
                                    </Typography>
                                ) : val.settingType === 2 ? (
                                    <Typography variant='subtitle2'>
                                        Số dư tối thiểu Người đóng góp khi thực hiện rút tiền
                                    </Typography>
                                ) : val.settingType === 3 ? (
                                    <Typography variant='subtitle2'>
                                        Số lượt xem Premium trên một Gói
                                    </Typography>
                                ) : val.settingType === 4 ? (
                                    <Typography variant='subtitle2'>
                                        Thời lượng tối thiểu để tạo thu nhập
                                    </Typography>
                                ) : (
                                    <Typography variant='subtitle2'>
                                        Lỗi
                                    </Typography>
                                )}</TableCell>
                                <TableCell>
                                    <Box display='flex'>
                                        <Button onClick={() => handleEditSystemSetting(val)}><Edit color='primary' /></Button>
                                        <Button onClick={() => handleDeleteSystemSetting(val.id)}><Delete color='error' /></Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal to Add or Edit System Setting */}
            <Dialog open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <DialogTitle>{editSystemSetting ? "Chỉnh sửa hệ thống" : "Thêm hệ thống"}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Tên hệ thống"
                        fullWidth
                        name="name"
                        value={editSystemSetting ? editSystemSetting.name : formSystemSetting.name}
                        onChange={handleChange}
                        margin='normal'
                    />
                    <TextField
                        label="Mô tả"
                        fullWidth
                        name="description"
                        value={editSystemSetting ? editSystemSetting.description : formSystemSetting.description}
                        onChange={handleChange}
                        margin='normal'
                    />
                    <FormControl fullWidth margin='normal'>
                        <InputLabel>Loại hệ thống</InputLabel>
                        <Select
                            label="Loại hệ thống"
                            name="settingType"
                            value={editSystemSetting ? editSystemSetting.settingType : formSystemSetting.settingType}
                            onChange={handleChange}
                        >
                            <MenuItem value={0}>Doanh thu chia sẽ</MenuItem>
                            <MenuItem value={1}>Số dư Hệ thống</MenuItem>
                            <MenuItem value={2}>Số dư tối thiểu Người đóng góp khi thực hiện rút tiền</MenuItem>
                            <MenuItem value={3}>Số lượt xem Premium trên một Gói</MenuItem>
                            <MenuItem value={4}>Thời gian tối thiểu tạo thu nhập</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="Giá trị"
                        fullWidth
                        name="value"
                        value={editSystemSetting ? editSystemSetting.value : formSystemSetting.value}
                        onChange={handleChange}
                        margin='normal'
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalIsOpen(false)} color='error'>Hủy</Button>
                    <Button onClick={editSystemSetting ? handleUpdateSystemSetting : handleAddSystemSetting} color="primary">
                        {editSystemSetting ? "Cập nhật" : "Thêm"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SystemSetting;
