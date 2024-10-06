import React, { useEffect, useState } from 'react';
import './AuthorApi.scss';

const AuthorApi = () => {
  const [authors, setAuthors] = useState([]);

  // Fetch data từ API
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch('https://160.25.80.100:7124/api/authors/getallauthors', {
          method: 'GET',
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NWRmM2ExZC04NWY5LTQ2MzMtYTAwZC01ZTg0MjFiZWI3ZTQiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTE2LjExMC40MS45MCIsImltYWdlX3VybCI6IkZpbGVzL0ltYWdlL2pwZy9hZC5qcGciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJDb250cmlidXRvciIsImV4cCI6MTcyODIyODA3NiwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzEyNCIsImF1ZCI6ImJvb2tyZWNhcCJ9.S6zTH1h6IdHOHndAtLhY7B_rVcnSBb1-Elqii75QX4Q`
          }
        });
        const data = await response.json();
        setAuthors(data.data.$values);
      } catch (error) {
        console.error('Error fetching authors:', error);
      }
    };

    fetchAuthors();
  }, []);

  return (
    <div className="author-page">
      <h1>Author</h1>
      <div className="author-grid">
        {authors.map((author) => (
          <div className="author-card" key={author.id}>
            <img src={author.image || 'https://via.placeholder.com/150'} alt={author.name} />
            <h3>{author.name}</h3>
            <p>{author.books?.$values?.[0]?.categories?.$values?.[0]?.name || 'Unknown Category'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuthorApi;
