import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import '../SearchResults/SearchResults.scss';

const BookFilters = ({ query }) => {
  const [showMoreLanguage, setShowMoreLanguage] = useState(false); // State to toggle "Show More"
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [ratingOpen, setRatingOpen] = useState(true);
  const [genreOpen, setGenreOpen] = useState(true);
  const [languageOpen, setLanguageOpen] = useState(true);
  const [ageOpen, setAgeOpen] = useState(true);
  const [books, setBooks] = useState([]);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc`
      );
      setBooks(response.data.items || []); // Lưu trữ danh sách sách
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Fetch dữ liệu khi component được mount hoặc khi query thay đổi
  useEffect(() => {
    fetchBooks();
  }, [query]);

  const toggleShowMore = () => {
    setShowMoreLanguage(!showMoreLanguage);
  };

  const toggleCategory = () => {
    setCategoryOpen(!categoryOpen);
  };

  const toggleRating = () => {
    setRatingOpen(!ratingOpen);
  };

  const toggleGenre = () => {
    setGenreOpen(!genreOpen);
  };

  const toggleLanguage = () => {
    setLanguageOpen(!languageOpen);
  };

  const toggleAge = () => {
    setAgeOpen(!ageOpen);
  };

  return (
    <div className="container-layout">
      <div className="filter-section-layout">
        <div className="filter-category-box">
        <div className="filter-ca"> 
          <h3 onClick={toggleCategory}>
            Filter by Category {categoryOpen ? '▲' : '▼'}
          </h3>
          </div>
          {categoryOpen && (
            <>
              <label><input type="checkbox" /> Young adult (1172)</label>
              <label><input type="checkbox" /> Fiction (1086)</label>
              <label><input type="checkbox" /> Nonfiction (292)</label>
            </>
          )}
        </div>

        <div className="filter-rating-box">
          <h3 onClick={toggleRating}>
            Filter by Rating {ratingOpen ? '▲' : '▼'}
          </h3>
          {ratingOpen && (
            <>
              <label><input type="checkbox" /> High (778)</label>
              <label><input type="checkbox" /> Moderate (742)</label>
              <label><input type="checkbox" /> Mild (729)</label>
              <label><input type="checkbox" /> None (269)</label>
              <label><input type="checkbox" /> DIRT (29)</label>
            </>
          )}
        </div>

        <div className="filter-genre-box">
          <h3 onClick={toggleGenre}>
            Filter by Genre {genreOpen ? '▲' : '▼'}
          </h3>
          {genreOpen && (
            <>
              <label><input type="checkbox" /> Romance (789)</label>
              <label><input type="checkbox" /> Fantasy (622)</label>
              <label><input type="checkbox" /> Mystery (488)</label>
              <label><input type="checkbox" /> Historical Fiction (417)</label>
              <label><input type="checkbox" /> Thriller (281)</label>

              {/* Hidden labels - show if showMoreLanguage is true */}
              {showMoreLanguage && (
                <>
                  <label><input type="checkbox" /> Japanese (281)</label>
                  <label><input type="checkbox" /> Korean (789)</label>
                </>
              )}

              {/* Show More button */}
              <div className="show-more-box">
                <button onClick={toggleShowMore} className="show-more-button">
                  {showMoreLanguage ? 'Show Less' : 'Show More'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="filter-language-box">
          <h3 onClick={toggleLanguage}>
            Filter by Language {languageOpen ? '▲' : '▼'}
          </h3>
          {languageOpen && (
            <>
              <label><input type="checkbox" /> English (789)</label>
              <label><input type="checkbox" /> French (622)</label>
              <label><input type="checkbox" /> Portuguese (488)</label>
              <label><input type="checkbox" /> Spanish (417)</label>
              <label><input type="checkbox" /> German (281)</label>
              <label><input type="checkbox" /> Japanese (281)</label>
              <label><input type="checkbox" /> Korean (789)</label>
            </>
          )}
        </div>

        <div className="filter-age-box">
          <h3 onClick={toggleAge}>
            Filter by Age {ageOpen ? '▲' : '▼'}
          </h3>
          {ageOpen && (
            <>
              <label><input type="checkbox" /> 3 - 5 Years (789)</label>
              <label><input type="checkbox" /> 6 - 8 Years (281)</label>
              <label><input type="checkbox" /> 9 - 12 Years (417)</label>
              <label><input type="checkbox" /> Teens (488)</label>
            </>
          )}
        </div>

        <div className="clear-filters-box">
          <button className="clear-filters-button">Clear Filters</button>
        </div>
      </div>

      <div className="book-list-layout">
        {books.length > 0 ? (
          books.map((book) => {
            const { id, volumeInfo } = book;
            const { title, authors, imageLinks, categories } = volumeInfo;

            return (
              <div className="book-card-box" key={id}>
                <img
                  src={imageLinks ? imageLinks.thumbnail : 'default-book-cover.jpg'}
                  alt={title}
                />
                <div className="book-tags-box">
                  {categories && categories.map((category, index) => (
                    <span key={index}>{category}</span>
                  ))}
                </div>
                <h2>{title}</h2>
                <p>{authors ? `BY ${authors.join(', ')}` : 'No Author'}</p>
              </div>
            );
          })
        ) : (
          <p>No books found</p>
        )}
      </div>

    </div>
  );
};

export default BookFilters;
