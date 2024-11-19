import { Box, Button, Grid, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../Auth/AxiosInterceptors';

function CreateContributorPayout() {

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const contributor = location.state; // Dữ liệu từ ContributorPayout 
    const [recaps, setRecps] = useState(location.state?.recapDetails.$values || []);
    console.log('Location State:', location.state);
    if (!contributor) {
        console.error('No initialData provided');
    } else {
        console.log('Initial Data:', contributor);
        console.log('Recaps:', contributor?.recapDetails);
    }

    const [newPayout, setNewPayout] = useState({
        fromDate: '01-02-2010',
        toDate: new Date().toISOString().slice(0, 10), // current date
        notes: '',
        image: null,
    });

    // Nếu cần fallback data khi không nhận được state
    useEffect(() => {
        if (!contributor) {
            // Nếu không có `state`, điều hướng về trang trước hoặc xử lý fallback
            alert('Dữ liệu không hợp lệ. Điều hướng về trang trước.');
            navigate(-1); // Quay lại trang trước
        }
    }, [contributor, navigate]);

    const handleComplete = () => {
        alert('Hoàn tất');
    };

    return (
        <Box sx={{ width: "80vw" }}>
            <Box padding={3}>
                {/* Quyết toán tiền bản quyền */}
                <Typography variant='h5'>Quyết toán cho Contributor</Typography>
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
                                            Tên Contributor:
                                        </Typography>
                                        <Typography variant="body1">{contributor.contributorName}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tài khoản ngân hàng:
                                        </Typography>
                                        <Typography variant="body1">...</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body1" fontWeight="bold">
                                            Thông tin liên hệ:
                                        </Typography>
                                        <Typography variant="body1">...</Typography>
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
                                            Đợt quyết toán gần nhất:
                                        </Typography>
                                        <Typography variant="body1">
                                            {new Date(contributor.fromdate).toLocaleDateString()} - {new Date(contributor.todate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tổng chi gần nhất:
                                        </Typography>
                                        <Typography variant="body1">{contributor.totalEarnings} VND</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Link href={`/contributor-payout-history/${id}`} underline="hover">Xem lịch sử quyết toán</Link>
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
                        <TextField label="From" value={new Date(contributor.fromdate).toLocaleDateString()} fullWidth />
                        <TextField label="To" value={new Date(contributor.todate).toLocaleDateString()} fullWidth />
                        <Button variant="outlined" component="label" fullWidth>
                            Upload
                            <input type="file" hidden onChange={(e) => setNewPayout({ ...newPayout, image: e.target.files[0] })} />
                        </Button>
                    </Box>
                    <Box mt={2}>
                        <TextField
                            label="Ghi chú"
                            multiline
                            rows={4}
                            fullWidth
                            value={newPayout.notes}
                            onChange={(e) => setNewPayout({ ...newPayout, notes: e.target.value })}
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
                                    <TableCell>Lượt xem</TableCell>
                                    <TableCell>Doanh thu</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recaps.map((item) => (
                                    <TableRow key={item.recapId}>
                                        <TableCell>{item.recapName}</TableCell>
                                        <TableCell>{new Date(contributor.fromdate).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(contributor.todate).toLocaleDateString()}</TableCell>
                                        <TableCell>{item.viewCount}</TableCell>
                                        <TableCell>{item.recapEarnings}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Tổng tiền và hoàn tất */}
                <Box display="flex" justifyContent="space-between" mt={3}>
                    <Typography variant="h6">Tổng tiền: {contributor.totalEarnings} VND</Typography>
                    <Button variant="contained" color="primary" onClick={handleComplete}>Hoàn tất</Button>
                </Box>
            </Box >
        </Box>
    );
}

export default CreateContributorPayout