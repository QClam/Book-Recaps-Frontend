import React from 'react';
import { Box, Typography, Link, IconButton } from '@mui/material';
import { Facebook, Instagram, Twitter, LinkedIn } from "@mui/icons-material";

const Footer = () => {
  return (
    <Box 
      component="footer"
      sx={{
        backgroundColor: 'whitesmoke',
        padding: '20px 0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' }, // Cột trên mobile, hàng trên desktop
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '90%',
          maxWidth: '1200px',
          gap: { xs: '20px', sm: '0' }, // Thêm khoảng cách giữa các phần trên mobile
        }}
      >
        {/* Logo */}
        <Box>
          <img src="/path/to/logo.png" alt="Company Logo" style={{ height: '30px' }} />
        </Box>

        {/* Links */}
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' }, // Chuyển sang cột khi trên mobile
            gap: { xs: '10px', sm: '10px' },
            textAlign: { xs: 'center', sm: 'left' }, // Canh giữa trên mobile
          }}
        >
          <Typography variant="body2" color="textSecondary">
            © Company 2024
          </Typography>
          <Typography variant="body2" color="textSecondary">|</Typography>
          <Link href="#" underline="none" color="textSecondary">
            Sitemap
          </Link>
          <Typography variant="body2" color="textSecondary">|</Typography>
          <Link href="#" underline="none" color="textSecondary">
            Legal Notice
          </Link>
          <Typography variant="body2" color="textSecondary">|</Typography>
          <Link href="#" underline="none" color="textSecondary">
            Terms of Service
          </Link>
          <Typography variant="body2" color="textSecondary">|</Typography>
          <Link href="#" underline="none" color="textSecondary">
            Privacy Policies
          </Link>
        </Box>

        {/* Social Media Icons */}
        <Box 
          sx={{
            display: 'flex',
            gap: '10px',
          }}
        >
          <IconButton href="#" color="inherit">
            <Facebook />
          </IconButton>
          <IconButton href="#" color="inherit">
            <Twitter />
          </IconButton>
          <IconButton href="#" color="inherit">
            <LinkedIn />
          </IconButton>
          <IconButton href="#" color="inherit">
            <Instagram />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
