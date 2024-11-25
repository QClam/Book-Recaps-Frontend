import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Typography,
    TableContainer,
    Paper,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Chip,
    TableFooter,
    TablePagination,
    Table,
} from "@mui/material";
import Swal from 'sweetalert2';

import { fetchProfile } from "../Auth/Profile";
import api from "../Auth/AxiosInterceptors";
import "./Appeal.scss";
import { Hourglass } from "react-loader-spinner";

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

function AppealList() {
    const [appeals, setAppeal] = useState([]);
    const [filteredAppeal, setFilteredAppeal] = useState([]);
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [responseText, setResponseText] = useState("");
    const [profile, setProfile] = useState([]);
    const [staffId, setStaffId] = useState("");
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [filterStatus, setFilterStatus] = useState(""); // Lọc trạng thái
    const [loading, setLoading] = useState(true);

    const [responseForm, setResponseForm] = useState({
        id: "",
        staffId: "",
        response: "",
    })

    const navigate = useNavigate();
    const token = localStorage.getItem("access_token")

    const fetchAppeals = async () => {
        try {
            const response = await api.get("/api/appeal/getallappeals");
            const appeals = resolveRefs(response.data.data.$values);
            appeals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            console.log("Appeals: ", appeals);

            setAppeal(appeals);
            setFilteredAppeal(appeals)
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching", error);
        }
    };

    useEffect(() => {
        fetchProfile(token, (profileData) => {
            setProfile(profileData);
            setStaffId(profileData.id);
            setResponseForm((prevForm) => ({
                ...prevForm,
                staffId: profileData.id, // Cập nhật staffId vào form
            }));
        });
    }, [token]);

    const handleResponse = async () => {

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
                        id: selectedAppeal.id,
                        staffId: profile.id,
                        response: responseText,
                    };
                    await api.put("/api/appeal/responseappealbystaff", responseForm);
                    Swal.fire('Thành công!', 'Phản hồi của bạn đã được gửi.', 'success');
                    fetchAppeals();
                } catch (error) {
                    console.error("Error Response", error);
                    Swal.fire('Lỗi!', 'Đã xảy ra lỗi khi gửi phản hồi.', 'error');
                }
            }
        });
    };

    const openDialog = (appeal) => {
        setSelectedAppeal(appeal);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedAppeal(null);
        setResponseText("");
    };

    const handleResponseChange = (e) => {
        setResponseText(e.target.value);
    };

    useEffect(() => {
        fetchAppeals();
    }, []);

    const handleChangePage = (event, newPage) => {
        // Kiểm tra xem trang có hợp lệ hay không
        const totalPages = Math.ceil(filteredAppeal.length / rowsPerPage);
        if (newPage < totalPages && newPage >= 0) {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    useEffect(() => {
        let filteredData = appeals;

        // Search filter
        if (searchTerm) {
            filteredData = filteredData.filter((item) =>
                item.contributor?.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus) {
            filteredData = filteredData.filter((item) => item.appealStatus === filterStatus);
        }

        setFilteredAppeal(filteredData);

        // Kiểm tra nếu page vượt quá tổng số trang
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= totalPages) {
            setPage(0);  // Reset page về 0 nếu vượt quá số trang
        }
    }, [searchTerm, filterStatus, appeals, page, rowsPerPage]);


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
            <Typography variant="h5" margin={1}>Danh sách Kháng cáo của Người đóng góp</Typography>
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
                    <MenuItem value={1}>Đang xử lý</MenuItem>
                    <MenuItem value={2}>Đã xử lý</MenuItem>
                </TextField>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tên Contributor</strong></TableCell>
                            <TableCell><strong>Tên Staff </strong></TableCell>
                            <TableCell><strong>Nội dung kháng cáo </strong> </TableCell>
                            <TableCell><strong>Phản hồi từ Staff </strong></TableCell>
                            <TableCell><strong>Ngày </strong></TableCell>
                            <TableCell><strong>Bản Review</strong></TableCell>
                            <TableCell><strong>Phản hồi Kháng cáo</strong></TableCell>
                            <TableCell><strong>Trạng Thái</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAppeal.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((val) => (
                                <TableRow key={val.id}>
                                    <TableCell>{val.contributor?.fullName}</TableCell>
                                    <TableCell>{val.staff?.fullName || "Chưa có Staff phản hồi"}</TableCell>
                                    <TableCell>{val.reason}</TableCell>
                                    <TableCell>{val.response || "Chưa có phản hồi từ Staff"}</TableCell>
                                    <TableCell>{new Date(val.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" sx={{ width: 120 }}
                                            onClick={() =>
                                                navigate(`/review/content_version/${val.reviewId}`)
                                            }
                                        >
                                            Xem Review
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={() => openDialog(val)}
                                            disabled={val.appealStatus === 2 || val.review?.staffId !== staffId}
                                            variant="contained" color="error" sx={{ width: 120 }}                                           
                                        >
                                            Phản hồi</Button>
                                    </TableCell>
                                    <TableCell>
                                        {val.appealStatus === 1 ? (
                                            <Chip label="Đang xử lý" color="primary" variant="outlined" />
                                        ) : val.appealStatus === 2 ? (
                                            <Chip label="Đã xử lý" color="success" variant="outlined" />
                                        ) : val.appealStatus === 0 ? (
                                            <Chip label="Đang mở" color="warning" variant="outlined" />
                                        ) : (
                                            <Button>Unknow</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 7, 10]}
                                count={filteredAppeal.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Số hàng mỗi trang"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}–${to} trong tổng số ${count !== -1 ? count : `nhiều hơn ${to}`}`
                                }
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth>
                <DialogTitle>Phản hồi Kháng cáo</DialogTitle>
                <DialogContent>
                    <p><strong>Nội dung kháng cáo:</strong> {selectedAppeal?.reason}</p>
                    <TextField
                        label="Phản hồi của bạn"
                        multiline
                        rows={4}
                        fullWidth
                        value={responseText}
                        onChange={handleResponseChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="secondary">Đóng</Button>
                    <Button color="primary" onClick={handleResponse}>Gửi Phản hồi</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}

export default AppealList;
