import React, { useState } from "react";
import axios from "axios";
import { Search } from "@mui/icons-material";
import { Input } from "@mui/material";

function Header() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);

  const fetchData = (value) => {
    axios
      .get(
        `https://www.googleapis.com/books/v1/volumes?q=${value}&key=AIzaSyB2so12nLWU0PHbITbm65e2HXPKs52ua_c`
      )
      .then((response) => {
        const filteredResults = response.data.items.filter((item) =>
          item.volumeInfo.title.toLowerCase().includes(value.toLowerCase())
        );
        setResults(filteredResults);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  const handleChange = (value) => {
    setInput(value);
    if (value) {
      fetchData(value);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="search-bar">
      <div className="input-wrapper">
        <Input
          placeholder="Which book do you need?"
          value={input}
          onChange={(e) => handleChange(e.target.value)}
        />
        <Search />
      </div>
      {/* Render Search Result */}
      {input && (
        <div className="search-results">
          {results.length > 0 ? (
            results.map((book, index) => (
              <div key={index} className="item-results">
                <h3>{book.volumeInfo.title}</h3>
                <p>
                  <strong>Author(s):</strong>{" "}
                  {book.volumeInfo.authors?.join(", ")}
                </p>
                <p>
                  <strong>Published Date:</strong>{" "}
                  {book.volumeInfo.publishedDate}
                </p>
                <hr style={{border: "1px solid #ddd"}}/>
              </div>
            ))
          ) : (
            <p>No result found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Header;
