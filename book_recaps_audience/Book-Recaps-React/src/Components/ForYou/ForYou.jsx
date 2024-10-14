import React, { useRef } from "react";

import { PlayCircle } from "@mui/icons-material";

import "../ForYou/ForYou.scss";
import Books from "./Books";

function ForYou() {
  const limitedBooks = Books.slice(0, 6);

  return (
    <div className="for-you-content">
      <div className="selected-container">
        <h2>Selected just for you</h2>
        <div href="#" className="selected-card">
          <div className="selected-content">
            <div>
              Little Things That Can Change Your Life… And Maybe The World
            </div>
            <div className="card-content">
              <img src="https://salt.tikicdn.com/ts/product/bb/70/7c/3b9968065b1fe106b15aba3533c336b4.jpg" alt="Make your Bed" loading="lazy" className="image-section" />
              <div >
                <div style={{ marginBottom: "0.25rem", fontWeight: 700 }}>Make Your Bed</div>
                <div style={{ marginBottom: "1rem", fontWeight: 500, fontSize: "0.875rem", lineHeight: "1.25rem" }}>William H. McRaven</div>
                <div className="button-section">
                  <PlayCircle style={{ width: "2.5rem", height: "2.5rem" }} />
                  <div style={{ fontWeight: 700 }}>11m</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "3rem" }}>
        <div className="recommend-title">
          <div className="grow">
            <h3 style={{ marginBottom: "0.5rem", fontWeight: 700 }}>Recommended for you</h3>
            <p>We think you’ll like these</p>
          </div>
        </div>
        <div>
          <div className="recommend-card">
            <div className="recommend-list">
              {limitedBooks.map((book, index) => (
                <div className="recommend-item" key={index}>
                  <img src="https://images.blinkist.io/images/books/54e3d412303764000a820000/1_1/470.jpg" alt="Living the 80/20 Way" loading="lazy" class="recommend-image" />
                  <h3>{book.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      <div style={{ marginBottom: "3rem" }}>
        <div className="recommend-title">
          <div className="grow">
            <h3 style={{ marginBottom: "0.5rem", fontWeight: 700 }}>Collection for you</h3>
            <p>Based on your past preferences</p>
          </div>
        </div>
        <div>
          <div className="recommend-card">
            <div className="recommend-list">
              {limitedBooks.map((book, index) => (
                <div className="recommend-item" key={index}>
                  <img src="https://images.blinkist.io/images/books/54e3d412303764000a820000/1_1/470.jpg" alt="Living the 80/20 Way" loading="lazy" class="recommend-image" />
                  <h3>{book.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForYou;
