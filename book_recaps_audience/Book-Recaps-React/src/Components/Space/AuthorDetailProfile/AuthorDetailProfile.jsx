import React, { useState } from 'react';
import '../AuthorDetailProfile/AuthorDetailProfile.scss';

const AuthorDetailProfile = () => {
  const [activeTab, setActiveTab] = useState('Bio');

  // Hardcoded author data
  const author = {
    name: 'Stephen King',
    followers: 365200,
    yearOfBirth: 1947,
    age: 76,
    genres: ['Horror', 'Thriller', 'Science Fiction'],
    books: ['The Shining', 'It', 'Misery', 'The Stand'],
    lifeDescription: `Stephen King was two years old when his father left the family under the pretense of "going to buy a pack of cigarettes," leaving his mother to raise Stephen and his older brother alone. The family faced great financial hardship, moving frequently before settling in Maine, where King's mother cared for elderly relatives.`,
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="author-profile-container">
     <div className="author-header">
  <div className="author-image">
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/e/e3/Stephen_King%2C_Comicon.jpg"
      alt={author.name}
    />
  </div>
  <h2>{author.name}</h2>
  <div className="author-follow-details">
    <p className="followers-count">{author.followers.toLocaleString()} Followers</p>
    <button className="follow-button">Follow</button>
  </div>
</div>


      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'Bio' ? 'active' : ''}`}
          onClick={() => handleTabClick('Bio')}
        >
          Bio
        </button>
        <button
          className={`tab-button ${activeTab === 'Life' ? 'active' : ''}`}
          onClick={() => handleTabClick('Life')}
        >
          Life
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'Bio' ? (
          <div className="bio-section">
            <h3>About the Author</h3>
            <p><strong>Name:</strong> {author.name}</p>
            <p><strong>Year of Birth:</strong> {author.yearOfBirth}</p>
            <p><strong>Age:</strong> {author.age}</p>
            <p><strong>Genres:</strong> {author.genres.join(', ')}</p>
            <h3>Books by {author.name}</h3>
            <ul className="books-list">
              {author.books.map((book, index) => (
                <li key={index}>{book}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="life-section">
            <h3>Life of {author.name}</h3>
            <p>{author.lifeDescription}</p>
            <h3>Books by {author.name}</h3>
            <ul className="books-list">
              {author.books.map((book, index) => (
                <li key={index}>{book}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorDetailProfile;


// import React, { useState } from 'react';
// import PropTypes from 'prop-types';
// import '../AuthorDetailProfile/AuthorDetailProfile.scss';

// const AuthorDetailProfile = ({ author }) => {
//   const [activeTab, setActiveTab] = useState('Bio');

//   const handleTabClick = (tab) => {
//     setActiveTab(tab);
//   };

//   return (
//     <div className="author-profile-container">
//       <div className="author-header">
//         <div className="author-image">
//           <img src="https://via.placeholder.com/150" alt={author.name} />
//         </div>
//         <h2>{author.name}</h2>
//         <p>{author.followers.toLocaleString()} Followers</p>
//         <button className="follow-button">Follow</button>
//       </div>

//       <div className="tabs">
//         <button
//           className={`tab-button ${activeTab === 'Bio' ? 'active' : ''}`}
//           onClick={() => handleTabClick('Bio')}
//         >
//           Bio
//         </button>
//         <button
//           className={`tab-button ${activeTab === 'Life' ? 'active' : ''}`}
//           onClick={() => handleTabClick('Life')}
//         >
//           Life
//         </button>
//       </div>

//       <div className="tab-content">
//         {activeTab === 'Bio' ? (
//           <div className="bio-section">
//             <h3>About the Author</h3>
//             <p><strong>Name:</strong> {author.name}</p>
//             <p><strong>Year of Birth:</strong> {author.yearOfBirth}</p>
//             <p><strong>Age:</strong> {author.age}</p>
//             <p><strong>Genres:</strong> {author.genres.join(', ')}</p>
//             <h3>Books by {author.name}</h3>
//             <ul className="books-list">
//               {author.books.map((book, index) => (
//                 <li key={index}>{book}</li>
//               ))}
//             </ul>
//           </div>
//         ) : (
//           <div className="life-section">
//             <h3>Life of {author.name}</h3>
//             <p>{author.lifeDescription}</p>
//             <h3>Books by {author.name}</h3>
//             <ul className="books-list">
//               {author.books.map((book, index) => (
//                 <li key={index}>{book}</li>
//               ))}
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Add PropTypes validation
// AuthorDetailProfile.propTypes = {
//   author: PropTypes.shape({
//     name: PropTypes.string.isRequired,
//     followers: PropTypes.number.isRequired,
//     yearOfBirth: PropTypes.number.isRequired,
//     age: PropTypes.number.isRequired,
//     genres: PropTypes.arrayOf(PropTypes.string).isRequired,
//     books: PropTypes.arrayOf(PropTypes.string).isRequired,
//     lifeDescription: PropTypes.string,
//   }).isRequired,
// };

// export default AuthorDetailProfile;
