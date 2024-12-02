import { Box, Button, Chip, MenuItem, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import api from '../Auth/AxiosInterceptors';
import { useNavigate } from 'react-router-dom';
import { Hourglass } from 'react-loader-spinner';
import { Visibility } from '@mui/icons-material';
import dayjs from 'dayjs'

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

function Recaps() {

    const [recapVersions, setRecapVersions] = useState([]);
    const [filteredVersions, setFilteredVersions] = useState([]);
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [filterStatus, setFilterStatus] = useState(""); // Lọc trạng thái
    const [profile, setProfile] = useState([]);
    const [loading, setLoading] = useState(true);

    const [reviewForm, setReviewForm] = useState({
        staffId: "",
        recapVersionId: "",
        comments: "",
    });

    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();

    const fetchRecapVersions = async () => {
        try {
            const response = await api.get('/api/recap/Getallrecap');
            const recapVersions = resolveRefs(response.data.data.$values);
            setRecapVersions(recapVersions);
            setFilteredVersions(recapVersions); // Initialize filtered data
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching RecapVersions", error);
        }
    };

    useEffect(() => {
        fetchRecapVersions();
    }, []);

    useEffect(() => {
        let filteredData = recapVersions;

        // Search filter
        if (searchTerm) {
            filteredData = filteredData.filter((item) =>
                item.recapName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.contributorName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus) {
            filteredData = filteredData.filter((item) => item.status === filterStatus);
        }

        setFilteredVersions(filteredData);

        // Kiểm tra nếu page vượt quá tổng số trang
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= totalPages) {
            setPage(0);  // Reset page về 0 nếu vượt quá số trang
        }
    }, [searchTerm, filterStatus, recapVersions, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        // Kiểm tra xem trang có hợp lệ hay không
        const totalPages = Math.ceil(filteredVersions.length / rowsPerPage);
        if (newPage < totalPages && newPage >= 0) {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    const detailRecap = async (id) => {
        navigate(`/recap/${id}`)
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" width="80vw">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    colors={["#306cce", "#72a1ed"]}
                />
            </Box>
        );
    }
    
    return (
        <Box sx={{ width: "80vw" }}>
            <Typography variant='h5' margin={1}>Danh sách các Recap Version</Typography>

            {/* Search and Filter */}
            <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <TextField
                    label="Tìm kiếm theo tên Sách hoặc tên Recap"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: "40%" }}
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
                    <MenuItem value="Approved">Chấp nhận</MenuItem>
                    <MenuItem value="Rejected">Từ chối</MenuItem>
                </TextField>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tên bản Recap</strong></TableCell>
                            <TableCell><strong>Tên cuốn sách</strong></TableCell>
                            <TableCell><strong>Tên Người đóng góp</strong></TableCell>
                            <TableCell><strong>Ngày</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredVersions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.book?.title}</TableCell>
                                <TableCell>{item.contributor?.fullName}</TableCell>
                                <TableCell>{dayjs(item.createdAt).format("DD-MM-YYYY")}</TableCell>
                                <TableCell>
                                    {item.currentVersion?.status === 1 ? (
                                        <Typography color="primary">Đang xử lý</Typography>
                                    ) : item.currentVersion?.status === 2 ? (
                                        <Typography color="success" >Đã Chấp thuận</Typography>
                                    ) : item.currentVersion?.status === 3 ? (
                                        <Typography color='error' >Đã Từ chối</Typography>
                                    ) : (
                                        <Typography color='warning' >Draft</Typography>
                                    )}
                                </TableCell>
                                <TableCell><Button onClick={() => detailRecap(item.id)}><Visibility /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={filteredVersions.length} // Tổng số dòng sau khi lọc
                                page={page} // Trang hiện tại
                                onPageChange={handleChangePage} // Hàm xử lý thay đổi trang
                                rowsPerPage={rowsPerPage} // Số dòng hiển thị mỗi trang
                                onRowsPerPageChange={handleChangeRowsPerPage} // Hàm xử lý thay đổi số dòng mỗi trang
                                rowsPerPageOptions={[5, 10, 25]} // Tùy chọn số dòng mỗi trang
                                labelRowsPerPage="Số dòng mỗi trang:" // Văn bản tiếng Việt
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}–${to} trên ${count !== -1 ? count : `nhiều hơn ${to}`}`
                                }
                                showFirstButton
                                showLastButton
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default Recaps