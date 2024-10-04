import React, { useEffect, useState } from 'react';
import './BookApiCategory.scss';

const BookApiCategory = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('https://160.25.80.100:7124/api/category', {
      method: 'GET',
      headers: {
        'accept': '*/*',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMTQ5ZWE4YS02MjE5LTQ2MzQtOWViOC00MzAyYjllNDhkN2MiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTI1LjIzNS4yMzguMTgxIiwiaW1hZ2VfdXJsIjoiRmlsZXMvSW1hZ2UvanBnL2FkLmpwZyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNvbnRyaWJ1dG9yIiwiZXhwIjoxNzI4MDM3NDQyLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTI0IiwiYXVkIjoiYm9va3JlY2FwIn0.2pxH0Wl60kyv6b2iIB16ky1EuZbyt5oMfKV0c9WkWDg',
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.succeeded) {
          setCategories(data.data.$values);
        }
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }, []);

  return (
    <div className="category-wrapper">
      {categories.map((category) => (
        <div key={category.id} className="category-box">
          <img 
            src={`https://example.com/icons/${category.name.toLowerCase().replace(/\s+/g, '-')}.png`} 
            alt={category.name} 
            className="category-image" 
          />
          <p className="category-label">{category.name}</p>
        </div>
      ))}
    </div>
  );
};

export default BookApiCategory;
