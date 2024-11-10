import { Box, Button, Grid, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useState } from 'react'
import * as XLSX from 'xlsx'

function DetailPublihserPayout() {

    const payoutData = [
        {
            title: 'Bầu trời và Vũ Trụ',
            fromDate: '01-02-2010',
            toDate: new Date().toISOString().slice(0, 10),
            revenue: '12.000.000 VND',
            contractId: 'contract id',
        },
        {
            title: 'Tịnh thổ cô độc',
            fromDate: '01-02-2010',
            toDate: new Date().toISOString().slice(0, 10),
            revenue: '15.000.000 VND',
            contractId: 'contract id',
        },
        {
            title: 'Đoạn tuyệt thế gian',
            fromDate: '01-02-2010',
            toDate: new Date().toISOString().slice(0, 10),
            revenue: '8.000.000 VND',
            contractId: 'contract id',
        },

    ];

    const handleExportExcel = () => {
        // Chuyển đổi dữ liệu thành định dạng của sheet Excel
        const worksheet = XLSX.utils.json_to_sheet(payoutData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');

        // Xuất workbook ra file Excel
        XLSX.writeFile(workbook, "PayoutData.xlsx");
    }

    return (
        <div className='publisher-payout-container'>
            <Box padding={3}>
                {/* Quyết toán tiền bản quyền */}
                <Typography variant='h5'>Quyết toán bản quyền</Typography>
                <Box>
                    <Box sx={{ flexGrow: 1, padding: 2 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4} md={4}>
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

                            <Grid item xs={12} sm={5} md={5}>
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
                                        <Typography variant="body1">01/10/2024 tới 01/11/2024</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tổng chi:
                                        </Typography>
                                        <Typography variant="body1">30.000.000 VND</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Link href={`/image`} underline="hover">Hình ảnh</Link>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={3} md={3}>
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
                                            Ghi chú:
                                        </Typography>
                                        <Typography variant="body1">...</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Trạng thái:
                                        </Typography>
                                        <Typography variant="body1">Hoàn thành</Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                {/* Books Table */}
                <Box>
                    <Typography variant="h6" gutterBottom>Books</Typography>
                    <Button variant="contained" color="primary" onClick={handleExportExcel}>
                        Xuất Excel
                    </Button>
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
            </Box >
        </div>
    )
}

export default DetailPublihserPayout