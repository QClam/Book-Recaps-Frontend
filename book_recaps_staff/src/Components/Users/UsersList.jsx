import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Hourglass } from 'react-loader-spinner'

import './UsersList.scss'
import '../Loading.scss'

function UsersList() {

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Start loading as true

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('https://66e3e75ed2405277ed124249.mockapi.io/users')
                setUsers(response.data);
                console.log("Users: ", response.data);
            } catch (error) {
                console.log("Error fetching", error);
            } finally {
                setLoading(false);
            }
        }
        fetchUsers();
    }, []);

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
                            <th>Username</th>
                            <th>Vai trò</th>
                            <th>Ảnh Đại Diện</th>
                            <th>Năm sinh</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.filter(val => val.role === 'audience' || val.role === 'contributor').map((val) => (
                            <tr key={val.id}>
                                <td>{val.username}</td>
                                <td>{val.role}</td>
                                <td><img src={val.image} style={{ width: 80, height: 80 }} /></td>
                                <td>{val.year_of_birth}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UsersList