import React, { useEffect, useState } from "react";
import axios from "axios";
import { Hourglass } from "react-loader-spinner";
import { Add } from "@mui/icons-material";
import Modal from "react-modal";
import Swal from "sweetalert2";

import "./UserList.scss";
import "../Loading.scss";

Modal.setAppElement("#root"); // Set the root element for the modal

function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModalIsOpen] = useState(false); // Modal visibility state
  const [error, setError] = useState(null); // Error state
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          "https://66e3e75ed2405277ed124249.mockapi.io/users"
        );
        setUsers(response.data);
        console.log("Users: ", response.data);
      } catch (error) {
        console.log("Error fetching", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;

    try {
      const newUser = {
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
        phoneNumber: registerForm.phoneNumber,
      };

      const response = await axios.post(
        "https://66e3e75ed2405277ed124249.mockapi.io/users",
        newUser
      );
      setUsers([...users, response.data]); // Update user list
      resetForm()
    } catch (error) {
      console.error("Error registering user:", error);
      setError("Đăng ký thất bại.");
    }
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updatedUser = {
        fullName: registerForm.fullName,
        phoneNumber: registerForm.phoneNumber,
      };

      const response = await axios.put(
        `https://66e3e75ed2405277ed124249.mockapi.io/users/${editingUserId}`,
        updatedUser
      );
      setUsers(
        users.map((user) => (user.id === editingUserId ? response.data : user))
      );
      resetForm();
    } catch (error) {
      console.error("Error registering user:", error);
      setError("Đăng ký thất bại.");
    }
  };

  const handleDeleteUser = async (id) => {
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
          await axios.delete(
            `https://66e3e75ed2405277ed124249.mockapi.io/users/${id}`
          );
          setUsers(users.filter((user) => user.id !== id));
          Swal.fire("Đã xóa!", "Người dùng đã được xóa", "success");
        } catch (error) {
          console.error("Error deleting user: ", error);
          Swal.fire("Thất bại", "Có lỗi xảy ra trong quá trình xóa", "error");
        }
      }
    });
  };

  const openEditModal = (user) => {
    setRegisterForm({
      fullName: user.fullName,
      email: user.email,
      password: user.password,
      confirmPassword: user.confirmPassword,
      phoneNumber: user.phoneNumber,
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
        <h2>{editingUserId ? "Cập nhật người dùng" : "Thêm người dùng"}</h2>
        <form>
          <div className="input-group">
            <input
              type="text"
              placeholder="Họ và tên"
              value={registerForm.fullName}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, fullName: e.target.value })
              }
            />
            <input
            type="text"
            placeholder="Số điện thoại"
            value={registerForm.phoneNumber}
            onChange={(e) =>
              setRegisterForm({ ...registerForm, phoneNumber: e.target.value })
            }
          />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, password: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={registerForm.confirmPassword}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  confirmPassword: e.target.value,
                })
              }
            />
          </div>
             <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, email: e.target.value })
              }
            />
          
          {error && <p className="error">{error}</p>}
          <div className="button-container">
            <button
              type="button"
              onClick={editingUserId ? handleUpdateUser : handleAddUser}
            >
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
              <th>Ảnh Đại Diện</th>
              <th>Số Điện Thoại</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((val) => (
              <tr key={val.id}>
                <td>{val.fullName}</td>
                <td>{val.email}</td>
                <td>
                  <img
                    src="https://media.discordapp.net/attachments/817692367535472670/1251566810898366526/ugoira.png?ex=67020b2c&is=6700b9ac&hm=42e1d7007d833b36a4c7c9172abb1885e14645ce2012d376d3eaabcfdb8c60a7&=&format=webp&quality=lossless&width=750&height=500"
                    alt="avatar"
                    style={{ width: 70, height: 60 }}
                  />
                </td>
                <td>{val.phoneNumber}</td>
                <td>
                  <button
                    className="button"
                    style={{ backgroundColor: "green" }}
                    onClick={() => openEditModal(val)}
                  >
                    Cập nhật
                  </button>
                </td>
                <td>
                  <button
                    className="button"
                    style={{ backgroundColor: "red" }}
                    onClick={() => handleDeleteUser(val.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersList;
