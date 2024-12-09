import { Box, Grid, Link, Typography } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { InfinitySpin } from "react-loader-spinner";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

function ConfirmEmail() {
  const location = useLocation();
  const email = location.state?.email || "unknown@example.com";
  const confirmationLink = location.state?.message || ""; // lấy link từ message đc truyền qua
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const handleLinkClick = (e) => {
    e.preventDefault(); // Prevent default link action

    // Open the confirmation link in a new tab
    window.open(confirmationLink, "_blank");

    // After opening the link, wait for 3 seconds before showing SweetAlert
    setTimeout(() => {
      Swal.fire({
        title: "Email Confirmation",
        text: "Email đã xác nhận thành công. Bạn sẽ được chuyển hướng về trang Quản lý người dùng.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/users"); // Redirect after SweetAlert is confirmed
      });
    }, 3000);
  };

  return (
    <Box sx={{ mx: "auto", mt: 4, width: "70vw" }}>
      {loading ? (
        <Grid
          container
          spacing={2}
          direction="column"
          justifyContent="center"
          alignItems="center"
          textAlign="center"
        >
          <Grid item>
            <InfinitySpin
              visible={true}
              width="200"
              color="#4fa94d"
              ariaLabel="infinity-spin-loading"
            />
          </Grid>
          <Grid item>
            <Typography variant="body1">
              Chúng tôi đang xác nhận Email {email}, vui lòng chờ trong giây lát...
            </Typography>
          </Grid>
          <Grid item>
            {confirmationLink ? (
              <Link
                href={confirmationLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                sx={{ color: "blue", cursor: "pointer" }}
              >
                Bấm vào đây để xác nhận Email
              </Link>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Link not available
              </Typography>
            )}
          </Grid>
        </Grid>
      ) : (
        <Typography variant="body1" textAlign="center">
          {message}
        </Typography>
      )}
    </Box>
  );
}

export default ConfirmEmail;