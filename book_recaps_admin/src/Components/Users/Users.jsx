import React, { useEffect, useState } from 'react'
import { Box, Button, Menu, MenuItem, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, TableFooter, TablePagination, TextField } from '@mui/material';
import { MoreHoriz } from '@mui/icons-material';
import { Hourglass } from 'react-loader-spinner';

import dayjs from 'dayjs';
import Swal from 'sweetalert2';

import api from '../Auth/AxiosInterceptors';
import AddUserModal from './AddUserModal';
import UpdateUserModal from './UpdateUserModal';

function Users() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState(null); // State để xác định mở Modal AddUser hay UpdateUser

    const [anchorEl, setAnchorEl] = useState(null); // State để lưu anchor của submenu
    const [submenuAnchorEl, setSubmenuAnchorEl] = useState(null); // State cho submenu lồng
    const [submenuOpen, setSubmenuOpen] = useState(false); // State để kiểm soát submenu

    const handleAddUser = () => {
        setModalType('add');
        setIsModalOpen(true);
    }

    const handleUpdateUser = (userId) => {
        const user = users.find(u => u.id === userId); // Lấy thông tin người dùng theo ID
        setSelectedUser(user); // Lưu thông tin user vào state selectedUser
        setModalType('update');
        setIsModalOpen(true);
    }

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

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        setModalType(null);
    };

    useEffect(() => {
        let filteredData = users;

        // Search filter
        if (searchTerm) {
            filteredData = filteredData.filter((item) =>
                item.fullName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filteredData);

        // Kiểm tra nếu page vượt quá tổng số trang
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= totalPages) {
            setPage(0);  // Reset page về 0 nếu vượt quá số trang
        }
    }, [searchTerm, users, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        // Kiểm tra xem trang có hợp lệ hay không
        const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
        if (newPage < totalPages && newPage >= 0) {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/users/getalluser');
            const users = response.data.$values;
            console.log(users);
            
            setFilteredUsers(users)
            setUsers(users);
        } catch (error) {
            console.log("Error fetching", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, [])

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
                    const response = await api.put(
                        `/api/update-user-role/${newRole}`,
                        null, // No body content needed
                        {
                            params: { userId: userId },
                        }
                    );

                    Swal.fire(
                        "Đã cập nhật!",
                        "Người dùng đã được cấp quyền mới",
                        "success"
                    );
                    await fetchUsers();
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
                    const response = await api.delete(
                        `/api/users/delete-user-account`,
                        {
                            params: {
                                userId: userId,
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
        <Box sx={{ width: "80vw", padding: '24px' }}>
            <Typography variant='h5' gutterBottom>Quản lý người dùng</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <TextField
                    label="Tìm kiếm theo tên"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: '40%' }}
                />
            </Box>
            <Box display="flex" justifyContent="flex-end" mt={2} padding={2}>
                <Button variant="contained" color="primary" onClick={handleAddUser}>
                    Tạo mới
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Họ & Tên</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Số điện thoại</strong></TableCell>
                            <TableCell><strong>Ngày sinh</strong></TableCell>
                            <TableCell><strong>Vai trò</strong></TableCell>
                            <TableCell><strong></strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.fullName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phoneNumber}</TableCell>
                                <TableCell>{dayjs(user.birthDate).format("DD/MM/YYYY")}</TableCell>
                                <TableCell>
                                    {user.roleType === 0 ? (
                                        <Chip label="Super Admin" color="error" variant="outlined" />
                                    ) : user.roleType === 1 ? (
                                        <Chip label="Nhân viên" color="warning" variant="outlined" />
                                    ) : user.roleType === 2 ? (
                                        <Chip label="Người đóng góp" color="primary" variant="outlined" />
                                    ) : user.roleType === 3 ? (
                                        <Chip label="Nhà xuất bản" color="success" variant="outlined" />
                                    ) : user.roleType === 4 ? (
                                        <Chip label="Thính giả" color="error" variant="outlined" />
                                    ) : (
                                        <Chip label="Unknow" color="primary" variant="outlined" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button onClick={(event) => handleMenuOpen(event, user)}>
                                        <MoreHoriz />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                count={filteredUsers.length} // Tổng số dòng sau khi lọc
                                page={page} // Trang hiện tại
                                onPageChange={handleChangePage} // Hàm xử lý thay đổi trang
                                rowsPerPage={rowsPerPage} // Số dòng hiển thị mỗi trang
                                onRowsPerPageChange={handleChangeRowsPerPage} // Hàm xử lý thay đổi số dòng mỗi trang
                                rowsPerPageOptions={[5, 10, 25]} // Tùy chọn số dòng mỗi trang
                                labelRowsPerPage="Số dòng mỗi trang:" // Văn bản tiếng Việt
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}–${to} trên ${count !== -1 ? count : `nhiều hơn ${to}`}`
                                }
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleSubmenu} disabled={selectedUser?.roleType === 3}>
                    Thay đổi vai trò
                </MenuItem>
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
                        Nhân viên
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleSubmenuClose();
                            handleMenuClose();
                            handleChangeRole(selectedUser.id, 2);
                        }}
                    >
                        Người đóng góp
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleSubmenuClose();
                            handleMenuClose();
                            handleChangeRole(selectedUser.id, 3);
                        }}
                    >
                        Nhà xuất bản
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            handleSubmenuClose();
                            handleMenuClose();
                            handleChangeRole(selectedUser.id, 4);
                        }}
                    >
                        Thính giả
                    </MenuItem>
                </Menu>
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        handleUpdateUser(selectedUser.id);
                    }}
                >
                    Thay đổi thông tin
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleMenuClose();
                        handleDeleteUser(selectedUser.id);
                    }}
                >
                    Xóa
                </MenuItem>
            </Menu>

            {modalType === 'add' && (
                <AddUserModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    onUpdate={fetchUsers}
                />
            )}

            {modalType === 'update' && (
                <UpdateUserModal
                    open={isModalOpen}
                    onClose={handleCloseModal}
                    selectedUser={selectedUser} // Truyền selectedUser vào modal
                    onUpdate={fetchUsers}
                />
            )}

        </Box>
    )
}

export default Users