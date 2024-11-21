import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../UpdateBook/UpdateBook.scss";

const UpdateBook = () => {
  const { id } = useParams(); // Get the book ID from the route
  const navigate = useNavigate();
  const [book, setBook] = useState({
    title: '',
    originalTitle: '',
    description: '',
    publicationYear: '',
    coverImage: '',
    ageLimit: '',
    categoryIds: [],
    coverImageFile: null, // For file uploads
  });
  const accessToken = localStorage.getItem("authToken");
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Fetch categories
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
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch book details
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`https://160.25.80.100:7124/api/book/getbook/${id}`, {
          headers: {
           'Authorization': `Bearer ${accessToken}`,
          },
        });
        setBook(response.data.data); // Update state with book details
      } catch (error) {
        console.error("Error fetching book details:", error);
        setError(error.message);
      }
    };

    fetchBookDetails();
  }, [id]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a FormData object for the multipart/form-data request
    const formData = new FormData();
    formData.append('Id', id);
    formData.append('Title', book.title);
    formData.append('OriginalTitle', book.originalTitle);
    formData.append('Description', book.description);
    formData.append('PublicationYear', book.publicationYear);
    formData.append('CoverImage', book.coverImage);
    formData.append('AgeLimit', book.ageLimit);
    // formData.append('CategoryIds', JSON.stringify(book.categoryIds));
    if (book.categoryIds.length) {
        book.categoryIds.forEach((id) => formData.append('CategoryIds', id));
      }
    if (book.coverImageFile) {
      formData.append('coverImage', book.coverImageFile);
    }

    try {
      await axios.put(`https://160.25.80.100:7124/api/book/updatebook/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Book updated successfully!');
      navigate('/'); // Redirect to the book list page
    } catch (error) {
        console.error("Error updating book:", error.response?.data || error.message);
      setError('Failed to update the book. Please try again.');
    }
  };

  // Handle category selection
  const handleCategoryClick = () => {
    setIsCategoryDropdownOpen((prev) => !prev);
  };

  const handleCategorySelect = (category) => {
    setBook((prevData) => ({
      ...prevData,
      categoryIds: [...prevData.categoryIds, category.id], // Lưu ID danh mục vào mảng
      selectedCategory: category, // Lưu thông tin danh mục đã chọn
    }));
    setIsCategoryDropdownOpen(false); // Đóng dropdown sau khi chọn
  };



  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input
  const handleFileChange = (e) => {
    setBook((prev) => ({ ...prev, coverImageFile: e.target.files[0] }));
  };

  return (
    <div className="update-book-container">
      <h3>Update Book</h3>
      {/* {error && <p className="error">{error}</p>} */}
      <form className="update-book-form" onSubmit={handleSubmit}>
  <label>
    Title:
    <input
      type="text"
      name="title"
      value={book.title}
      onChange={handleChange}
      required
    />
  </label>
  <label>
    Original Title:
    <input
      type="text"
      name="originalTitle"
      value={book.originalTitle}
      onChange={handleChange}
    />
  </label>
  <label>
    Description:
    <textarea
      name="description"
      value={book.description}
      onChange={handleChange}
    />
  </label>
  <label>
    Publication Year:
    <input
      type="number"
      name="publicationYear"
      value={book.publicationYear}
      onChange={handleChange}
    />
  </label>
  <label>
    Cover Image URL:
    <input
      type="text"
      name="coverImage"
      value={book.coverImage}
      onChange={handleChange}
    />
  </label>
  <label>
    Age Limit:
    <input
      type="number"
      name="ageLimit"
      value={book.ageLimit}
      onChange={handleChange}
    />
  </label>
  <div className="category-dropdown"> 
        <label>Category</label>
        <div className="dropdown-selected" onClick={handleCategoryClick}>
          {book.selectedCategory ? book.selectedCategory.name : 'Select Category'}
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

  <label>
    Upload New Cover Image:
    <input type="file" onChange={handleFileChange} />
  </label>
  <button type="submit">Update Book</button>
</form>

    </div>
  );
};

export default UpdateBook;
