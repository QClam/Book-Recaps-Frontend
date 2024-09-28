import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../AuthorDetail/AuthorDetail.scss'; 

const AuthorDetail = () => {
  const [authors, setAuthors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const query = "authors";
    const fetchAuthors = async () => {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&key=AIzaSyDoWf3ws8elORVULfG9eeb0McMql-NugGc`);
        const data = await response.json();
        const authorsList = data.items.map(item => ({
          name: item.volumeInfo.authors ? item.volumeInfo.authors[0] : 'Unknown Author',
          genres: item.volumeInfo.categories || ['Unknown Genre'],
          followers: Math.floor(Math.random() * 1000000),
          yearOfBirth: item.volumeInfo.publishedDate ? item.volumeInfo.publishedDate.split('-')[0] : 'Unknown Year',
          age: item.volumeInfo.publishedDate ? new Date().getFullYear() - parseInt(item.volumeInfo.publishedDate.split('-')[0], 10) : 'Unknown Age',
          books: item.volumeInfo.title ? [item.volumeInfo.title] : ['Unknown Book'],
          lifeDescription: item.volumeInfo.description || 'No description available.',
        }));
        setAuthors(authorsList);
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchAuthors();
  }, []);

  const handleAuthorClick = (author) => {
    navigate('/author-detail-profile', { state: { author } });
  };

  return (
    <div className="author-detail-container">
      {authors.map((author, index) => (
        <div key={index} className="author-card" onClick={() => handleAuthorClick(author)}>
          <div className="author-image">
            <img src="https://via.placeholder.com/150" alt={author.name} />
          </div>
          <div className="author-info">
            <h3>{author.name}</h3>
            <p>{author.followers.toLocaleString()} Followers</p>
            <div className="author-genres">
              {author.genres.slice(0, 3).map((genre, idx) => (
                <span key={idx} className="genre">{genre}</span>
              ))}
              {author.genres.length > 3 && <span className="more-genres">+ more</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthorDetail;
