import React, { useEffect, useState } from 'react';
import {
    Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Grid,
    CircularProgress
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';

import api from '../Auth/AxiosInterceptors';

function PublisherPayout() {

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const publisher = location.state; // Dữ liệu từ PublisherPayout 
    const [books, setBooks] = useState(location.state?.bookDetails.$values || []);

    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [previewImage, setPreviewImage] = useState(null); // URL preview ảnh
    const [selectedImage, setSelectedImage] = useState(null); // File ảnh

    console.log('Location State:', location.state);
    if (!publisher) {
        console.error('No initialData provided');
    } else {
        console.log('Initial Data:', publisher);
        console.log('Books:', publisher?.bookDetails.$values);
    }

    const handleNoteChange = (event) => {
        const note = event.target.value;
        setDescription(note);
    }

    // Nếu không nhận đc state thì back về trang trước
    useEffect(() => {
        if (!publisher) {
            alert('Dữ liệu không hợp lệ. Điều hướng về trang trước.');
            navigate(-1); // Quay lại trang trước
        }
    }, [publisher, navigate]);

    // Format Date để Render UI
    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : 'N/A';
    };

    // Format Date để post lên Swagger
    const formatDateISO = (date) => {
        return date ? dayjs(date).format('YYYY-MM-DD') : null; // Định dạng yyyy-mm-dd
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

    const postPayoutForm = async () => {

        setLoading(true);

        if (!selectedImage) {
            alert('Vui lòng chọn ảnh trước khi gửi!');
            return;
        }

        const formData = new FormData();
        formData.append('ImageURL', selectedImage); // Gắn tệp ảnh vào FormData

        const params = {
            description: description || "Không có ghi chú",
            toDate: formatDateISO(publisher?.toDate),
        }

        try {
            const response = await api.post(
                `/api/PublisherPayout/createpayout/${publisher?.publisherId}`, formData, { params });
            // console.log('Quyết Toán:', response.data.data);
            setLoading(false);
            alert('Tạo quyết toán thành công!');
            navigate('/publisher-payout');
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            alert('Không thể tạo quyết toán. Vui lòng thử lại.');
        }
    }

    const handleComplete = async () => {
        await postPayoutForm();
    };

    return (
        <Box sx={{ width: "80vw" }}>
            <Box padding={3}>
                {/* Quyết toán tiền bản quyền */}
                <Typography variant='h5'>Quyết toán bản quyền</Typography>
                <Box>
                    <Box sx={{ flexGrow: 1, padding: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={6}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 2,
                                        borderRadius: 2,
                                        border: '1px solid #ddd',
                                        width: '100%',
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Nhà xuất bản:
                                        </Typography>
                                        <Typography variant="body1">{publisher.publisherName || 'N/A'}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tài khoản ngân hàng:
                                        </Typography>
                                        <Typography variant="body1">{publisher.bankAccount}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body1" fontWeight="bold">
                                            Thông tin liên hệ:
                                        </Typography>
                                        <Typography variant="body1">{publisher.contactInfo}</Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6} md={6}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        padding: 2,
                                        borderRadius: 2,
                                        border: '1px solid #ddd',
                                        width: '100%',
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Đợt quyết toán:
                                        </Typography>
                                        <Typography variant="body1">
                                            {formatDate(publisher?.fromDate)} - {formatDate(publisher?.toDate)}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tổng chi:
                                        </Typography>
                                        <Typography variant="body1">{publisher.totalEarnings || 0} VND</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Link href={`/publisher-payout-history/${id}`} underline="hover">Xem lịch sử quyết toán</Link>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                {/* Tạo quyết toán mới */}
                <Box borderBottom={1} mb={3} pb={2}>
                    <Typography variant="h6" gutterBottom>Tạo quyết toán mới</Typography>
                    <Box display="flex" gap={2}>
                        <TextField label="Từ ngày" value={formatDate(publisher?.fromDate)} disabled />
                        <TextField label="Đến ngày" value={formatDate(publisher?.toDate)} disabled />

                        <Box display="flex"
                            alignItems="center"
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
                    </Box>
                    <Box mt={2}>
                        <TextField
                            label="Ghi chú"
                            multiline
                            rows={4}
                            fullWidth
                            value={description}
                            onChange={handleNoteChange}
                        />
                    </Box>
                </Box>

                {/* Books Table */}
                <Box>
                    <Typography variant="h6" gutterBottom>Books</Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tiêu đề</TableCell>
                                    <TableCell>Từ ngày</TableCell>
                                    <TableCell>Tới ngày</TableCell>
                                    <TableCell>Doanh thu</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {books.map((item) => (
                                    <TableRow key={item.bookId}>
                                        <TableCell>{item.bookTitle}</TableCell>
                                        <TableCell>{formatDate(publisher?.fromDate)}</TableCell>
                                        <TableCell>{formatDate(publisher?.toDate)}</TableCell>
                                        <TableCell>{item.bookEarnings} VND</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Tổng tiền và hoàn tất */}
                <Box display="flex" justifyContent="space-between" mt={3}>
                    <Typography variant="h6">Tổng tiền: {publisher.totalEarnings} VND</Typography>
                    <Button variant="contained" color="primary" onClick={handleComplete} disabled={loading}>
                        {loading ? <CircularProgress size={20} color='inherit'/> : "Hoàn tất"}
                    </Button>
                </Box>
            </Box >
        </Box>
    );
}

export default PublisherPayout;
