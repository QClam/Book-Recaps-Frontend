import React, { useEffect, useState } from 'react'
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import { Hourglass } from 'react-loader-spinner'
import api from '../Auth/AxiosInterceptors'

import './UsersList.scss'
import '../Loading.scss'

function UsersList() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Start loading as true
    const [currentPage, setCurrentPage] = useState(0);
    const usersPerPage = 5;

    const token = localStorage.getItem('access_token');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/users/getalluser', 
                    {
                        headers: {
                            'accept' : "*/*",
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                setUsers(response.data.$values);
                console.log("Users: ", response.data);
            } catch (error) {
                console.log("Error fetching", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, [users]);

    const displayUsers = users.slice(currentPage * usersPerPage, (currentPage + 1) * usersPerPage);
    const handlePageClick = (data) => {
        setCurrentPage(data.selected);
    }

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
                            <tr key={val.id}>
                                <td>{val.fullName}</td>
                                <td>{val.userName}</td>
                                <td>{val.email}</td>
                                <td><img src={val.imageUrl} alt='Avatar' style={{ width: 80, height: 80 }} /></td>
                                <td>{val.birthDate}</td>
                                <td>{val.phoneNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <ReactPaginate
                prevPageRel={'Previous'}
                nextLabel={'Next'}
                breakLabel={'...'}
                pageCount={Math.ceil(users.length / usersPerPage)} // Tổng trang 
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={'pagination'}
                activeClassName={'active'}
            />
        </div>
    )
}

export default UsersList