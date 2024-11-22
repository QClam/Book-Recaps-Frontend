import React, { useEffect, useState } from 'react'
import {
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Typography, Button, Box, Modal, TextField, MenuItem, Pagination
} from '@mui/material';
import { Hourglass } from 'react-loader-spinner';

import api from '../Auth/AxiosInterceptors'
import { Edit, Visibility } from '@mui/icons-material';
function WithdrawalList() {

    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const withdrawalsPerPage = 7;

    const displaywithdrawals = withdrawals.slice(
        (currentPage - 1) * withdrawalsPerPage,
        currentPage * withdrawalsPerPage
    );

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const fetchWithdrawals = async () => {
        try {
            const response = await api.get('/api/contributorwithdrawal/getalldrawals')
            const withdrawals = response.data.$values;
            console.log("Withdrawals: ", withdrawals);
            setWithdrawals(withdrawals);
            setLoading(false)
        } catch (error) {
            console.error("Error Fetching Withdrawls", error);
        }
    }

    useEffect(() => {
        fetchWithdrawals();
    }, [])

    if (loading) {
        return (
            <div className="loading">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    colors={["#306cce", "#72a1ed"]}
                />
            </div>
        );
    }

    return (
        <Box sx={{ width: "80vw" }}>
            <Typography variant='h5' margin={1}>Yêu cầu rút tiền của Người đóng góp</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tên</strong></TableCell>
                            <TableCell><strong>Số tiền</strong></TableCell>
                            <TableCell><strong>Ghi chú</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell><strong>Ngày tạo</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displaywithdrawals.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.contributorName}</TableCell>
                                <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalEarnings || 0)}</TableCell>
                                <TableCell>{item.description || "Không có ghi chú"}</TableCell>
                                {item.status === "Pending" ? (
                                    <TableCell>Đang mở</TableCell>

                                ) : item.status === "Accepted" ? (
                                    <TableCell>Hoàn tất</TableCell>
                                ) : (
                                    <TableCell>Lỗi</TableCell>
                                )}
                                <TableCell>
                                    {item.status === "Pending" ? (

                                        <Button
                                            color="primary"
                                            // onClick={() => historyPayout(item.contributorId)}
                                            sx={{
                                                '&:hover': { backgroundColor: '#edf5fa' },
                                            }}
                                        >
                                            <Edit />
                                        </Button>
                                    ) : item.status === "Accepted" ? (

                                        <Button
                                            color="primary"
                                            // onClick={() => detailPayout(item.payoutId)}
                                            sx={{
                                                '&:hover': { backgroundColor: '#edf5fa' },
                                            }}
                                        >
                                            <Visibility />
                                        </Button>
                                    ) : (
                                        <TableCell>Bị hủy</TableCell>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Pagination
                className="center"
                count={Math.ceil(withdrawals.length / withdrawalsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                sx={{margin: 1}}
            />
        </Box>
    )
}

export default WithdrawalList