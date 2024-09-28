import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FeedbackContent = ({ version_number }) => {
  const [noteData, setNoteData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter note data based on version_number
  const filterData = noteData.filter(note => note.version_number === version_number);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://66ebd9352b6cf2b89c5c0bb9.mockapi.io/feedback");
        setNoteData(response.data);
        console.log("Fetched Data: ", response.data);
      } catch (error) {
        console.log("Error fetching data:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Note</h2>
      {filterData.length > 0 ? (
        <ul>
          {filterData.map(note => (
            <div key={note.version_number}>
              <h3>Version: {note.version_number}</h3>
              <ul>
                {note.comments.map(sentence => (
                  <li key={sentence.id}>
                    <strong>Câu: {sentence.sentence_index + 1}</strong> <br />
                    <strong>Nội dung câu: {sentence.target_text}</strong> <br />
                    <strong>Feedback: {sentence.feedback}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ul>
      ) : (
        <p>Hiện chưa có Feedback</p>
      )}
    </div>
  );
};

export default FeedbackContent;
