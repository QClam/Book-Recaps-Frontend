import { Box, Button, Grid, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import * as XLSX from 'xlsx'
import api from '../Auth/AxiosInterceptors';
import dayjs from 'dayjs';


function DetailContributorPayout() {

    const { id } = useParams();

    const [payoutData, setPayoutData] = useState([]);
    const [recapEarnings, setRecapEarnings] = useState([]);

    const getPayoutDetail = async () => {
        if (!id) {
            return;
        }

        try {
            const response = await api.get(`/api/contributorpayout/getpayoutinfobyid/${id}`);
            const payout = response.data.data;
            const recapEarnings = Array.isArray(payout.recapDetails?.$values) ? payout.recapDetails.$values : [];
            setPayoutData(payout);
            setRecapEarnings(recapEarnings)
            console.log("Payout Detail: ", payout);
            console.log("bookEarnings: ", recapEarnings);
        } catch (error) {
            console.error("Error Fetching Payout Detail", error);
        }
    }

    useEffect(() => {
        getPayoutDetail();
    }, [])

    const handleExportExcel = () => {
        const recapData = recapEarnings.map(item => ({
            recapName: item.recapName,
            fromDate: dayjs(payoutData.fromdate).format('DD/MM/YYYY'),
            toDate: dayjs(payoutData.todate).format('DD/MM/YYYY'),
            viewCount: item.viewCount || 0,
            recapEarnings: item.recapEarnings.toLocaleString()
        }));

        const worksheet = XLSX.utils.json_to_sheet(recapData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Recaps');

        // Xuất workbook ra file Excel
        XLSX.writeFile(workbook, "RecapData.xlsx");
    }


    return (
        <Box sx={{ width: "80vw" }}>
            <Box padding={3}>
                {/* Quyết toán tiền bản quyền */}
                <Typography variant='h5'>Quyết toán cho Người đóng góp</Typography>
                <Box>
                    <Box sx={{ flexGrow: 1, padding: 2 }}>
                        <Grid container spacing={3}>
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
                                            Người đóng góp:
                                        </Typography>
                                        <Typography variant="body1">{payoutData.contributorName}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tài khoản ngân hàng:
                                        </Typography>
                                        <Typography variant="body1">{payoutData.publisher?.bankAccount}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body1" fontWeight="bold">
                                            Thông tin liên hệ:
                                        </Typography>
                                        <Typography variant="body1">{payoutData.email}</Typography>
                                    </Box>
                                    {/* <Box display="flex" justifyContent="space-between">
                                        <Typography variant="body1" fontWeight="bold">
                                            Số điện thoại:
                                        </Typography>
                                        <Typography variant="body1">{payoutData.phoneNumber}</Typography>
                                    </Box> */}
                                </Paper>
                            </Grid>

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
                                            Đợt quyết toán:
                                        </Typography>
                                        <Typography variant="body1">{dayjs(payoutData.fromDate).format('DD/MM/YYYY')} - {dayjs(payoutData.toDate).format('DD/MM/YYYY')}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tổng chi:
                                        </Typography>
                                        <Typography variant="body1">{payoutData.totalEarnings} VND</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between">
                                        <Link href={payoutData.imageURL} underline="hover" target="_blank">Hình ảnh</Link>
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
                                        <Typography variant="body1">{payoutData.description}</Typography>
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
                    <Box display="flex" gap={2}>
                        <Typography variant="h6" gutterBottom>Recaps</Typography>
                        <Button variant="contained" color="primary" onClick={handleExportExcel}>
                            Xuất Excel
                        </Button>
                    </Box>
                    <TableContainer component={Paper} sx={{ margin: 1 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tiêu đề</TableCell>
                                    <TableCell>Từ ngày</TableCell>
                                    <TableCell>Tới ngày</TableCell>
                                    <TableCell>Lượt xem</TableCell>
                                    <TableCell>Doanh thu (VND)</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recapEarnings.length > 0 ? (
                                    recapEarnings.map((item) => (
                                        <TableRow key={item.recapId}>
                                            <TableCell>{item.recapName}</TableCell>
                                            <TableCell>{dayjs(payoutData.fromdate).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>{dayjs(payoutData.todate).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>{item.viewCount || 0} Lượt</TableCell>
                                            <TableCell>{item.recapEarnings.toLocaleString()} VND</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">Không có dữ liệu</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box >
        </Box>
    )
}

export default DetailContributorPayout