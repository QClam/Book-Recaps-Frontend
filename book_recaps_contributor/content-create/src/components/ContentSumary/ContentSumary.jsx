import React from 'react';
import '../ContentSumary/ContentSumary.scss';

const ContentSumary = () => {
  return (
    <div className="content-container">
      <h2>Channel Content</h2>
      <div className="table-wrapper">
        <table className="content-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Video</th>
              <th>Visibility</th>
              <th>Restrictions</th>
              <th>Date</th>
              <th>Views</th>
              <th>Comments</th>
              <th>Likes vs Dislikes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {/* <td><input type="checkbox" /></td> */}
              <td>
                <div className="video-details">
                  <img className="video-thumbnail" src="path_to_thumbnail" alt="Play2" />
                  <div className="video-info">
                    <p className="video-title">Recaps2</p>
                    <span className="video-description">Add description</span>
                  </div>
                </div>
              </td>
              <td>Draft</td>
              <td>Copyright</td>
              <td>8 Apr 2024</td>
              <td>2</td>
              <td>0</td>
              <td>—</td>
              <td><button className="edit-btn">Edit Draft</button></td>
            </tr>
            {/* Các hàng khác */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContentSumary;
