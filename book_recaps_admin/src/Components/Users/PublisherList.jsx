import React, { useEffect, useState } from "react";
import api from "../Auth/AxiosInterceptors";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import { Hourglass } from "react-loader-spinner";

function PublisherList() {
    const [publishers, setPublishsers] = useState([]);
    const [selectedPublisher, setSelectedPublisher] = useState(null);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    

    const fetchPublishers = async () => {

        setLoading(true);

        try {
            const response = await api.get("/api/publisher/getallpublishers");
            const publishers = response.data.$values;
            setPublishsers(publishers);
            console.log("Publishers: ", publishers);
            setLoading(false)
        } catch (error) {
            console.error("Error Fetching Publishers", error);
        } finally {
            setLoading(false);
        }
    };

    const updatePublisher = async () => {
        if (!selectedPublisher || !selectedPublisher.id)
            return;

        try {
            const response = await api.put(`/api/publisher/updatepublisherinfo/${selectedPublisher.id}`, selectedPublisher);
            console.log(response.data);

            fetchPublishers();
            setOpen(false);
        } catch (error) {
            console.error("Error Updating Publisher", error);
        }
    }

    useEffect(() => {
        fetchPublishers();
    }, []);

    useEffect(() => {
        let filteredData = publishers;

        // Search filter
        if (searchTerm) {
            filteredData = filteredData.filter((item) =>
                item.publisherName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filteredData);

        // Kiểm tra nếu page vượt quá tổng số trang
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= totalPages) {
            setPage(0);  // Reset page về 0 nếu vượt quá số trang
        }
    }, [searchTerm, publishers, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        // Kiểm tra xem trang có hợp lệ hay không
        const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
        if (newPage < totalPages && newPage >= 0) {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    // Mở modal và lưu thông tin NXB được chọn
    const handleEditClick = (publisher) => {
        setSelectedPublisher({ ...publisher }); // Tạo bản sao để chỉnh sửa
        setOpen(true);
    };

    // Xử lý thay đổi trong các trường input
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedPublisher((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedPublisher(null);
    };

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
            <Typography variant="h5" sx={{ margin: 2 }}>Danh sách các NXB</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, gap: 2 }}>
            <TextField
                    label="Tìm kiếm theo tên"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: "30%" }}
                />
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold" }}>Tên NXB</TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                                Thông tin liên lạc
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold" }}>
                                Tài khoản Ngân Hàng
                            </TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Không có dữ liệu
                                </TableCell>
                            </TableRow>
                        ) : (
                        filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.publisherName}</TableCell>
                                <TableCell>{item.contactInfo}</TableCell>
                                <TableCell>{item.bankAccount}</TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => handleEditClick(item)}
                                    >
                                        <Edit />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={filteredUsers.length} // Tổng số dòng sau khi lọc
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

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Thông tin Nhà Xuất Bản</DialogTitle>
                <DialogContent>
                    {selectedPublisher && (
                        <Box>
                            <TextField
                                label="Tên NXB"
                                name="publisherName"
                                value={selectedPublisher.publisherName || ""}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Thông tin liên lạc"
                                name="contactInfo"
                                value={selectedPublisher.contactInfo || ""}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Tài khoản Ngân Hàng"
                                name="bankAccount"
                                value={selectedPublisher.bankAccount || ""}
                                onChange={handleInputChange}
                                fullWidth
                                margin="normal"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="error">
                        Hủy
                    </Button>
                    <Button onClick={updatePublisher} color="primary" variant="contained">
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default PublisherList;
