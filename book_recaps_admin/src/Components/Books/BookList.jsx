import React, { useState, useEffect } from 'react'
import api from '../Auth/AxiosInterceptors'
import { Delete, Visibility } from "@mui/icons-material";
import empty_image from "../../data/empty-image.png"
import { Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddBookModal from './AddBookModal';
import { Hourglass } from 'react-loader-spinner';
import Swal from 'sweetalert2';

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

function BookList() {

    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [modalIsOpen, setModalIsOpen] = useState(false); // Modal visibility state
    const [loading, setLoading] = useState(true);
    const [isHover, setIsHover] = useState(false);
    const [selectedPublisher, setSelectedPublisher] = useState(""); // Tác giả được chọn
    const [selectedCategory, setSelectedCategory] = useState(""); // Danh mục được chọn

    const navigate = useNavigate();

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/book/getallbooks')
            const books = resolveRefs(response.data.data.$values);
            const contracts = books.map((book) => book.contracts?.$values || []);
            const categories = books.map((book) => book.categories?.$values || [])
            // console.log("Books: ", books);
            // console.log("Contracts: ", contracts);
            // console.log("Cate: ", categories);
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

    const publishers = [...new Set(books.flatMap(book => book.contracts?.$values?.map(author => author.publisher?.publisherName)))];
    const categories = [...new Set(books.flatMap(book => book.categories?.$values?.map(category => category.name)))];

    useEffect(() => {
        let filteredData = books;

        // Search filter
        if (searchTerm) {
            filteredData = filteredData.filter((item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.originalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.authors?.$values?.some((author) =>
                    author.name.toLowerCase().includes(searchTerm.toLocaleLowerCase()))
            );
        }

        // Publisher filter
        if (selectedPublisher) {
            filteredData = filteredData.filter((item) =>
                item.contracts?.$values?.some((author) => author.publisher?.publisherName === selectedPublisher)
            );
        }

        // Category filter
        if (selectedCategory) {
            filteredData = filteredData.filter((item) =>
                item.categories?.$values?.some((category) => category.name === selectedCategory)
            );
        }

        setFilteredBooks(filteredData);

        // Kiểm tra nếu page vượt quá tổng số trang
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= totalPages) {
            setPage(0);  // Reset page về 0 nếu vượt quá số trang
        }
    }, [searchTerm, books, page, rowsPerPage, selectedPublisher, selectedCategory]);

    const handleDeleteBook = async (id) => {
        Swal.fire({
            title: "Bạn có chắc chắn muốn xóa?",
            text: "Bạn không thể hoàn tác hành động này!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Xóa",
            cancelButtonText: "Hủy",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await api.delete(`/api/book/deletebook/${id}`);
                    if (response && response.status === 200) {
                        setBooks(books.filter((book) => book.id !== id))
                        Swal.fire("Đã xóa!", "Sách đã được xóa", "success");
                        await fetchBooks();
                    }
                } catch (error) {
                    Swal.fire("Thất bại", "Có lỗi xảy ra trong quá trình xóa", "error");
                }
            }
        })
    }

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

    const handleMouseEnter = () => {
        setIsHover(true);
    }

    const handleMouseLeave = () => {
        setIsHover(false);
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
            <Typography variant='h5' margin={1}>Danh sách những cuốn sách</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <TextField
                    label="Tìm kiếm theo tên cuốn sách hoặc tên tác giả"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: '40%' }}
                />
                <TextField
                    select
                    value={selectedPublisher}
                    onChange={(e) => setSelectedPublisher(e.target.value)}
                    variant="outlined"
                    size="small"
                    SelectProps={{ native: true }}
                    sx={{ width: '20%' }}

                >
                    <option value="" disabled hidden>Chọn Nhà xuất Bản</option> {/* Placeholder */}
                    <option value="">Tất cả</option> {/* Hiển thị "Tất cả" khi chọn */}
                    {publishers.map((publisher, index) => (
                        <option key={index} value={publisher}>{publisher}</option>
                    ))}
                </TextField>
                <TextField
                    select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    variant="outlined"
                    size="small"
                    SelectProps={{ native: true }}
                    sx={{ width: '20%' }}
                >
                    <option value="" disabled hidden>Chọn thể loại</option> {/* Placeholder */}
                    <option value="">Tất cả</option> {/* Hiển thị "Tất cả" khi chọn */}
                    {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </TextField>
                <Chip label="Tạo mới cuốn sách"
                    variant={isHover ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => setModalIsOpen(true)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell><strong>Tên</strong></TableCell>
                            <TableCell><strong>Thể loại</strong></TableCell>
                            <TableCell><strong>Mã ISBN</strong></TableCell>
                            <TableCell><strong>Xuất bản</strong></TableCell>
                            <TableCell><strong>Tác giả</strong></TableCell>
                            <TableCell><strong>Độ tuổi</strong></TableCell>
                            <TableCell><strong>Hợp đồng kèm theo</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredBooks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((book) => (
                            <TableRow key={book.id}>
                                <TableCell><img
                                    src={book.coverImage || empty_image}
                                    alt="Book Cover"
                                    style={{ width: 60, height: 100 }}
                                    onError={(e) => {
                                        e.currentTarget.onerror = null; // Đảm bảo không lặp lại sự kiện
                                        e.currentTarget.src = empty_image; // Đặt lại ảnh nếu lỗi
                                    }}
                                /></TableCell>
                                <TableCell sx={{ width: 180 }}>{book.title}</TableCell>
                                <TableCell sx={{ width: 120 }}>
                                    {book.categories.$values ? book.categories.$values.map(cate => cate.name).join(", ") : "N/A"}
                                </TableCell>
                                <TableCell sx={{width: 240}}>
                                    <Box>
                                        <Typography>ISBN_10: {book.isbN_10 || "Hệ thống chưa gắn mã ISBN"}</Typography>
                                        <Typography>ISBN_13: {book.isbN_13 || "Hệ thống chưa gắn mã ISBN"}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{book.publicationYear}</TableCell>
                                <TableCell>{book.authors.$values ? book.authors.$values.map(author => author.name).join(", ") : "N/A"}</TableCell>
                                <TableCell>{book.ageLimit} tuổi</TableCell>
                                <TableCell>
                                    {book.contracts?.$values?.length > 0 ? (
                                        book.contracts.$values.map((contract) => (
                                            <Button
                                                key={contract.id}
                                                color="primary"
                                                onClick={() => navigate(`/contract/${contract.id}`)}
                                                style={{ marginRight: '8px', textTransform: 'none' }}
                                                sx={{ display: "flex", textAlign: 'start' }}
                                            >
                                                Hợp đồng {contract.publisher?.publisherName}
                                            </Button>
                                        ))
                                    ) : (
                                        <Typography>Chưa có hợp đồng</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Box display='flex'>
                                        <Button onClick={() => detailBook(book.id)}>
                                            <Visibility />
                                        </Button>
                                        <Button onClick={() => handleDeleteBook(book.id)}>
                                            <Delete />
                                        </Button>
                                    </Box>
                                </TableCell>
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
                                showFirstButton
                                showLastButton
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