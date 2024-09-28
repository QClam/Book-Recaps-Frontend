import React, { useRef } from "react";

import {PlayCircle } from "@mui/icons-material";

import "../Pages/ForYou.scss";
import Books from "./Books";
import { Box, Grid, Typography } from "@mui/material";

function ForYou() {
  const scrollRef = useRef(null);

  const limitedBooks = Books.slice(0, 6);

  return (
    <div className="Content">
      <h2>Selected just for you</h2>

      <div className="selected-container">
        <div className="card-content">
          <div className="text-section">
            <h2>Mastering the Inner Game of Wealth</h2>
          </div>
          <div className="image-section">
            <img
              src="https://salt.tikicdn.com/ts/product/bb/70/7c/3b9968065b1fe106b15aba3533c336b4.jpg"
              alt="Secrets of the Millionaire Mind"
              className="book-cover"
            />
            <div className="book-details">
              <h3>Secrets of the Millionaire Mind</h3>
              <p>T. Harv Eker</p>
              <PlayCircle fontSize="large" /> 22m
            </div>
          </div>
        </div>
      </div>

      <div className="recommend-container">
        <h2>Recommended for you</h2>
        <p>We think you’ll like these</p>
        <Box display="flex" alignItems="center">
          <Grid
            container
            spacing={2}
            style={{ overflowX: "auto", flexWrap: "nowrap", scrollBehavior: "smooth" }}
          >
            {limitedBooks.map((book, index) => (
              <Grid item key={index}>
                <Box
                  sx={{
                    width: 150,
                    padding: 2,
                    backgroundColor: "#fff",
                    textAlign: "center",
                    maxHeight: 300
                  }}
                >
                  <img
                    src="https://via.placeholder.com/150"
                    alt={book.title}
                    className="book-cover"
                    style={{ width: "100%", borderRadius: "4px" }}
                  />
                  <Typography variant="h6" mt={1}>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {book.author}
                  </Typography>
                  {/* <Typography variant="body2">{book.description}</Typography> */}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </div>
      <div className="collection-container">
        <h2>Collections for you</h2>
        <p>Based on your past preferences</p>
        <Box display="flex" alignItems="center">
          <Grid
            container
            spacing={2}
            style={{ overflowX: "auto", flexWrap: "nowrap", scrollBehavior: "smooth" }}
          >
            {limitedBooks.map((book, index) => (
              <Grid item key={index}>
                <Box
                  sx={{
                    width: 150,
                    padding: 2,
                    backgroundColor: "#fff",
                    textAlign: "center",
                    maxHeight: 300
                  }}
                >
                  <img
                    src="https://via.placeholder.com/150"
                    alt={book.title}
                    className="book-cover"
                    style={{ width: "100%", borderRadius: "4px" }}
                  />
                  <Typography variant="h6" mt={1}>
                    {book.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {book.author}
                  </Typography>
                  {/* <Typography variant="body2">{book.description}</Typography> */}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </div>
    </div>
  );
}

export default ForYou;
