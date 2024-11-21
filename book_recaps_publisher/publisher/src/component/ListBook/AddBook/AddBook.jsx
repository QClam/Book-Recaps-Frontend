import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddBook.scss'; // Import the SCSS file

const AddBook = () => {
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [bookData, setBookData] = useState({
    title: '',
    originalTitle: '',
    description: '',
    publicationYear: '',
    coverImage: '',
    ageLimit: '',
    authorId: '',
    authorName: '',
    authorImage: '',
    authorDescription: '',
    publisherId: 'f85671a5-390a-4866-8261-1324cccb7514',
    categoryIds: [],
    coverImageFile: null,
    authorImageFile: null,
  });
  const [notification, setNotification] = useState('');

  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isAuthorDropdownOpen, setIsAuthorDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://160.25.80.100:7124/api/category/getallcategory', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        setCategories(response.data.data.$values);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchAuthors = async () => {
      try {
        const response = await axios.get('https://160.25.80.100:7124/api/authors/getallauthors', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        setAuthors(response.data.data.$values); // Lưu danh sách tác giả
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchCategories();
    fetchAuthors();
  }, [accessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setBookData((prevData) => ({ ...prevData, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Thêm dữ liệu vào FormData theo yêu cầu của API
    if (bookData.title) formData.append('Title', bookData.title);
    if (bookData.originalTitle) formData.append('OriginalTitle', bookData.originalTitle);
    if (bookData.description) formData.append('Description', bookData.description);
    if (bookData.publicationYear) formData.append('PublicationYear', parseInt(bookData.publicationYear));
    if (bookData.coverImage) formData.append('CoverImage', bookData.coverImage);
    if (bookData.ageLimit) formData.append('AgeLimit', parseInt(bookData.ageLimit));
    if (bookData.authorId) formData.append('AuthorId', bookData.authorId);
    if (bookData.publisherId) formData.append('PublisherId', bookData.publisherId);
    if (bookData.categoryIds.length) {
        bookData.categoryIds.forEach((id) => formData.append('CategoryIds', id));
      }
      
    // Thêm tệp ảnh vào FormData
    if (bookData.coverImageFile) formData.append('coverImage', bookData.coverImageFile);
    if (bookData.authorImageFile) formData.append('authorImage', bookData.authorImageFile);

    try {
        const response = await axios.post('https://160.25.80.100:7124/api/book/createbook', formData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        alert(`Book created successfully!`); 
        // console.log('Book created successfully:', response.data);
    } catch (error) {
        console.error('Error response:', error.response.data);
      alert(`Error creating book`);
      // alert(`Error creating book: ${JSON.stringify(error.response.data)}`);
        if (error.response && error.response.status === 401) {
            await handleTokenRefresh();
            handleSubmit(e);
        } else {
            console.error('Error creating book:', error);
        }
    }
};

  const handleCategoryClick = () => {
    setIsCategoryDropdownOpen((prev) => !prev);
  };

  const handleCategorySelect = (category) => {
    setBookData((prevData) => ({
      ...prevData,
      categoryIds: [...prevData.categoryIds, category.id], // Lưu ID danh mục vào mảng
      selectedCategory: category, // Lưu thông tin danh mục đã chọn
    }));
    setIsCategoryDropdownOpen(false); // Đóng dropdown sau khi chọn
  };

  const handleAuthorClick = () => {
    setIsAuthorDropdownOpen((prev) => !prev);
  };

  const handleAuthorSelect = (author) => {
    setBookData((prevData) => ({
      ...prevData,
      authorId: author.id, // Lưu ID của tác giả đã chọn
      selectedAuthor: author, // Lưu thông tin tác giả đã chọn
    }));
    setIsAuthorDropdownOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="add-book-form">
      <h2>Add New Book</h2>
      <div className="form-group">
        <input name="title" placeholder="Title" value={bookData.title} onChange={handleChange} />
        <input name="originalTitle" placeholder="Original Title" value={bookData.originalTitle} onChange={handleChange} />
        <textarea name="description" placeholder="Description" value={bookData.description} onChange={handleChange} />
        <input name="publicationYear" placeholder="Publication Year" value={bookData.publicationYear} onChange={handleChange} />
        <input name="coverImage" placeholder="Cover Image URL" value={bookData.coverImage} onChange={handleChange} />
        <input name="ageLimit" placeholder="Age Limit" value={bookData.ageLimit} onChange={handleChange} />

        <div className="author-dropdown"> 
        <label>Author</label>
        <div className="dropdown-selected" onClick={handleAuthorClick}>
          {bookData.selectedAuthor ? bookData.selectedAuthor.name : 'Select Author'}
        </div>
        {isAuthorDropdownOpen && (
          <div className="dropdown-options">
            {authors.map((author) => (
              <div
                key={author.id}
                className="dropdown-option"
                onClick={() => handleAuthorSelect(author)}
              >
                {author.name}
              </div>
            ))}
          </div>
        )}
      </div>

        
        <div className="category-dropdown"> 
        <label>Category</label>
        <div className="dropdown-selected" onClick={handleCategoryClick}>
          {bookData.selectedCategory ? bookData.selectedCategory.name : 'Select Category'}
        </div>
        {isCategoryDropdownOpen && (
          <div className="dropdown-options">
            {categories.map((category) => (
              <div
                key={category.id}
                className="dropdown-option"
                onClick={() => handleCategorySelect(category)}
              >
                {category.name}
              </div>
            ))}
          </div>
        )}
      </div>


        <input type="file" name="coverImageFile" onChange={handleFileChange} className="file-input" />
        <input type="file" name="authorImageFile" onChange={handleFileChange} className="file-input" />
      </div>
      <div className="button-group">
        <button type="submit" className="save">Save</button>
       
        <button type="button" className="cancel">Cancel</button>
      </div>
      
          {notification && (
      <div className="notification">
        {notification}
      </div>
)}

    </form>
  );
};

export default AddBook;
