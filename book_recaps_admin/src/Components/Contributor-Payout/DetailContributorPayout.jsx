import { Box, Button, Grid, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx'
import api from '../Auth/AxiosInterceptors';
import dayjs from 'dayjs';
import { Visibility } from '@mui/icons-material';


function DetailContributorPayout() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [payoutData, setPayoutData] = useState([]);
    const [recapEarnings, setRecapEarnings] = useState([]);

    const getPayoutDetail = async () => {
        if (!id) {
            return;
        }

        try {
            const response = await api.get(`/api/contributorpayout/getpayoutinfobyid/${id}`);
            const payout = response.data.data;
            const recapEarnings = Array.isArray(payout.recapEarnings?.$values) ? payout.recapEarnings.$values : [];
            setPayoutData(payout);
            setRecapEarnings(recapEarnings)
            console.log("Payout Detail: ", payout);
            console.log("recapEarnings: ", recapEarnings);
        } catch (error) {
            console.error("Error Fetching Payout Detail", error);
        }
    }

    useEffect(() => {
        getPayoutDetail();
    }, [])

    const handleExportExcel = () => {
        const recapData = recapEarnings.map(item => ({
            recapName: item.recap?.name,
            fromDate: dayjs(payoutData.fromDate).format('DD/MM/YYYY'),
            toDate: dayjs(payoutData.toDate).format('DD/MM/YYYY'),
            recapEarnings: item.earningAmount
        }));

        const worksheet = XLSX.utils.json_to_sheet(recapData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Recaps');

        // Xuất workbook ra file Excel
        XLSX.writeFile(workbook, "RecapData.xlsx");
    }

    const detailRecap = async (id) => {
        navigate(`/recap/${id}`, {
            state: {
                fromDate: payoutData.fromDate,
                toDate: payoutData.toDate
            }
        })
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
                                        height: 160
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Người đóng góp:
                                        </Typography>
                                        <Typography variant="body1">{payoutData.contributor?.fullName}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Thông tin liên hệ:
                                        </Typography>
                                        <Typography variant="body1">{payoutData.contributor?.email}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tài khoản ngân hàng:
                                        </Typography>
                                        <Typography variant="body1">{payoutData.contributor?.bankAccount}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Số dư ví:
                                        </Typography>
                                        <Typography variant="body1">{(payoutData.contributor?.earning ?? 0).toLocaleString()} VND</Typography>
                                    </Box>
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
                                        height: 160,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Đợt quyết toán:
                                        </Typography>
                                        <Typography variant="body1">{dayjs(payoutData.fromDate).format('DD/MM/YYYY')} - {dayjs(payoutData.toDate).format('DD/MM/YYYY')}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1} mt='auto'>
                                        <Typography variant="body1" fontWeight="bold">
                                            Tổng chi:
                                        </Typography>
                                        <Typography variant="body1">{(payoutData.amount ?? 0).toLocaleString()} VND</Typography>
                                    </Box>
                                    {/* <Box display="flex" justifyContent="space-between">
                                        <Link href={payoutData.imageURL} underline="hover" target="_blank">Hình ảnh</Link>
                                    </Box> */}
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
                                        height: 160,
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" mb={1}>
                                        <Typography variant="body1" fontWeight="bold">
                                            Ghi chú:
                                        </Typography>
                                        <Typography variant="body1">{payoutData.description}</Typography>
                                    </Box>
                                    <Box display="flex" justifyContent="space-between" mb={1} mt='auto'>
                                        <Typography variant="body1" fontWeight="bold">
                                            Trạng thái:
                                        </Typography>
                                        <Typography variant="body1" color='success'>Hoàn thành</Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>

                {/* Books Table */}
                <Box>
                    <Box display="flex" gap={2} justifyContent='space-between'>
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
                                    <TableCell>Doanh thu (VND)</TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recapEarnings.length > 0 ? (
                                    recapEarnings.map((item) => (
                                        <TableRow key={item.recapId}>
                                            <TableCell>{item.recap?.name}</TableCell>
                                            <TableCell>{dayjs(payoutData.fromDate).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>{dayjs(payoutData.toDate).format('DD/MM/YYYY')}</TableCell>
                                            <TableCell>{(item.earningAmount ?? 0).toLocaleString('vi-VN')} VND</TableCell>
                                            <TableCell><Button onClick={() => detailRecap(item.recapId)}><Visibility /></Button></TableCell>
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