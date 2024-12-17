import React, { useEffect, useState } from 'react'
import { Hourglass } from 'react-loader-spinner';
import api from '../Auth/AxiosInterceptors';
import { handleFetchError } from '../../utils/handleError';
import { json } from 'react-router-dom';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Pagination, Paper, Select, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import Swal from 'sweetalert2';

import "./Report.scss"

const resolveRefs = (data) => {
    const refMap = new Map();
    const createRefMap = (obj) => {
        if (typeof obj !== "object" || obj === null) return;
        if (obj.$id) {
            refMap.set(obj.$id, obj);
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                createRefMap(obj[key]);
            }
        }
    };
    const resolveRef = (obj) => {
        if (typeof obj !== "object" || obj === null) return obj;
        if (obj.$ref) {
            return refMap.get(obj.$ref);
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = resolveRef(obj[key]);
            }
        }
        return obj;
    };
    createRefMap(data);
    return resolveRef(data);
};

function ReportList() {

    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [users, setUsers] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [responseText, setResponseText] = useState("");
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [filterStatus, setFilterStatus] = useState(""); // Lọc trạng thái
    const [hoverState, setHoverState] = useState({});

    const fetchReports = async () => {
        try {
            const response = await api.get('/api/supportticket/getallsupportticket');
            let reports = resolveRefs(response.data.data.$values);
            reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            console.log(reports);

            setReports(reports);
            setFilteredReports(reports)
            setLoading(false);
            return reports.id;
        } catch (error) {
            const err = handleFetchError(error)
            throw json({ error: err.error }, { status: err.status });
        } finally {
            setLoading(false)
        }
    };

    const fetchUsers = async () => {

        try {
            const response = await api.get(`/api/users/getalluser`);
            const users = response.data.$values;
            // console.log(users);
            setUsers(users);
        } catch (error) {
            const err = handleFetchError(error)
            throw json({ error: err.error }, { status: err.status });
        }
    }

    const openDialog = (report) => {
        setSelectedReport(report);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setIsDetailDialogOpen(false);
        setSelectedReport(null);
        setResponseText("");
    };

    const handleResponseChange = (e) => {
        setResponseText(e.target.value);
    };

    const openDetailDialog = (report) => {
        setSelectedReport(report);
        setIsDetailDialogOpen(true);
    };

    const handleResponse = async (id) => {
        closeDialog();
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Bạn có muốn gửi phản hồi này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, gửi phản hồi!',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const responseForm = {
                        response: responseText,
                    };
                    await api.put(`/api/supportticket/responseticket/${id}`, responseForm);
                    Swal.fire('Thành công!', 'Phản hồi của bạn đã được gửi.', 'success');
                    fetchReports();
                } catch (error) {
                    console.error("Error Response", error);
                    Swal.fire('Lỗi!', 'Đã xảy ra lỗi khi gửi phản hồi.', 'error');
                }
            }
        });
    };

    useEffect(() => {
        fetchReports();
        fetchUsers();
    }, [])

    const handleChangePage = (event, newPage) => {
        // Kiểm tra xem trang có hợp lệ hay không
        const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
        if (newPage < totalPages && newPage >= 0) {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    useEffect(() => {
        let filteredData = reports;

        // Search filter
        if (searchTerm) {
            filteredData = filteredData.filter((item) =>
                item.recaps?.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.recaps?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Lọc theo trạng thái
        if (filterStatus) {
            filteredData = filteredData.filter((item) => item.status === filterStatus);
        }

        setFilteredReports(filteredData);

        // Kiểm tra nếu page vượt quá tổng số trang
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= totalPages) {
            setPage(0);  // Reset page về 0 nếu vượt quá số trang
        }
    }, [searchTerm, filterStatus, reports, page, rowsPerPage]);

    const getUserNamebyId = (userId) => {
        const user = users.find((user) => user.id.toString() === userId.toString());
        // console.log("Matching user: ", user); // Kiểm tra user được tìm thấy
        return user ? user.fullName : "Không xác định";
    }

    const handleMouseEnter = (id) => {
        setHoverState((prev) => ({ ...prev, [id]: true }));
    };

    const handleMouseLeave = (id) => {
        setHoverState((prev) => ({ ...prev, [id]: false }));
    };

    if (loading) {
        return (
            <Box className="loading">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    colors={["#306cce", "#72a1ed"]}
                />
            </Box>
        );
    }

    return (
        <Box sx={{ width: "80vw" }}>
            <Typography variant='h5' margin={1}>Danh sách Report của Thính giả</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <TextField
                    label="Tìm kiếm theo tên Recap hoặc Tên sách"
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
                    <MenuItem value={1}>Đang xử lý</MenuItem>
                    <MenuItem value={2}>Đã phản hồi</MenuItem>
                </TextField>
            </Box>

            <TableContainer component={Paper} >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell ><strong>Bản Recap</strong></TableCell>
                            {/* <TableCell ><strong>Cuốn sách</strong></TableCell> */}
                            <TableCell><strong>Tên</strong></TableCell>
                            <TableCell><strong>Nội dung</strong></TableCell>
                            <TableCell><strong>Phản hồi từ Staff</strong></TableCell>
                            <TableCell ><strong>Ngày tạo</strong></TableCell>
                            <TableCell ><strong>Ngày Phản hồi</strong></TableCell>
                            <TableCell><strong>Phản hồi</strong></TableCell>
                            <TableCell><strong>Trạng Thái</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredReports.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                        filteredReports.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((val) => (
                                <TableRow key={val.id}>
                                    <TableCell sx={{ width: 120 }}>{val.recaps?.name}</TableCell>
                                    {/* <TableCell sx={{width: 120}}>{val.recaps?.book?.title}</TableCell> */}
                                    <TableCell>{getUserNamebyId(val.userId)}</TableCell>
                                    <TableCell>{val.description.length > 30
                                        ? `${val.description.slice(0, 30)}...`
                                        : val.description}</TableCell>
                                    <TableCell>{val.response
                                        ? (val.response.length > 30
                                            ? `${val.response.slice(0, 30)}...`
                                            : val.response)
                                        : "Chưa có phản hồi từ staff"}</TableCell>
                                    <TableCell>{new Date(val.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{val.updatedAt === "0001-01-01T00:00:00" || !val.updatedAt
                                        ? "Chưa phản hồi"
                                        : new Date(val.updatedAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Chip onClick={() => openDialog(val)}
                                            disabled={val.status === 2}
                                            variant={hoverState[val.id] ? 'contained' : 'outlined'}
                                            color='error'
                                            label="Phản hồi"
                                            onMouseEnter={() => handleMouseEnter(val.id)}
                                            onMouseLeave={() => handleMouseLeave(val.id)}
                                        />
                                    </TableCell>
                                    <TableCell width={120}>{val.status === 1 ? (
                                        <Typography color="primary" >Đang xử lý</Typography>
                                    ) : val.status === 2 ? (
                                        <Typography color="success" >Đã phản hồi</Typography>
                                    ) : (
                                        <Typography color="warning" >Đã mở</Typography>
                                    )}</TableCell>
                                    <TableCell><Button
                                        disabled={val.status === 1}
                                        onClick={() => openDetailDialog(val)}
                                    >
                                        <Visibility />
                                    </Button>
                                    </TableCell>
                                </TableRow>
                            )))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 7, 10]}
                                count={filteredReports.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Số hàng mỗi trang"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}–${to} trong tổng số ${count !== -1 ? count : `nhiều hơn ${to}`}`}
                                showFirstButton
                                showLastButton
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth>
                <DialogTitle>Phản hồi Report</DialogTitle>
                <DialogContent>
                    <p><strong>Nội dung:</strong> {selectedReport?.description}</p>
                    <TextField
                        label="Phản hồi của bạn"
                        multiline
                        rows={4}
                        fullWidth
                        value={responseText}
                        onChange={handleResponseChange}
                        sx={{ marginTop: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="secondary">Đóng</Button>
                    <Button color="primary" onClick={() => handleResponse(selectedReport?.id)}>Gửi Phản hồi</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={isDetailDialogOpen} onClose={closeDialog} fullWidth>
                <DialogTitle>Chi tiết Report</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1"><strong>Bản Recap:</strong> {selectedReport?.recaps?.name}</Typography>
                    <Typography variant="subtitle1"><strong>Nội dung:</strong> {selectedReport?.description}</Typography>
                    <TextField
                        label="Phản hồi của bạn"
                        multiline
                        rows={4}
                        fullWidth
                        value={selectedReport?.response}
                        sx={{ marginTop: 2 }}
                        slotProps={{
                            input: {
                              readOnly: true,
                            },
                          }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="secondary">Đóng</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default ReportList