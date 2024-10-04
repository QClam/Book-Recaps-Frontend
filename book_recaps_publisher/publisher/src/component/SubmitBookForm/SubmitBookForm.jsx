import React, { useState } from 'react';
import './SubmitBookForm.scss';

const SubmitBookForm = () => {
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    description: '',
    genre: '',
    coverImage: null,
    contentFile: null,
    metadata: {
      publishDate: '',
      language: '',
    },
    copyrightDocument: null,
    complianceChecked: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookData({
      ...bookData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setBookData({
      ...bookData,
      [name]: files[0],
    });
  };

  const handleComplianceCheck = (e) => {
    setBookData({ ...bookData, complianceChecked: e.target.checked });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bookData.complianceChecked) {
      alert('Please agree to the content guidelines.');
      return;
    }
    // TODO: Logic to submit book data
    console.log(bookData);
  };

  return (
    <div className="submit-book-form">
      <h2>Submit Your Book for Approval</h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={bookData.title}
          onChange={handleChange}
          placeholder="Enter the title of the book"
          required
        />

        {/* Author */}
        <label>Author:</label>
        <input
          type="text"
          name="author"
          value={bookData.author}
          onChange={handleChange}
          placeholder="Enter the author's name"
          required
        />

        {/* Description */}
        <label>Description:</label>
        <textarea
          name="description"
          value={bookData.description}
          onChange={handleChange}
          placeholder="Provide a brief description of the book"
          required
        ></textarea>

        {/* Genre */}
        <label>Genre:</label>
        <input
          type="text"
          name="genre"
          value={bookData.genre}
          onChange={handleChange}
          placeholder="Specify the genre"
          required
        />

        {/* Cover Image */}
        <label>Cover Image:</label>
        <input
          type="file"
          name="coverImage"
          accept="image/*"
          onChange={handleFileChange}
          required
        />

        {/* Content File */}
        <label>Content File (PDF, ePub):</label>
        <input
          type="file"
          name="contentFile"
          accept=".pdf,.epub"
          onChange={handleFileChange}
          required
        />

        {/* Metadata */}
        <h4>Metadata</h4>
        <label>Publish Date:</label>
        <input
          type="date"
          name="publishDate"
          value={bookData.metadata.publishDate}
          onChange={(e) =>
            setBookData({
              ...bookData,
              metadata: { ...bookData.metadata, publishDate: e.target.value },
            })
          }
          required
        />

        <label>Language:</label>
        <input
          type="text"
          name="language"
          value={bookData.metadata.language}
          onChange={(e) =>
            setBookData({
              ...bookData,
              metadata: { ...bookData.metadata, language: e.target.value },
            })
          }
          required
        />

        {/* Copyright Document */}
        <label>Upload Copyright Document:</label>
        <input
          type="file"
          name="copyrightDocument"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          required
        />

        {/* Content Guidelines */}
        <div className="compliance-check">
          <input
            type="checkbox"
            checked={bookData.complianceChecked}
            onChange={handleComplianceCheck}
            required
          />
          <span>I have read and agree to the content guidelines</span>
        </div>

        {/* Submit Button */}
        <button type="submit">Submit Book</button>
      </form>
    </div>
  );
};

export default SubmitBookForm;
