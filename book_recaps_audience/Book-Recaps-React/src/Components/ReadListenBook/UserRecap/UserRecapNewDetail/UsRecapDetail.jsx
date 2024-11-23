import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./UsRecapDetail.scss";

const resolveRefs = (data) => {
  const refMap = new Map();
  const createRefMap = (obj) => {
    if (typeof obj !== "object" || obj === null) return;
    if (obj.$id) {
      refMap.set(obj.$id, obj);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        createRefMap(obj[key]);
      }
    }
  };
  const resolveRef = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    if (obj.$ref) {
      return refMap.get(obj.$ref);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = resolveRef(obj[key]);
      }
    }
    return obj;
  };
  createRefMap(data);
  return resolveRef(data);
};

const UserRecapDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const accessToken = localStorage.getItem("authToken");
  const navigate = useNavigate();
  const [contributors, setContributors] = useState([]);

  useEffect(() => {
    const fetchBookDetail = async () => {
      try {
        const response = await axios.get(
          `https://bookrecaps.cloud/api/book/getbookbyid/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const bookRecapNew = resolveRefs(response.data.data);
        setBook(bookRecapNew);

        if (bookRecapNew.recaps && bookRecapNew.recaps.$values.length > 0) {
          const contributorsData = await Promise.all(
            bookRecapNew.recaps.$values.map(async (recap) => {
              if (recap.userId) {
                const userResponse = await axios.get(
                  `https://bookrecaps.cloud/api/users/get-user-account-byID?userId=${recap.userId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                return {
                  recapId: recap.id,
                  contributor: userResponse.data.data,
                };
              }
              return null;
            })
          );
          setContributors(
            contributorsData.filter((data) => data !== null)
          );
        }
      } catch (error) {
        setError("Failed to fetch book details");
        console.error("Error fetching book details:", error);
      }
    };

    fetchBookDetail();
  }, [id, accessToken]);

  if (error) return <p>{error}</p>;
  if (!book) return <p>Loading...</p>;

  const handleRecapClick = (recapId) => {
    navigate(`/recap-item-detail/${recapId}`);
  };

  return (
    <div className="user-recap-detail-dtdt">
      <h2 className="book-title">{book.title}</h2>
      <img className="book-cover-cover" src={book.coverImage} alt={book.title}  style={{ marginLeft: '330px', alignItems:'center' }} />
      <p className="book-description">{book.description}</p>
      <p className="publication-year">Publication Year: {book.publicationYear}</p>
      <p className="author">
        Author(s):{" "}
        {book.authors && book.authors.$values.length > 0 && (
          <strong>{book.authors.$values[0].name}</strong>
        )}
      </p>
      <p className="publisher">
        Publisher: {book.publisher.publisherName}
      </p>
      <p className="categories">
        Categories:{" "}
        {book.categories && book.categories.$values.length > 0 && (
          <strong>{book.categories.$values[0].name}</strong>
        )}
      </p>

      <div className="recaps">
        <h2 className="recaps-title">Recaps</h2>
        {book.recaps && book.recaps.$values.length > 0 ? (
          book.recaps.$values
            .filter((recap) => recap.isPublished)
            .map((recap) => {
              const contributorData = contributors.find(
                (data) => data.recapId === recap.id
              );
              return (
                <div
                  className="recap-item-it"
                  key={recap.id}
                  onClick={() => handleRecapClick(recap.id)}
                >
                  <h2 className="recap-name">{recap.name}</h2>
                  {/* <p className="recap-published">
                    Published: {recap.isPublished ? "Yes" : "No"}
                  </p> */}
                  {recap.isPremium && (
                    <p className="recap-premium" style={{ color: 'orange', fontWeight: 'bold', fontSize: '17px' }}>
                      Premium
                    </p>
                  )}

                  {contributorData && contributorData.contributor && (
                    <div className="contributor">
                      <img
                        className="contributor-image"
                        src={`https://bookrecaps.cloud/${contributorData.contributor.imageUrl}`}
                        alt={contributorData.contributor.fullName}
                      />
                      <div>
                        <h5 className="contributor-name">
                          Contributor: {contributorData.contributor.fullName}
                        </h5>
                        <p className="contributor-gender">
                          Gender:{" "}
                          {contributorData.contributor.gender === 0
                            ? "Male"
                            : "Female"}
                        </p>
                        <p className="contributor-birth-date">
                          Birth Date: {contributorData.contributor.birthDate}
                        </p>
                      </div>
                    </div>
                  )}

                  {recap.isPublished &&
                    recap.recapVersions &&
                    recap.recapVersions.$values.length > 0 && (
                      <div className="recap-versions">
                        {recap.recapVersions.$values.map((version) => (
                          <p key={version.id}>
                            Version Name: {version.versionName}
                          </p>
                        ))}
                      </div>
                    )}
                </div>
              );
            })
        ) : (
          <p className="no-recaps">No recaps available for this book.</p>
        )}
      </div>
    </div>
  );
};

export default UserRecapDetail;
