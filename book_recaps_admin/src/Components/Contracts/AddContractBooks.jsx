import React, { useEffect, useState } from 'react'
import { fetchContractDetail } from './ContractServices';
import { Box, Button, Card, CardContent, Checkbox, Grid, Modal, TextField, Typography } from '@mui/material';
import api from '../Auth/AxiosInterceptors';

function AddContractBooks({ contractId }) {

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        const selectedIds = contractBooks.map(book => book.id);
        setSelectedBookIds(selectedIds);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const [books, setBooks] = useState([]);
    const [contractBooks, setContractBooks] = useState([]);
    const [contract, setContract] = useState([]);
    const [selectedBookIds, setSelectedBookIds] = useState([]);
    const [searchBook, setSearchBook] = useState("");

    const getContractDetail = async () => {
        try {
            const result = await fetchContractDetail(contractId);
            if (result) {
                setContract(result.contract);
                setContractBooks(result.contractBooks);
            }
        } catch (error) {
            console.error("Error Fetching Contract Details", error);
        }
    };

    const fetchBooks = async () => {
        const response = await api.get('/api/book/getallbooks')
        const books = response.data.data.$values;
        setBooks(books);
    }

    // Xử lý chọn sách
    const handleSelectBook = (bookId) => {
        setSelectedBookIds(prevSelected =>
            prevSelected.includes(bookId)
                ? prevSelected.filter(id => id !== bookId) // Bỏ chọn
                : [...prevSelected, bookId] // Thêm vào danh sách chọn
        );
    };

    const handleAddBook = async () => {
        try {
            const response = await api.put(`/api/Contract/addbooktocontract/${contractId}`, { bookIds: selectedBookIds });           
            setContractBooks([...contractBooks, ...selectedBookIds]);
            getContractDetail();
            handleClose();
        } catch (error) {
            console.error("Error Adding", error);
        }
    }

    useEffect(() => {
        getContractDetail();
        fetchBooks();
    }, [contractId])

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchBook.toLowerCase())
    );

    return (
        <div style={{ marginTop: 20 }}>
            <Typography variant="h6" gutterBottom>Các cuốn sách xin cấp bản quyền</Typography>
            <Button color='primary' variant='outlined' onClick={handleOpen} sx={{ margin: 1 }}>
                Cập nhật sách
            </Button>

            <Box sx={{ width: '100%', maxWidth: 1000 }}>
                <Grid container spacing={2}>
                    {contractBooks.map((item, index) => (
                        <Grid item xs={12} sm={8} md={4} key={`${item.id}-${index}`}>
                            <Card variant="outlined" sx={{ width: '100%', height: 280 }}>
                                <CardContent sx={{ padding: 2 }}>
                                    <Box sx={{ height: 150, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, overflow: 'hidden' }}>
                                        <img src={item.coverImage} alt='Ảnh sách ở đây' style={{
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain'
                                        }} />
                                    </Box>
                                    <Typography variant="body1">{item.title}</Typography>
                                    <Typography variant="body1">Xuất bản năm: {item.publicationYear}</Typography>
                                    {item.ageLimit === 0 ? (
                                        <Typography variant="body1">Giới hạn tuổi: Không giới</Typography>
                                    ) : (
                                        <Typography variant="body1">Giới hạn tuổi: {item.ageLimit}</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 600,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                    }}
                >

                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                        <Typography id="modal-title" variant="h6" component="h2">
                            Thêm sách xin bản quyền
                        </Typography>

                        <TextField
                            label="Tìm kiếm sách"
                            variant="outlined"
                            fullWidth
                            sx={{ mt: 2, mb: 2 }}
                            value={searchBook}
                            onChange={(e) => setSearchBook(e.target.value)}
                        />
                        <Box sx={{ mt: 2 }}>
                            {filteredBooks.map((book, index) => (
                                <Box display="flex" alignItems="center" sx={{ mb: 1 }} key={`${book.id}-${index}`}>
                                    <Checkbox checked={selectedBookIds.includes(book.id)}
                                        onChange={() => handleSelectBook(book.id)} />
                                    <Typography variant="body1">{book.title}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" sx={{ mt: 2 }}>
                        <Button onClick={handleClose} color="error" variant="contained">
                            Đóng
                        </Button>
                        <Button color="primary" variant="contained" onClick={handleAddBook}>
                            Chỉnh sửa
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    )
}

export default AddContractBooks