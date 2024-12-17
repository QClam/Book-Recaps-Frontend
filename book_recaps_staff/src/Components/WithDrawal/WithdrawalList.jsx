import React, { useEffect, useState } from 'react'
import {
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Paper, Typography, Button, Box, Modal, TextField, MenuItem, Pagination,
    TablePagination,
    TableFooter,
    Chip
} from '@mui/material';
import { Hourglass } from 'react-loader-spinner';

import api from '../Auth/AxiosInterceptors'
import { Edit, Visibility } from '@mui/icons-material';
import WithdrawalInfo from './WithdrawalInfo';
import WithdrawalRequest from './WithdrawalRequest';
function WithdrawalList() {

    const [withdrawals, setWithdrawals] = useState([]);
    const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDrawalId, setSelectedDrawalId] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState(null); // State để xác định mở dialog Info hay Request
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [filterStatus, setFilterStatus] = useState(""); // Lọc trạng thái

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

    const handleChangePage = (event, newPage) => {
        // Kiểm tra xem trang có hợp lệ hay không
        const totalPages = Math.ceil(filteredWithdrawals.length / rowsPerPage);
        if (newPage < totalPages && newPage >= 0) {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    const fetchWithdrawals = async () => {
        try {
            const response = await api.get('/api/contributorwithdrawal/getalldrawals')
            const withdrawals = response.data.$values;
            console.log("Withdrawals: ", withdrawals);
            setWithdrawals(withdrawals);
            setFilteredWithdrawals(withdrawals);
            setLoading(false)
        } catch (error) {
            console.error("Error Fetching Withdrawls", error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWithdrawals();
    }, [])

    useEffect(() => {
        let filteredData = withdrawals;

        // Search filter
        if (searchTerm) {
            filteredData = filteredData.filter((item) =>
                item.contributorName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus) {
            filteredData = filteredData.filter((item) => item.status === filterStatus);
        }

        setFilteredWithdrawals(filteredData);

        // Kiểm tra nếu page vượt quá tổng số trang
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= totalPages) {
            setPage(0);  // Reset page về 0 nếu vượt quá số trang
        }
    }, [searchTerm, filterStatus, withdrawals, page, rowsPerPage]);

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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <TextField
                    label="Tìm kiếm theo tên"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: '40%' }}
                />
                <TextField
                    select
                    label="Trạng thái"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    size="small"
                    sx={{ width: '20%' }}
                >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="Pending">Đang xử lý</MenuItem>
                    <MenuItem value="Accepted">Đã hoàn tất</MenuItem>
                    <MenuItem value="Rejected">Đã hủy</MenuItem>
                </TextField>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tên</strong></TableCell>
                            <TableCell><strong>Số tiền</strong></TableCell>
                            <TableCell><strong>Ghi chú</strong></TableCell>
                            <TableCell><strong>Ngày tạo</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredWithdrawals.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                        filteredWithdrawals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                            <TableRow key={item.drawalId}>
                                <TableCell>{item.contributorName}</TableCell>
                                <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalEarnings || 0)}</TableCell>
                                <TableCell>{item.description || "Không có ghi chú"}</TableCell>
                                <TableCell>{new Date(item.createAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {item.status === "Pending" ? (
                                        <Typography color="primary" >Đang xử lý</Typography>
                                    ) : item.status === "Accepted" ? (
                                        <Typography color="success" >Đã hoàn tất</Typography>
                                    ) : item.status === "Rejected" ? (
                                        <Typography color="error" >Đã hủy</Typography>
                                    ) : (
                                        <TableCell>Lỗi</TableCell>
                                    )}
                                </TableCell>
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
                                        <Typography></Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 7, 10]}
                                count={filteredWithdrawals.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Số hàng mỗi trang"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}–${to} trong tổng số ${count !== -1 ? count : `nhiều hơn ${to}`}`
                                }
                                showFirstButton
                                showLastButton
                            />
                        </TableRow>
                    </TableFooter>
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
        </Box>
    )
}

export default WithdrawalList