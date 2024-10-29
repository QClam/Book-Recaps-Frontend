const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5173;

// Serve static files with caching headers
app.use(
  express.static(path.join(__dirname, 'dist'), {
    maxAge: '1y', // Cache static assets (e.g., JS, CSS) for a year
    setHeaders: (res, filePath) => {
      // Set cache-control for index.html to no-cache
      if (filePath.endsWith('index.html')) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
      }
    },
  })
);

// Route all requests to index.html to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'), {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
