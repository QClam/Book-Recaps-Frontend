// src/components/AuthorGeners/AuthorGeners.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthorGeners.scss';
import Crime from "../../../image/crime.jpg";
import Mystery from "../../../image/mystery.jpg";
import Love from "../../../image/love.jpg";
import Novel from "../../../image/crime.jpg";
import Science from "../../../image/mystery.jpg";
import Thriller from "../../../image/love.jpg";

const AuthorGeners = () => {
  const navigate = useNavigate();
  
  const handleGenreClick = (genre) => {
    navigate(`/authors/${genre}`);
  };

  return (
    <div className="genres-container">
      <h1 className="genres-title">Authors by Genres</h1>
      <div className="genres-cards">
        <div className="genre-card" style={{ backgroundImage: `url(${Crime})` }} onClick={() => handleGenreClick('Crime')}>
          <div className="overlay">
            <h2>Crime</h2>
            <p>340 Authors</p>
          </div>
        </div>
        <div className="genre-card" style={{ backgroundImage: `url(${Love})` }} onClick={() => handleGenreClick('Love')}>
          <div className="overlay">
            <h2>Love</h2>
            <p>641 Authors</p>
          </div>
        </div>
        <div className="genre-card" style={{ backgroundImage: `url(${Mystery})` }} onClick={() => handleGenreClick('Mystery')}>
          <div className="overlay">
            <h2>Mystery</h2>
            <p>1,505 Authors</p>
          </div>
        </div>
        <div className="genre-card" style={{ backgroundImage: `url(${Novel})` }} onClick={() => handleGenreClick('Novel')}>
          <div className="overlay">
            <h2>Novel</h2>
            <p>1,200 Authors</p>
          </div>
        </div>
        <div className="genre-card" style={{ backgroundImage: `url(${Science})` }} onClick={() => handleGenreClick('Science')}>
          <div className="overlay">
            <h2>Science</h2>
            <p>850 Authors</p>
          </div>
        </div>
        <div className="genre-card" style={{ backgroundImage: `url(${Thriller})` }} onClick={() => handleGenreClick('Thriller')}>
          <div className="overlay">
            <h2>Thriller</h2>
            <p>980 Authors</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorGeners;
