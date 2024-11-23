import React, { useEffect, useState } from 'react'
import {
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Typography, Button, Box, Modal, TextField, MenuItem, Pagination
} from '@mui/material';
import { Hourglass } from 'react-loader-spinner';

import api from '../Auth/AxiosInterceptors'
import { Edit, Visibility } from '@mui/icons-material';
import WithdrawalInfo from './WithdrawalInfo';
import WithdrawalRequest from './WithdrawalRequest';
function WithdrawalList() {

    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedDrawalId, setSelectedDrawalId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState(null); // State để xác định mở dialog Info hay Request

    const handleInfoView = (drawalId) => {
        setSelectedDrawalId(drawalId);
        setDialogType('info');
        setIsDialogOpen(true);
    };

    const handleRequestView = (drawalId) => {
        setSelectedDrawalId(drawalId);
        setDialogType('request');
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedDrawalId(null);
        setDialogType(null);
    };


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
                            <TableCell><strong>Ngày tạo</strong></TableCell>`
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {displaywithdrawals.map((item) => (
                            <TableRow key={item.drawalId}>
                                <TableCell>{item.contributorName}</TableCell>
                                <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalEarnings || 0)}</TableCell>
                                <TableCell>{item.description || "Không có ghi chú"}</TableCell>
                                {item.status === "Pending" ? (
                                    <TableCell sx={{color: "#edf5fa"}}>Đang mở</TableCell>

                                ) : item.status === "Accepted" ? (
                                    <TableCell sx={{color: "green"}}>Hoàn tất</TableCell>
                                ) : item.status === "Rejected" ? (
                                    <TableCell sx={{color: "red"}}>Hủy</TableCell>
                                ) : (
                                    <TableCell>Lỗi</TableCell>
                                )}
                                <TableCell>{new Date(withdrawals.createAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {item.status === "Pending" ? (

                                        <Button
                                            color="primary"
                                            onClick={() => handleRequestView(item.drawalId)}
                                            sx={{
                                                '&:hover': { backgroundColor: '#edf5fa' },
                                            }}
                                        >
                                            <Edit />
                                        </Button>
                                    ) : item.status === "Accepted" ? (

                                        <Button
                                            color="primary"
                                            onClick={() => handleInfoView(item.drawalId)}
                                            sx={{
                                                '&:hover': { backgroundColor: '#edf5fa' },
                                            }}
                                        >
                                            <Visibility />
                                        </Button>
                                    ) : (
                                        <Button
                                            color="error"
                                            variant='outlined'
                                            sx={{
                                                '&:hover': { backgroundColor: '#edf5fa' },
                                            }}
                                        >
                                            Bị hủy
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {dialogType === 'info' && (
                <WithdrawalInfo
                    open={isDialogOpen}
                    onClose={handleCloseDialog}
                    drawalId={selectedDrawalId} />
            )}
            {dialogType === 'request' && (
                <WithdrawalRequest
                    open={isDialogOpen}
                    onClose={handleCloseDialog}
                    drawalId={selectedDrawalId}
                    onUpdate={fetchWithdrawals} />
            )}

            <Pagination
                className="center"
                count={Math.ceil(withdrawals.length / withdrawalsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                sx={{ margin: 1 }}
            />
        </Box>
    )
}

export default WithdrawalList