import React, { useEffect, useState } from 'react';
import api from '../Auth/AxiosInterceptors';
import { Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import Swal from 'sweetalert2';

function PremiumPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isHover, setIsHover] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false); // Modal visibility state
    const [formPackage, setFormPackage] = useState({
        name: '',
        price: 0,
        duration: 0,
        description: '',
        expectedViewsCount: 0
    });
    const [editPackage, setEditPackage] = useState(null); // state để lưu thông tin hệ thống cần chỉnh sửa

    const getPackages = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/subscriptionpackages/getallpackages');
            const packages = response.data.data.$values;
            setPackages(packages);
        } catch (error) {
            alert("Lỗi khi lấy dữ liệu");
            console.error("Error fetching Packages", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrEditPackage = async () => {
        setLoading(true);
        try {
            if (editPackage) {
                // Chỉnh sửa gói package
                await api.put(`/api/subscriptionpackages/updatepackage/${editPackage.id}`, editPackage);
            } else {
                // Thêm gói package mới
                await api.post('/api/subscriptionpackages/createpackage', formPackage);
            }
            getPackages(); // Cập nhật danh sách gói
            setModalIsOpen(false);
            setFormPackage({
                name: '',
                price: 0,
                duration: 0,
                description: '',
                expectedViewsCount: 0
            });
            setEditPackage(null); // Reset state edit package
        } catch (error) {
            console.error("Error saving package", error);
            alert("Có lỗi xảy ra khi lưu gói Premium");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePackage = async (id) => {
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
                await api.delete(`/api/subscriptionpackages/deletepackage/${id}`);
                getPackages();
                Swal.fire(
                    'Đã xóa!',
                    'Gói Premium đã được xóa thành công.',
                    'success'
                );
            } catch (error) {
                console.error("Error deleting Package", error);
                Swal.fire(
                    'Lỗi!',
                    'Có lỗi xảy ra khi xóa Gói Premium.',
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
        getPackages();
    }, []);

    const handleMouseEnter = () => {
        setIsHover(true);
    };

    const handleMouseLeave = () => {
        setIsHover(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (editPackage) {
            // Cập nhật dữ liệu khi chỉnh sửa
            setEditPackage((prev) => ({
                ...prev,
                [name]: value
            }));
        } else {
            // Cập nhật dữ liệu khi thêm mới
            setFormPackage((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    };

    return (
        <Box width='80vw'>
            <Typography variant='h5'>Gói Premium của Hệ Thống</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 2 }}>
                <Chip label='Thêm Gói Premium'
                    variant={isHover ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => {
                        setEditPackage(null);  // Reset state khi thêm mới
                        setFormPackage({
                            name: '',
                            price: 0,
                            duration: 0,
                            description: '',
                            expectedViewsCount: 0
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
                            <TableCell>Gói</TableCell>
                            <TableCell>Giá</TableCell>
                            <TableCell>Thời hạn</TableCell>
                            <TableCell>Lượt xem của gói</TableCell>
                            <TableCell>Mô tả</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {packages.map((val) => (
                            <TableRow key={val.id}>
                                <TableCell>{val.name}</TableCell>
                                <TableCell>{(val.price ?? 0).toLocaleString('vi-VN')} VND</TableCell>
                                <TableCell>{val.duration} Ngày</TableCell>
                                <TableCell>{val.expectedViewsCount} Lượt</TableCell>
                                <TableCell>{val.description}</TableCell>
                                <TableCell>
                                    <Box display='flex'>
                                        <Button onClick={() => {
                                            setEditPackage(val);  // Set package for editing
                                            setFormPackage(val);  // Pre-fill form with existing data
                                            setModalIsOpen(true);  // Open modal
                                        }}>
                                            <Edit color='primary' />
                                        </Button>
                                        <Button onClick={() => handleDeletePackage(val.id)}>
                                            <Delete color='error' />
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal */}
            <Dialog open={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <DialogTitle>{editPackage ? 'Chỉnh Sửa Gói Premium' : 'Thêm Gói Premium'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Tên Gói"
                        name="name"
                        value={editPackage ? editPackage.name : formPackage.name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Giá"
                        name="price"
                        value={editPackage ? editPackage.price : formPackage.price}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="number"
                    />
                    <TextField
                        label="Thời Hạn (Ngày)"
                        name="duration"
                        value={editPackage ? editPackage.duration : formPackage.duration}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="number"
                    />
                    <TextField
                        label="Lượt Xem"
                        name="expectedViewsCount"
                        value={editPackage ? editPackage.expectedViewsCount : formPackage.expectedViewsCount}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="number"
                    />
                    <TextField
                        label="Mô Tả"
                        name="description"
                        value={editPackage ? editPackage.description : formPackage.description}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={4}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalIsOpen(false)} color="error">
                        Hủy
                    </Button>
                    <Button onClick={handleAddOrEditPackage} color="primary">
                        {editPackage ? 'Cập Nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PremiumPackages;
