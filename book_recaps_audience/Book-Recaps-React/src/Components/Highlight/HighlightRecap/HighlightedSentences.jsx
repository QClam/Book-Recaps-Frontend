import React, { useEffect, useState } from 'react';

const HighlightedSentences = () => {
  const [highlightedSentences, setHighlightedSentences] = useState([]);

  useEffect(() => {
    // Lấy danh sách các câu đã highlight từ localStorage
    const storedSentences = JSON.parse(localStorage.getItem('highlightedSentences'));
    setHighlightedSentences(storedSentences || []);
  }, []);

  return (
    <div>
      <h2>Highlighted Sentences</h2>
      {highlightedSentences.length === 0 ? (
        <p>No sentences highlighted yet.</p>
      ) : (
        <ul>
          {highlightedSentences.map((sentence, index) => (
            <li key={index}>
              {sentence.content} {/* Hiển thị nội dung của câu */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HighlightedSentences;
