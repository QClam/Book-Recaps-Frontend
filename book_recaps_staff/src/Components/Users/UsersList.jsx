import React, { useEffect, useState } from 'react';
import { Hourglass } from 'react-loader-spinner';
import api from '../Auth/AxiosInterceptors';
import Pagination from '@mui/material/Pagination';

import empty_image from "../../data/empty-image.png"
import './UsersList.scss';
import '../Loading.scss';

function UsersList() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Start loading as true
    const [currentPage, setCurrentPage] = useState(1); // MUI Pagination uses 1-based indexing
    const [isDarkMode, setIsDarkMode] = useState(true); // State to toggle dark mode
    const usersPerPage = 5;

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/api/users/getalluser',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setUsers(response.data.$values);
                console.log("Users: ", response.data);
            } catch (error) {
                console.log("Error fetching", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const displayUsers = users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage); // Adjust slicing for 1-based page indexing
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

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
        <div className='userlist-container'>
            <h2>Danh sách Contributor và Audience</h2>
            <div>
                <table className='content-table'>
                    <thead>
                        <tr>
                            <th>Họ & Tên</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Ảnh Đại Diện</th>
                            <th>Ngày Sinh</th>
                            <th>Số điện thoại</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayUsers.map((val) => (
                            <tr key={val.$id}>
                                <td>{val.fullName}</td>
                                <td>{val.userName}</td>
                                <td>{val.email}</td>
                                <td><img src={val.imageUrl || empty_image} 
                                            alt='Avatar' 
                                            style={{ width: 80, height: 80 }} 
                                            onError={({currentTarget}) => {
                                                currentTarget.onerror = null;
                                                currentTarget.src = empty_image
                                            }}/></td>
                                <td>{val.birthDate}</td>
                                <td>{val.phoneNumber}</td>
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
        </div>
    );
}

export default UsersList;
