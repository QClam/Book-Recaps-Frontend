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
} from '@mui/material';
import api from '../Auth/AxiosInterceptors';
import TestGetAvaliableBook from './TestGetAvaliableBook';

const AddBookModal = ({ isOpen, onClose, onBookAdded }) => {
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

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
                PublicationYear: book.publishedDate || '', // Chỉ lấy năm nếu có ngày
            }));
        }
    };

    const validateForm = () => {
        const errors = {};

        const stringFields = ['Title', 'OriginalTitle'];
        stringFields.forEach(field => {
            if (!/^[A-Z]/.test(formData[field])) {
                errors[field] = `${field} should start with an uppercase letter.`;
            }
        });

        const currentYear = new Date().getFullYear();
        if (!/^\d+$/.test(formData.PublicationYear) || formData.PublicationYear < 1000 || formData.PublicationYear > currentYear) {
            errors.PublicationYear = `Publication Year must be a valid year between 1000 and ${currentYear}.`;
        }

        if (!/^\d+$/.test(formData.AgeLimit)) {
            errors.AgeLimit = 'Age Limit must be a number.';
        }

        if (formData.Authors.length === 0) {
            errors.Authors = 'Please select at least one author.';
        }

        if (formData.CategoryIds.length === 0) {
            errors.CategoryIds = 'Please select at least one category.';
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
        const { name } = e.target;
        const file = e.target.files[0];
        setFormData(prev => ({
            ...prev,
            [name]: file,
        }));
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

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
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
            onBookAdded();
            onClose();
        } catch (error) {
            alert("Thêm sách thất bại")           
            console.error('Error adding book:', error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Add New Book</DialogTitle>
            <DialogContent>
                <TestGetAvaliableBook onSelectBook={handleBookSelect} />
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                    {[
                        { name: 'Title', label: 'Tiêu đề sách' },
                        { name: 'OriginalTitle', label: 'Tiêu đề gốc' },
                        { name: 'ISBN_13', label: 'ISBN_13' },
                        { name: 'ISBN_10', label: 'ISBN_10' },
                        { name: 'Description', label: 'Mô tả', multiline: true, rows: 4 },
                        { name: 'PublicationYear', label: 'Năm xuất bản' },
                        { name: 'AgeLimit', label: 'Giới hạn tuổi' },
                    ].map(field => (
                        <TextField
                            key={field.name}
                            fullWidth
                            margin="normal"
                            label={field.label}
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            error={!!errors[field.name]}
                            helperText={errors[field.name]}
                            multiline={field.multiline}
                            rows={field.rows}
                        />
                    ))}

                    {/* Multiple Author selection */}
                    <FormControl fullWidth margin="normal">

                        <Autocomplete
                            multiple
                            id="authors"
                            options={authors}
                            getOptionLabel={(option) => option.name} // Lấy tên tác giả để hiển thị
                            value={formData.Authors} // Giá trị đang chọn
                            onChange={(event, newValue) => {
                                setFormData(prev => ({
                                    ...prev,
                                    Authors: newValue,
                                }));
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Select Authors" variant="outlined" />
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
                                <TextField {...params} label="Select Categories" variant="outlined" />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                    </FormControl>
                    {errors.CategoryIds && <p style={{ color: 'red' }}>{errors.CategoryIds}</p>}

                    {/* File inputs */}
                    <Button variant="contained" component="label" sx={{ mt: 2 }}>
                        Chọn ảnh bìa sách
                        <input type="file" name="coverImage" hidden onChange={handleFileChange} />
                    </Button>
                    <Button variant="contained" component="label" sx={{ mt: 2, ml: 2 }}>
                        Chọn ảnh tác giả
                        <input type="file" name="authorImages" hidden onChange={handleFileChange} />
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color='error'>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Thêm
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddBookModal;
