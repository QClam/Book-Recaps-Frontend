import React from 'react';
import '../Author/Authors.scss';
import JKRowling from "../../../image/jkrow.jpg";
import Chris from "../../../image/chris.jpg";
import Angelo from "../../../image/angelo.jpg";
import { useNavigate } from 'react-router-dom';
const Authors = () => {
  
    const navigate = useNavigate();
  
    const handleTopAuthorsClick = () => {
      navigate('/author-detail'); // Navigate to the AuthorDetail page
    };
  return (
    <div className="authors-container">
      <h1 className="authors-title">Authors</h1>
      <div className="authors-links">
        <a href="#">Top 250 Authors</a>
        <a href="#">Favorite Indie Authors</a>
        <a href="#">Under 30</a>
        <a href="#">Epic Authors</a>
        <a href="#">Booker Prize Winners</a>
      </div>
      <div className="authors-cards">
      <div className="author-card top-authors" onClick={handleTopAuthorsClick}>
          <h2>
            Top Authors
            <img src={JKRowling} alt="Top Author" />
          </h2>
          <p>Read their side of the story</p>
        </div>
        <div className="author-card female-authors">
          <h2>
            Female Authors
            <img src={Chris} alt="Female Author" />
          </h2>
          <p>Most influential women in history</p>
        </div>
        <div className="author-card greek-originals">
          <h2>
            Greek Originals
            <img src= {Angelo} alt="Greek Originals" />
          </h2>
          <p>Learn from the masters</p>
        </div>
      </div>
    </div>
  );
};

export default Authors;
