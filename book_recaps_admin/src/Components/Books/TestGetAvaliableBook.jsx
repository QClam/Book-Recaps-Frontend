import React, { useEffect, useState } from 'react';
import { TextField, Autocomplete, Box } from '@mui/material';
import api from '../Auth/AxiosInterceptors';

function TestGetAvaliableBook({ onSelectBook }) {
  const [avaliableBook, setAvaliableBook] = useState([]); // Danh sách sách
  const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm
  const [loading, setLoading] = useState(false); // Trạng thái loading

  // Gọi API để lấy danh sách sách dựa trên từ khóa tìm kiếm
  const getAvaliableBook = async (query) => {
    if (!query) {
      setAvaliableBook([]);
      return;
    }
    try {
      setLoading(true);
      const response = await api.get(`/api/book/info/${query}`);
      const books = response.data.items?.$values.map((item) => {
        const industryIdentifiers = item.volumeInfo.industryIdentifiers?.$values || [];
        const isbn10 = industryIdentifiers.find((id) => id.type === "ISBN_10")?.identifier || 'Không có';
        const isbn13 = industryIdentifiers.find((id) => id.type === "ISBN_13")?.identifier || 'Không có';

        return {
          id: item.id,
          title: item.volumeInfo.title,
          authors: item.volumeInfo.authors?.$values.join(', ') || 'Không rõ tác giả',
          description: item.volumeInfo.description || 'Không có mô tả',
          publishedDate: item.volumeInfo.publishedDate || 'Không rõ ngày xuất bản',
          isbn10,
          isbn13,
        };
      }) || [];
      setAvaliableBook(books);
    } catch (error) {
      alert('Lỗi khi tìm sách');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sử dụng debounce để giảm số lần gọi API
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getAvaliableBook(searchQuery);
    }, 500); // Đợi 500ms sau khi người dùng ngừng nhập

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <Box marginTop={1}>
      <Autocomplete
        options={avaliableBook}
        getOptionLabel={(option) => `${option.title} - ${option.authors}`} // Hiển thị tiêu đề và tác giả
        onInputChange={(event, value) => setSearchQuery(value)} // Cập nhật từ khóa tìm kiếm
        onChange={(event, value) => onSelectBook(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tìm sách"
            variant="outlined"
            fullWidth
            placeholder="Nhập tên sách..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <span>Loading...</span> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            <div>
              <strong>{option.title}</strong>
              <br />
              <small>Tác giả: {option.authors}</small>
              <br />
              <small>ISBN-10: {option.isbn10}</small>
              <br />
              <small>ISBN-13: {option.isbn13}</small>
              <br />
              <small>Mô tả: {option.description.substring(0, 100)}...</small>
            </div>
          </li>
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id} // Đảm bảo so sánh chính xác
      />
    </Box>
  );
}

export default TestGetAvaliableBook;
