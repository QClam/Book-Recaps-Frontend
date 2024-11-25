import React, { useState, useEffect } from 'react'
import api from '../Auth/AxiosInterceptors'
import { Visibility } from "@mui/icons-material";
import empty_image from "../../data/empty-image.png"
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddBookModal from './AddBookModal';
import { Hourglass } from 'react-loader-spinner';

function BookList() {

    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [modalIsOpen, setModalIsOpen] = useState(false); // Modal visibility state
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/book/getallbooks')
            const books = response.data.data.$values;
            console.log("Books: ", books);
            setBooks(books);
            setFilteredBooks(books);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching books", error);
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBooks();
    }, [])

    useEffect(() => {
        let filteredData = books;

        // Search filter
        if (searchTerm) {
            filteredData = filteredData.filter((item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.originalTitle.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredBooks(filteredData);

        // Kiểm tra nếu page vượt quá tổng số trang
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= totalPages) {
            setPage(0);  // Reset page về 0 nếu vượt quá số trang
        }
    }, [searchTerm, books, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        // Kiểm tra xem trang có hợp lệ hay không
        const totalPages = Math.ceil(filteredBooks.length / rowsPerPage);
        if (newPage < totalPages && newPage >= 0) {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    const detailBook = async (id) => {
        navigate(`/book/${id}`)
    }

    if (loading) {
        return (
            <div className="loading">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    colors={["#306cce", "#72a1ed"]}
                />
            </div>
        );
    }

    return (
        <Box sx={{ width: "80vw" }}>
            <Typography variant='h5' margin={1}>Danh sách những cuốn sách</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <TextField
                    label="Tìm kiếm theo tên cuốn sách"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: '40%' }}
                />
                <Button variant="contained" color="primary" onClick={() => setModalIsOpen(true)}>
                    Tạo mới cuốn sách
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell><strong>Tên Sách</strong></TableCell>
                            <TableCell><strong>Tên Gốc</strong></TableCell>
                            <TableCell><strong>Mô tả</strong></TableCell>
                            <TableCell><strong>Xuất bản</strong></TableCell>
                            <TableCell><strong>Tác giả</strong></TableCell>
                            <TableCell><strong>Độ tuổi</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBooks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((book) => (
                            <TableRow key={book.id}>
                                <TableCell><img
                                    src={book.coverImage || empty_image}
                                    alt="Book Cover"
                                    style={{ width: 60, height: 60 }}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null; // Đảm bảo không lặp lại sự kiện
                                        e.currentTarget.src = empty_image; // Đặt lại ảnh nếu lỗi
                                    }}
                                /></TableCell>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.originalTitle}</TableCell>
                                <TableCell>{book.description.length > 100 ? `${book.description.substring(0, 100)}...` : book.description}</TableCell>
                                <TableCell>{book.publicationYear}</TableCell>
                                <TableCell> {book.authors.$values ? book.authors.$values.map(author => author.name).join(", ") : "N/A"}</TableCell>
                                <TableCell>{book.ageLimit} tuổi</TableCell>
                                <TableCell><Button onClick={() => detailBook(book.id)}><Visibility /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={filteredBooks.length} // Tổng số dòng sau khi lọc
                                page={page} // Trang hiện tại
                                onPageChange={handleChangePage} // Hàm xử lý thay đổi trang
                                rowsPerPage={rowsPerPage} // Số dòng hiển thị mỗi trang
                                onRowsPerPageChange={handleChangeRowsPerPage} // Hàm xử lý thay đổi số dòng mỗi trang
                                rowsPerPageOptions={[5, 10, 25]} // Tùy chọn số dòng mỗi trang
                                labelRowsPerPage="Số dòng mỗi trang:" // Văn bản tiếng Việt
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}–${to} trên ${count !== -1 ? count : `nhiều hơn ${to}`}`
                                }
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            <AddBookModal
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                onBookAdded={fetchBooks}
            />
        </Box>
    )
}

export default BookList