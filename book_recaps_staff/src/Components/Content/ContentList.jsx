import React, { useState, useEffect } from 'react';
import axios from 'axios';
// import { sampleData } from './ContentItems';
import { Link } from 'react-router-dom';
import { Hourglass } from 'react-loader-spinner'

import './Content.scss';
import '../Loading.scss'

function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

function ContentList() {
  const [contentItems, setContentItems] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading as true

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://66eb9ee32b6cf2b89c5b1714.mockapi.io/ContentItems');
        setContentItems(response.data);
        console.log("Data: ", response.data);

      } catch (error) {
        console.log("Error fetching data, using sample data as fallback:", error);
        // setContentItems(sampleData); // Use sampleData as a fallback
      } finally {
        setLoading(false); // Ensure loading is set to false once done
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='loading'>
        <Hourglass
          visible={true}
          height="80"
          width="80"
          ariaLabel="hourglass-loading"
          wrapperStyle={{}}
          wrapperClass=""
          colors={['#306cce', '#72a1ed']}
        />
      </div>
    );
  }

  return (
    <div className="content-container">
      <div>
        <h2>Nội dung của Contributor</h2>
      </div>
      <div className="content-list">
        <table className="content-table">
          <thead>
            <tr>
              <th>Chủ đề</th>
              <th>Mô tả cuốn sách</th>
              <th>Ngày</th>
              <th>Duyệt nội dung</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {contentItems.map((val) => (
              <tr key={val.id}>
                <td>{val.title}</td>
                <td>{truncateText(val.description, 100)}</td>
                <td>{new Date(val.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="button" style={{ backgroundColor: "green" }}>
                  <Link to={`/review/content_version/${val.id}`} style={{color: "white"}}>
                    Duyệt
                  </Link>
                  </button>
                </td>
                <td>{val.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContentList;
