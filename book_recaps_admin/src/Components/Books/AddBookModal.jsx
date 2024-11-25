import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
} from '@mui/material';
import api from '../Auth/AxiosInterceptors';

const AddBookModal = ({ isOpen, onClose, onBookAdded}) => {
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        Title: '',
        OriginalTitle: '',
        Description: '',
        PublicationYear: '',
        CoverImage: null,
        AgeLimit: '',
        AuthorId: '',
        AuthorName: '',
        AuthorImage: null,
        AuthorDescription: '',
        CategoryIds: [],
    });

    const validateForm = () => {
        const errors = {};
        const stringFields = ['Title', 'OriginalTitle', 'Description', 'AuthorName', 'AuthorDescription'];

        stringFields.forEach(field => {
            if (!/^[A-Z]/.test(formData[field])) {
                errors[field] = `${field} nên bắt đầu bằng chữ in hoa.`;
            }
        });

        const currentYear = new Date().getFullYear();
        if (!/^\d+$/.test(formData.PublicationYear) || formData.PublicationYear < 1000 || formData.PublicationYear > currentYear) {
            errors.PublicationYear = `Publication Year là năm hợp lệ từ 1000 đến ${currentYear}.`;
        }

        if (!/^\d+$/.test(formData.AgeLimit)) {
            errors.AgeLimit = 'Age Limit là chữ số.';
        }

        return errors;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'AuthorId') {
            const selectedAuthor = authors.find(author => author.id === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                AuthorName: selectedAuthor ? selectedAuthor.name : '',
            }));
        } else if (name === 'CategoryIds') {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleFileChange = (e) => {
        const { name } = e.target;
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, [name]: file }));
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
            for (const key in formData) {
                if (key === "CategoryIds") {
                    formData[key].forEach((id) => formDataToSend.append(key, id));
                } else {
                    formDataToSend.append(key, formData[key]);
                }                
            }
            await api.post('/api/book/createbook', formDataToSend);
            onBookAdded();
            onClose();
        } catch (error) {
            console.error('Error adding book', error);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Thêm mới cuốn sách</DialogTitle>
            <DialogContent>
                <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
                    {[
                        { name: 'Title', label: 'Tên sách' },
                        { name: 'OriginalTitle', label: 'Tên gốc' },
                        { name: 'Description', label: 'Mô tả', multiline: true, rows: 4 },
                        { name: 'PublicationYear', label: 'Năm xuất bản' },
                        { name: 'AgeLimit', label: 'Độ tuổi' },
                        { name: 'AuthorName', label: 'Tên tác giả' },
                        { name: 'AuthorDescription', label: 'Mô tả tác giả' },
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
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Tác giả</InputLabel>
                        <Select
                            name="AuthorId"
                            value={formData.AuthorId}
                            onChange={handleInputChange}
                            error={!!errors.AuthorId}
                        >
                            {authors.map(author => (
                                <MenuItem key={author.id} value={author.id}>
                                    {author.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Thể loại</InputLabel>
                        <Select
                            multiple
                            name="CategoryIds"
                            value={formData.CategoryIds}
                            onChange={(e) => handleInputChange({ target: { name: 'CategoryIds', value: e.target.value } })}
                            renderValue={selected =>
                                selected.map(id => categories.find(category => category.id === id)?.name).join(', ')
                            }
                        >
                            {categories.map(category => (
                                <MenuItem key={category.id} value={category.id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button variant="contained" component="label" sx={{ mt: 2 }}>
                        Chọn ảnh bìa sách
                        <input type="file" name="CoverImage" hidden onChange={handleFileChange} />
                    </Button>
                    <Button variant="contained" component="label" sx={{ mt: 2, ml: 2 }}>
                        Chọn ảnh tác giả
                        <input type="file" name="AuthorImage" hidden onChange={handleFileChange} />
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Lưu
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddBookModal;
