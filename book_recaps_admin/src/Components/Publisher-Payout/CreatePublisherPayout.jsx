import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Link, Grid
} from '@mui/material';

function PublisherPayout() { 

    const [newPayout, setNewPayout] = useState({
        fromDate: '01/02/2010',
        toDate: new Date().toISOString().slice(0, 10), // current date
        notes: '',
        image: null,
    });

    const payoutData = [
        {
            title: '...',
            fromDate: '01-02-2010',
            toDate: new Date().toISOString().slice(0, 10),
            revenue: '12.000.000 VND',
            contractId: 'contract id',
        },
        // Add more rows as needed
    ];

    const handleComplete = () => {
        alert('Hoàn tất');
    }; 

    return (
        <div className='publisher-payout-container'>
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
                                        <Typography variant="body1">Nhà xuất bản 1 thành viên</Typography>
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
                                        <Typography variant="body1">01/10/2024 tới 01/11/2024</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tổng chi gần nhất:
                                        </Typography>
                                        <Typography variant="body1">30.000.000 VND</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Link href={`/payout-history`} underline="hover">Xem lịch sử quyết toán</Link>
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
                        <TextField label="From" value={newPayout.fromDate}  fullWidth />
                        <TextField label="To" value={newPayout.toDate}  fullWidth />
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
                                    <TableCell>Doanh thu</TableCell>
                                    <TableCell>Hợp đồng</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payoutData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.title}</TableCell>
                                        <TableCell>{item.fromDate}</TableCell>
                                        <TableCell>{item.toDate}</TableCell>
                                        <TableCell>{item.revenue}</TableCell>
                                        <TableCell>{item.contractId}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Tổng tiền và hoàn tất */}
                <Box display="flex" justifyContent="space-between" mt={3}>
                    <Typography variant="h6">Tổng tiền: 30.000.000 VND</Typography>
                    <Button variant="contained" color="primary" onClick={handleComplete}>Hoàn tất</Button>
                </Box>
            </Box >
        </div>
    );
}

export default PublisherPayout;
