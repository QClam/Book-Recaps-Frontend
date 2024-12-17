import React, { useEffect, useState } from 'react';
import {
    Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
    TablePagination, TextField, MenuItem, Select, FormControl, InputLabel,
    Button,
    TableFooter
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import api from '../Auth/AxiosInterceptors';
import { fetchProfile } from "../Auth/Profile";
import { Hourglass } from 'react-loader-spinner';

function RecapVersions() {

    const [recapVersions, setRecapVersions] = useState([]);
    const [filteredVersions, setFilteredVersions] = useState([]);
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [filterStatus, setFilterStatus] = useState(""); // Lọc trạng thái
    const [profile, setProfile] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoverState, setHoverState] = useState({});
    const [hoverDetailState, setHoverDetailState] = useState({});

    const [reviewForm, setReviewForm] = useState({
        staffId: "",
        recapVersionId: "",
        comments: "",
    });

    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();

    const fetchRecapVersions = async () => {
        try {
            const response = await api.get('/api/recap/get-all-versionnotdraft');
            const recapVersions = response.data.data.$values;
            setRecapVersions(recapVersions);
            setFilteredVersions(recapVersions); // Initialize filtered data
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching RecapVersions", error);
        } finally {
            setLoading(false)
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

    useEffect(() => {
        fetchProfile(token, (profileData) => {
            setProfile(profileData);
            setReviewForm((prevForm) => ({
                ...prevForm,
                staffId: profileData.id, // Cập nhật staffId vào form review
            }));
        });
    }, [token]);

    const createReview = async (recapVersionId) => {
        try {
            const newReview = {
                staffId: reviewForm.staffId,
                recapVersionId: recapVersionId,
                comments: "Chưa Đạt",
            };

            const response = await api.post("/api/review/createreview", newReview);
            const reviewId = response.data.data?.id;
            if (reviewId) {
                console.log("Review created successfully:", response.data);
                navigate(`/review/content_version/${reviewId}`);
            } else {
                console.error("Review created but ID not found.");
            }
        } catch (error) {
            console.error("Error creating review:", error);
        }
    };

    const handleMouseEnter = (id) => {
        setHoverState((prev) => ({ ...prev, [id]: true }));
    };

    const handleDetailMouseEnter = (id) => {
        setHoverDetailState((prev) => ({ ...prev, [id]: true }));
    };

    const handleMouseLeave = (id) => {
        setHoverState((prev) => ({ ...prev, [id]: false }));
        setHoverDetailState((prev) => ({ ...prev, [id]: false }));
    };

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
                    <MenuItem value="Approved">Đã chấp thuận</MenuItem>
                    <MenuItem value="Rejected">Đã từ chối</MenuItem>
                </TextField>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>ID</strong></TableCell>
                            <TableCell><strong>Bản Recap</strong></TableCell>
                            <TableCell><strong>Cuốn sách</strong></TableCell>
                            <TableCell sx={{width: 120}}><strong>Tên</strong></TableCell>
                            <TableCell><strong>Ngày</strong></TableCell>
                            <TableCell><strong>Duyệt</strong></TableCell>
                            <TableCell><strong>Chi tiết</strong></TableCell>
                            <TableCell><strong>Trạng thái</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredVersions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                        filteredVersions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                            <TableRow key={item.recapVersionId}>
                                <TableCell sx={{width: 180}}>{item.recapVersionId}</TableCell>
                                <TableCell>{item.versionName}</TableCell>
                                <TableCell>{item.bookTitle}</TableCell>
                                <TableCell>{item.contributorName}</TableCell>
                                <TableCell>{new Date(item.createAt).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        variant={hoverState[item.recapVersionId] ? 'contained' : 'outlined'}
                                        label="Duyệt"
                                        color='primary'
                                        disabled={!!item.reviewId}
                                        onClick={() => createReview(item.recapVersionId)}
                                        onMouseEnter={() => handleMouseEnter(item.recapVersionId)}
                                        onMouseLeave={() => handleMouseLeave(item.recapVersionId)} />
                                </TableCell>
                                <TableCell>{item.reviewId ? (
                                    <Chip
                                        variant={hoverDetailState[item.recapVersionId] ? 'contained' : 'outlined'}
                                        color='success'
                                        label="Xem chi tiết"
                                        onClick={() => navigate(`/review/content_version/${item.reviewId}`)}
                                        onMouseEnter={() => handleDetailMouseEnter(item.recapVersionId)}
                                        onMouseLeave={() => handleMouseLeave(item.recapVersionId)}
                                    />
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Chưa có Review
                                    </Typography>
                                )}</TableCell>
                                <TableCell>
                                    {item.status === "Pending" ? (
                                        <Typography color="primary" >Đang xử lý</Typography>
                                    ) : item.status === "Approved" ? (
                                        <Typography color="success" >Đã Chấp thuận</Typography>
                                    ) : item.status === "Rejected" ? (
                                        <Typography color='error' >Đã Từ chối</Typography>
                                    ) : (
                                        <Typography sx={{ color: "#bdbfbe" }} >Unknown</Typography>
                                    )}
                                </TableCell>
                            </TableRow>
                        )))}
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
    );
}

export default RecapVersions;
