import React, { useEffect, useState } from 'react';
import { Hourglass } from 'react-loader-spinner';
import api from '../Auth/AxiosInterceptors';
import Pagination from '@mui/material/Pagination';

import avatar from "../../data/avatar.png"
import './UsersList.scss';
import '../Loading.scss';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import UserDetail from './UserDetail';

function UsersList() {

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(4); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/api/users/getalluser');
                const users = response.data.$values;
                const filterdUsers = users.filter(user => user.roleType === 2);
                setUsers(filterdUsers);
                setFilteredUsers(filterdUsers);
                console.log("Users: ", filterdUsers);
            } catch (error) {
                console.log("Error fetching", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const detailUser = (userId) => {
        const user = users.find(u => u.id === userId); // Lấy thông tin người dùng theo ID
        setSelectedUser(user); // Lưu thông tin user vào state selectedUser
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
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
    }, [searchTerm, users]);

    if (loading) {
        return (
            <div className='loading'>
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    colors={['#306cce', '#72a1ed']}
                />
            </div>
        );
    }

    return (
        <Box sx={{ width: "80vw" }}>
            <Typography variant='h5' margin={1}>Danh sách Người đóng góp</Typography>
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
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Họ & Tên</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            {/* <TableCell><strong>Ảnh Đại Diện</strong></TableCell> */}
                            <TableCell><strong>Ngày Sinh</strong></TableCell>
                            <TableCell><strong>Số điện thoại</strong></TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((val) => (
                                <TableRow key={val.id}>
                                    <TableCell>{val.fullName}</TableCell>
                                    <TableCell>{val.email}</TableCell>
                                    {/* <TableCell><img src={val.imageUrl || avatar}
                                        alt='Avatar'
                                        style={{ width: 80, height: 80, borderRadius: "50%" }}
                                        onError={({ currentTarget }) => {
                                            currentTarget.onerror = null;
                                            currentTarget.src = avatar
                                        }} /></TableCell> */}
                                    <TableCell>{new Date(val.birthDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{val.phoneNumber}</TableCell>
                                    <TableCell><Button onClick={() => detailUser(val.id)}><Visibility /></Button></TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[4, 10, 15]}
                                count={filteredUsers.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Số hàng mỗi trang"
                                labelDisplayedRows={({ from, to, count }) =>
                                    `${from}–${to} trong tổng số ${count !== -1 ? count : `nhiều hơn ${to}`}`
                                }
                            />
                        </TableRow>
                    </TableFooter>
                </Table>
            </TableContainer>

            <UserDetail
                open={isModalOpen}
                onClose={handleCloseModal}
                selectedUser={selectedUser}
            />
        </Box>
    );
}

export default UsersList;
