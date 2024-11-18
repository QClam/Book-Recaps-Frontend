import React, { useEffect, useState } from "react";
import axios from "axios";
import { Hourglass } from "react-loader-spinner";
import { Add, MoreHoriz } from "@mui/icons-material";
import Modal from "react-modal";
import Swal from "sweetalert2";
import Pagination from "@mui/material/Pagination";
import { Button, Menu, MenuItem } from "@mui/material";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { useNavigate } from "react-router-dom";

import api from "../Auth/AxiosInterceptors";
import "./UserList.scss";
import "../Loading.scss";

Modal.setAppElement("#root"); // Set the root element for the modal

function UsersList() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal visibility state
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true); // State to toggle dark mode
  const usersPerPage = 5;

  const [error, setError] = useState(null); // Error state
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [editingUserId, setEditingUserId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // State để lưu anchor của submenu
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null); // State cho submenu lồng
  const [submenuOpen, setSubmenuOpen] = useState(false); // Trạng thái để kiểm soát submenu
  const [selectedUser, setSelectedUser] = useState(null); // State để lưu user đã chọn

  const token = localStorage.getItem("access_token");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users/getalluser", {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data.$values);
      console.log("Users: ", response.data);
    } catch (error) {
      console.log("Error fetching", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentPage > Math.ceil(users.length / usersPerPage)) {
      setCurrentPage(1);
    }
  }, [users.length, currentPage]);

  const displayUsers = users.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  ); // Adjust slicing for 1-based page indexing
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({ ...registerForm, [name]: value });
    setError(null);
    console.log(value);
  };

  const validateForm = () => {
    const fullNameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const phoneRegex = /^\d{10,11}$/;

    if (!fullNameRegex.test(registerForm.fullName)) {
      setError("Họ và tên không hợp lệ.");
      return false;
    }
    if (!emailRegex.test(registerForm.email)) {
      setError("Email không hợp lệ.");
      return false;
    }
    if (!passwordRegex.test(registerForm.password)) {
      setError(
        "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
      );
      return false;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return false;
    }
    if (!phoneRegex.test(registerForm.phoneNumber)) {
      setError("Số điện thoại không hợp lệ.");
      return false;
    }

    setError(null);
    return true;
  };

  const resetForm = () => {
    setRegisterForm({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    });
    setModalIsOpen(false);
    setError(null);
    setEditingUserId(null); // Reset user đang chỉnh sửa khi đóng modal
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Nếu form không hợp lệ, dừng lại
    }

    if (!executeRecaptcha) {
      setError("reCAPTCHA chưa được khởi tạo");
      return;
    }

    try {
      const token = await executeRecaptcha("signup");

      const newUser = {
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        phoneNumber: registerForm.phoneNumber,
        captchaToken: token,
      };

      const response = await axios.post(
        "https://bookrecaps.cloud/api/register",
        newUser
      );
      console.log("Register Successfully", newUser);
      console.log("Link: ", response.data.message);
      navigate("/auth/confirm-email", {
        state: {
          email: registerForm.email,
          message: response.data.message,
        },
      });

      resetForm();
      setError(null);
    } catch (error) {
      // Bắt lỗi và back-end trả về
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.message
      ) {
        // Kiểm tra thông báo lỗi
        setError("Email đã tồn tại, vui lòng sử dụng Email khác để đăng ký.");
      } else {
        console.error("Error registering user:", error);
        setError("Đăng ký thất bại.");
      }
    }
  };

  // const handleUpdateUser = async () => {
  //   if (!validateForm()) {
  //     return;
  //   }

  //   try {
  //     const updatedUser = {
  //       fullName: registerForm.fullName,
  //       phoneNumber: registerForm.phoneNumber,
  //     };

  //     const response = await axios.put(
  //       `https://66e3e75ed2405277ed124249.mockapi.io/users/${editingUserId}`,
  //       updatedUser
  //     );
  //     setUsers(
  //       users.map((user) => (user.id === editingUserId ? response.data : user))
  //     );
  //     resetForm();
  //   } catch (error) {
  //     console.error("Error registering user:", error);
  //     setError("Đăng ký thất bại.");
  //   }
  // };

  const handleChangeRole = async (userId, newRole) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn thay đổi?",
      text: "Bạn sẽ cấp quyền cho người dùng này!",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Thay đổi",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.put(
            `https://bookrecaps.cloud/api/update-user-role/${newRole}`,
            null, // No body content needed
            {
              params: { userId: userId }, // Adding userId as a query parameter
              headers: {
                accept: "*/*",
                Authorization: `Bearer ${token}`, // Token xác thực
              },
            }
          );

          if (response && response.status === 200) {
            // Update the user's role in the local state
            setUsers((prevUsers) =>
              prevUsers.map((user) =>
                user.userId === userId ? { ...user, roleType: newRole } : user
              )
            );
            Swal.fire(
              "Đã cập nhật!",
              "Người dùng đã được cấp quyền mới",
              "success"
            );
            fetchUsers();
          } else {
            console.error("Unexpected response:", response);
            Swal.fire(
              "Thất bại",
              "Có lỗi xảy ra trong quá trình cập nhật",
              "error"
            );
          }
        } catch (error) {
          console.log("Failed to Change Role", error);
          Swal.fire(
            "Thất bại",
            "Có lỗi xảy ra trong quá trình cập nhật",
            "error"
          );
        }
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    Swal.fire({
      title: "Bạn có chắc chắn muốn xóa?",
      text: "Bạn không thể hoàn tác hành động này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(
            `https://bookrecaps.cloud/api/users/delete-user-account`,
            {
              headers: {
                accept: "*/*",
                Authorization: `Bearer ${token}`,
              },
              params: {
                userId: userId, // Pass the userId as a query parameter
              },
            }
          );

          if (response && response.status === 200) {
            setUsers(users.filter((user) => user.userId !== userId));
            Swal.fire("Đã xóa!", "Người dùng đã được xóa", "success");
            fetchUsers();
          } else {
            console.error("Unexpected response:", response);
            Swal.fire("Thất bại", "Có lỗi xảy ra trong quá trình xóa", "error");
          }
        } catch (error) {
          console.error("Error deleting user: ", error);
          Swal.fire("Thất bại", "Có lỗi xảy ra trong quá trình xóa", "error");
        }
      }
    });
  };

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget); // Đặt anchor của menu
    setSelectedUser(user); // Lưu thông tin user đã chọn
  };

  const handleMenuClose = () => {
    setAnchorEl(null); // Đóng menu
    setSelectedUser(null);
  };

  const handleSubmenu = (event) => {
    setSubmenuAnchorEl(event.currentTarget);
    setSubmenuOpen(true);
  };

  const handleSubmenuClose = () => {
    setSubmenuAnchorEl(null);
    setSubmenuOpen(false);
  };

  const openEditModal = (user) => {
    setRegisterForm({
      fullName: user.fullName,
      email: user.email,
      birthDate: user.birthDate,
      phoneNumber: user.phoneNumber,
      address: user.address,
    });
    setEditingUserId(user.id);
    setModalIsOpen(true);
  };

  if (loading) {
    return (
      <div className="loading">
        <Hourglass
          visible={true}
          height="80"
          width="80"
          ariaLabel="hourglass-loading"
          colors={["#306cce", "#72a1ed"]}
        />
      </div>
    );
  }

  return (
    <div className="userlist-container">
      <h2>Danh sách Người dùng</h2>
      <div className="header">
        <div className="add-button">
          <button className="button" onClick={() => setModalIsOpen(true)}>
            <Add style={{ marginRight: 8 }} />
            Thêm người dùng
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={resetForm}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 style={{ color: "#1a1a1a" }}>
          {editingUserId ? "Cập nhật người dùng" : "Thêm người dùng"}
        </h2>
        <form onSubmit={handleAddUser}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Họ và tên"
              name="fullName"
              value={registerForm.fullName}
              onChange={handleInputChange}
            />
            <input
              type="text"
              placeholder="Số điện thoại"
              name="phoneNumber"
              value={registerForm.phoneNumber}
              onChange={handleInputChange}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              name="password"
              value={registerForm.password}
              onChange={handleInputChange}
            />
            <input
              type="password"
              placeholder="Xác nhận Mật khẩu"
              name="confirmPassword"
              value={registerForm.confirmPassword}
              onChange={handleInputChange}
            />
          </div>
            <input
              type="email"
              placeholder="Email"
              name="email"
              value={registerForm.email}
              onChange={handleInputChange}
            />

          {error && <p className="error">{error}</p>}
          <div className="button-container">
            <button
              type="submit">
              {editingUserId ? "Cập nhật" : "Thêm"}
            </button>
            <button
              type="button"
              className="cancel-button"
              onClick={() => setModalIsOpen(false)}
            >
              Hủy
            </button>
          </div>
        </form>
      </Modal>

      <div>
        <table className="content-table">
          <thead>
            <tr>
              <th>Họ & Tên</th>
              <th>Email</th>
              <th>Số Điện Thoại</th>
              <th>Ngày Sinh</th>
              <th>Vai trò</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {displayUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phoneNumber}</td>
                <td>{user.birthDate}</td>
                <td>
                  {user.roleType === 0 ? (
                    <button className="role-container" style={{ backgroundColor: "green" }}>
                      Super Admin
                    </button>
                  ) : user.roleType === 1 ? (
                    <button className="role-container" style={{ backgroundColor: "#007bff" }}>
                      Staff
                    </button>
                  ) : user.roleType === 2 ? (
                    <button className="role-container" style={{ backgroundColor: "#1d96c6" }}>
                      Contributor
                    </button>
                  ) : user.roleType === 3 ? (
                    <button className="role-container" style={{ backgroundColor: "#268a3a" }}>
                      Publisher
                    </button>
                  ) : user.roleType === 4 ? (
                    <button className="role-container" style={{ backgroundColor: "#a74f19" }}>
                      Customer
                    </button>
                  ) : (
                    <button className="role-container" style={{ backgroundColor: "#5e6061" }}>
                      Unknow Role
                    </button>
                  )}
                </td>
                <td>
                  <Button
                    startIcon={<MoreHoriz />}
                    onClick={(event) => handleMenuOpen(event, user)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        className="center"
        count={Math.ceil(users.length / usersPerPage)} // Total number of pages
        page={currentPage} // Current page
        onChange={handlePageChange} // Handle page change
        color="primary" // Styling options
        showFirstButton
        showLastButton
        sx={{
          "& .MuiPaginationItem-root": {
            color: isDarkMode ? "#fff" : "#000", // Change text color based on theme
            backgroundColor: isDarkMode ? "#555" : "#f0f0f0", // Button background color based on theme
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: isDarkMode ? "#306cce" : "#72a1ed", // Change color of selected page button
            color: "#fff", // Ensure selected text is white for contrast
          },
          "& .MuiPaginationItem-root.Mui-selected:hover": {
            backgroundColor: isDarkMode ? "#2057a4" : "#5698d3", // Color on hover for selected button
          },
          "& .MuiPaginationItem-root:hover": {
            backgroundColor: isDarkMode ? "#666" : "#e0e0e0", // Color on hover for non-selected buttons
          },
        }}
      />

      {/* Submenu */}
      <Menu
        anchorEl={anchorEl} // Menu anchor
        open={Boolean(anchorEl)} // Menu is open if anchorEl is set
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleSubmenu} disabled={selectedUser?.roleType === 3}>Thay đổi Vai trò</MenuItem>
        <Menu
          anchorEl={submenuAnchorEl}
          open={submenuOpen}
          onClose={handleSubmenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }} // Vị trí của submenu gốc từ bên trái
          transformOrigin={{ vertical: "top", horizontal: "left" }} // Submenu xuất hiện bên trái
        >
          <MenuItem
            onClick={() => {
              handleSubmenuClose();
              handleMenuClose();
              handleChangeRole(selectedUser.id, 1);
            }}
          >
            Staff
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSubmenuClose();
              handleMenuClose();
              handleChangeRole(selectedUser.id, 2);
            }}
          >
            Contributor
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSubmenuClose();
              handleMenuClose();
              handleChangeRole(selectedUser.id, 3);
            }}
          >
            Publisher
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleSubmenuClose();
              handleMenuClose();
              handleChangeRole(selectedUser.id, 4);
            }}
          >
            Customer
          </MenuItem>
        </Menu>
        <MenuItem
          onClick={() => {
            handleMenuClose();
            handleDeleteUser(selectedUser.id);
          }}
        >
          Xóa
        </MenuItem>
      </Menu>
    </div>
  );
}

export default UsersList;
