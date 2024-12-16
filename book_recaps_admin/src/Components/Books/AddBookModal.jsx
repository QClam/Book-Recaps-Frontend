import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControl,
    Autocomplete,
    CircularProgress,
    Tooltip,
} from '@mui/material';
import api from '../Auth/AxiosInterceptors';
import TestGetAvaliableBook from './TestGetAvaliableBook';

const AddBookModal = ({ isOpen, onClose, onBookAdded }) => {
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [previewBookImage, setPreviewBookImage] = useState(null);
    const [previewAuthorImage, setPreviewAuthorImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        Title: '',
        OriginalTitle: '',
        ISBN_13: '',
        ISBN_10: '',
        Description: '',
        PublicationYear: '',
        CoverImage: null,
        AgeLimit: 0,
        Authors: [], // Multiple authors
        CategoryIds: [], // Multiple categories
        coverImage: '', // Cover image file
        authorImages: [], // Author images file(s)
    });

    const handleBookSelect = (book) => {
        if (book) {
            setFormData(prev => ({
                ...prev,
                Title: book.title || '',
                ISBN_13: book.isbn13 || '',
                ISBN_10: book.isbn10 || '',
                Description: book.description || '',
                PublicationYear: book.publishedDate || '',
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        const stringFields = ['Title', 'OriginalTitle'];
        stringFields.forEach(field => {
            if (!/^[A-Z]/.test(formData[field])) {
                errors[field] = `Tiêu đề hoặc Tiêu đề gốc phải bắt đầu bằng chữ viết hoa.`;
            }
        });

        const currentYear = new Date().getFullYear();
        if (!/^\d+$/.test(formData.PublicationYear) || formData.PublicationYear <= 1000 || formData.PublicationYear > currentYear) {
            errors.PublicationYear = `Năm xuất bản phải từ năm 1000 đến năm ${currentYear}.`;
        }

        if (!/^\d+$/.test(formData.AgeLimit)) {
            errors.AgeLimit = 'Giới hạn tuổi phải là số.';
        }

        if (formData.Authors.length === 0) {
            errors.Authors = 'Hãy chọn ít nhất một tác giả.';
        }

        if (formData.CategoryIds.length === 0) {
            errors.CategoryIds = 'Hãy chọn ít nhất một thể loại.';
        }

        return errors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'Authors') {
            // Tìm tác giả từ danh sách tác giả đã fetch và lưu đối tượng tác giả vào formData
            const selectedAuthors = value.map(id => authors.find(author => author.id === id));
            setFormData(prev => ({
                ...prev,
                Authors: selectedAuthors, // Lưu các đối tượng tác giả
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;

        if (name === 'coverImage' && files[0]) {
            setPreviewBookImage(URL.createObjectURL(files[0]));
        } else if (name === 'authorImages' && files.length > 0) {
            const imageURLs = Array.from(files).map((file) => URL.createObjectURL(file));
            // Nối ảnh mới vào danh sách hiện có
            setPreviewAuthorImage((prev) => [...(prev || []), ...imageURLs]);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: name === 'authorImages'
                ? [...(prev[name] || []), ...files] // Nối file mới vào danh sách hiện có
                : files[0],
        }));
        console.log("Form: ", formData);

    };


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/category/getallcategory');
                setCategories(response.data.data.$values || []);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        const fetchAuthors = async () => {
            try {
                const response = await api.get('/api/authors/getallauthors');
                setAuthors(response.data.data.$values || []);
            } catch (error) {
                console.error('Error fetching authors:', error);
            }
        };

        fetchCategories();
        fetchAuthors();
    }, []);

    const handleSubmit = async () => {

        setLoading(true);

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setLoading(false);
            return;
        }

        try {
            const formDataToSend = new FormData();

            // Thêm các trường thông thường vào form-data
            for (const key in formData) {
                if (key === 'Authors') continue; // Bỏ qua Authors
                if (Array.isArray(formData[key])) {
                    formData[key].forEach((value) => formDataToSend.append(key, value));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            }

            // Convert Authors thành chuỗi JSON
            formDataToSend.append('Authors', JSON.stringify(formData.Authors));

            // Gửi dữ liệu
            await api.post('/api/book/createbook', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            alert("Thêm sách thành công")
            setLoading(false);
            onBookAdded();
            onClose();
        } catch (error) {
            alert("Thêm sách thất bại")
            console.error('Error adding book:', error);
            console.log("Sách add: ", formData);

        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Add New Book</DialogTitle>
            <DialogContent>
                <TestGetAvaliableBook onSelectBook={handleBookSelect} />
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                    {[
                        { name: 'Title', label: 'Tiêu đề sách', tooltip: 'Tiêu đề sách bằng tiếng việt' },
                        { name: 'OriginalTitle', label: 'Tiêu đề gốc', tooltip: 'Tiêu đề sách bằng tiếng gốc. Ví dụ: Anh, Pháp,...' },
                        { name: 'ISBN_13', label: 'ISBN_13', tooltip: 'Mã ISBN_13 của cuốn sách' },
                        { name: 'ISBN_10', label: 'ISBN_10', tooltip: 'Mã ISBN_10 của cuốn sách' },
                        { name: 'Description', label: 'Mô tả', multiline: true, rows: 4, tooltip: 'Mô tả ngắn gọn nội dung sách.' },
                        { name: 'PublicationYear', label: 'Năm xuất bản', tooltip: 'Năm xuất bản sách. Lưu ý: Chỉ nhập năm, không nhập ngày và tháng. Sẽ có lúc Tự động điền sẽ điền cả ngày tháng năm, xin vui lòng xóa ngày và tháng nếu có.' },
                        { name: 'AgeLimit', type: 'number', label: 'Giới hạn tuổi', tooltip: 'Nhập độ tuổi tối thiểu phù hợp với nội dung sách.' },
                    ].map(field => (
                        <Tooltip key={field.name} title={field.tooltip || ''} placement="top" arrow>
                            <TextField
                                fullWidth
                                margin="normal"
                                label={field.label}
                                name={field.name}
                                type={field.type || 'text'}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                                error={!!errors[field.name]}
                                helperText={errors[field.name]}
                                multiline={field.multiline}
                                rows={field.rows}
                            />
                        </Tooltip>
                    ))}

                    {/* Multiple Author selection */}
                    <FormControl fullWidth margin="normal">

                        <Autocomplete
                            multiple
                            id="authors"
                            options={authors}
                            getOptionLabel={(option) => option.name} // Lấy tên tác giả để hiển thị
                            value={formData.Authors} // Giá trị đang chọn
                            freeSolo
                            onChange={(event, newValue) => {
                                let newValueString
                                const arrayValue = newValue.filter(v => {
                                    if (typeof v === 'string') {
                                        newValueString = v;
                                        return false;
                                    } return true;
                                })
                                if (!!newValueString) {
                                    setFormData(prev => ({
                                        ...prev,
                                        Authors: [...arrayValue, {
                                            id: null,
                                            name: newValueString,
                                            description: "Tác giả này chưa có mô tả",
                                            image: ""
                                        }],
                                    }))
                                } else {
                                    setFormData(prev => ({
                                        ...prev,
                                        Authors: arrayValue,
                                    }));
                                }
                                console.log("Authors: ", arrayValue);

                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Chọn tác giả" variant="outlined" />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </FormControl>
                    {errors.Authors && <p style={{ color: 'red' }}>{errors.Authors}</p>}

                    {/* Multiple Category selection */}
                    <FormControl fullWidth margin="normal">
                        <Autocomplete
                            multiple
                            id="categories"
                            options={categories}
                            getOptionLabel={(option) => option.name}
                            value={categories.filter((category) => formData.CategoryIds.includes(category.id))}
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    CategoryIds: newValue.map((category) => category.id),
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Chọn thể loại" variant="outlined" />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </FormControl>
                    {errors.CategoryIds && <p style={{ color: 'red' }}>{errors.CategoryIds}</p>}

                    {/* Hiển thị ảnh xem trước bìa sách */}
                    <Box display='flex' gap={2}>
                        {previewBookImage && (
                            <Box sx={{ mt: 2 }}>
                                <img src={previewBookImage} alt="Book Cover Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                            </Box>
                        )}

                        {previewAuthorImage && (
                            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {previewAuthorImage.map((src, index) => (
                                    <img key={index} src={src} alt={`Author ${index + 1}`} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '8px' }} />
                                ))}
                            </Box>
                        )}
                    </Box>
                    {/* File inputs */}
                    <Button variant="contained" component="label" sx={{ mt: 2 }} disabled={loading}>
                        Chọn ảnh bìa sách
                        <input type="file" name="coverImage" hidden onChange={handleFileChange} />
                    </Button>
                    <Button variant="contained" component="label" sx={{ mt: 2, ml: 2 }} disabled={loading}>
                        Chọn ảnh tác giả
                        <input type="file" name="authorImages" hidden onChange={handleFileChange} />
                    </Button>


                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color='error' disabled={loading}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
                    {loading ? <CircularProgress size={20} color='inherit' /> : "Thêm"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddBookModal;
