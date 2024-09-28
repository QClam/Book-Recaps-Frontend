import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './AuthorGenersDetail.scss';
import Crime from "../../../image/crime.jpg";
const AuthorGenersDetail = () => {
  const { genre } = useParams(); // Get genre from URL parameters
  const [searchTerm, setSearchTerm] = useState('');

  // Data with more variety
  const authors = {
    Crime: [
      "Agatha Christie", "Arthur Conan Doyle", "James Patterson", 
      "John Grisham", "Lee Child", "Michael Connelly", 
      "Dashiell Hammett", "Raymond Chandler", "Ed McBain", 
      "Patricia Highsmith", "Gillian Flynn", "Harlan Coben"
    ],
    Love: [
      "Jane Austen", "Nicholas Sparks", "E.L. James", 
      "Emily Brontë", "Charlotte Brontë", "Jojo Moyes", 
      "Debbie Macomber", "Julia Quinn", "Sarah Jio", 
      "Liane Moriarty", "Helen Fielding", "Meg Cabot"
    ],
    Mystery: [
      "Edgar Allan Poe", "Gillian Flynn", "Dan Brown", 
      "Agatha Christie", "Arthur Conan Doyle", "Wilkie Collins", 
      "Daphne du Maurier", "P.D. James", "Elizabeth George", 
      "Sue Grafton", "Harlan Coben", "James Lee Burke"
    ],
    Novel: [
      "George Orwell", "J.K. Rowling", "Harper Lee", 
      "F. Scott Fitzgerald", "Ernest Hemingway", "Mark Twain", 
      "John Steinbeck", "Toni Morrison", "Kurt Vonnegut", 
      "Gabriel Garcia Marquez", "Leo Tolstoy", "Jane Austen"
    ],
    Science: [
      "Carl Sagan", "Stephen Hawking", "Richard Dawkins", 
      "Neil deGrasse Tyson", "Jared Diamond", "Bill Bryson", 
      "Jane Goodall", "Stephen Jay Gould", "Daniel Kahneman", 
      "Michio Kaku", "Brian Greene", "Isaac Asimov"
    ],
    Thriller: [
      "Stephen King", "Lee Child", "Michael Connelly", 
      "John Grisham", "James Patterson", "Harlan Coben", 
      "Robert Ludlum", "Gillian Flynn", "Patricia Highsmith", 
      "Lisa Gardner", "David Baldacci", "Karin Slaughter"
    ]
  };

  const genreDescriptions = {
    Crime: "Explore the gripping world of crime fiction with authors who craft intense mysteries and thrilling tales.",
    Love: "Discover heartwarming and romantic stories from some of the most beloved authors in the genre.",
    Mystery: "Delve into intricate plots and unravel mysteries with renowned authors in the mystery genre.",
    Novel: "Enjoy a wide range of novels, from classic literature to contemporary fiction, by acclaimed authors.",
    Science: "Learn from brilliant minds in science and technology, who make complex topics accessible and engaging.",
    Thriller: "Get your adrenaline pumping with thrilling novels and edge-of-your-seat stories by top thriller writers."
  };

  const genreImages = {
    Crime: {Crime},
    Love: '/path/to/love-image.jpg',
    Mystery: '/path/to/mystery-image.jpg',
    Novel: '/path/to/novel-image.jpg',
    Science: '/path/to/science-image.jpg',
    Thriller: '/path/to/thriller-image.jpg'
  };

  // Filter authors based on search term
  const filteredAuthors = authors[genre]?.filter(author => 
    author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="authors-detail-container">
      <Link to="/" className="back-button">Back to Home</Link>
      <h1 className="genre-title">{genre ? genre : 'Genre'} Authors</h1>
      <div className="genre-info">
        <img 
          src={genreImages[genre] || '/path/to/default-image.jpg'} 
          alt={`${genre} genre`} 
          className="genre-image"
        />
        <p className="genre-description">
          {genreDescriptions[genre] || 'No description available for this genre.'}
        </p>
      </div>
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search authors..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="search-input"
        />
      </div>
      <ul className="authors-list">
        {filteredAuthors ? (
          filteredAuthors.length > 0 ? (
            filteredAuthors.map((author, index) => (
              <li key={index} className="author-item">
                {author}
              </li>
            ))
          ) : (
            <p>No authors found matching your search criteria.</p>
          )
        ) : (
          <p>No data available for this genre.</p>
        )}
      </ul>
    </div>
  );
};

export default AuthorGenersDetail;
