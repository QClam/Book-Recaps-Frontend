import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import api from '../Auth/AxiosInterceptors';
import './Appeal.scss'

function AppealList() {

    const [appeals, setAppeal] = useState([]);
    const [reviews, setReview] = useState([]);

    const token = localStorage.getItem("access_token");

    const navigate = useNavigate();

    const fetchAppeals = async () => {
        try {
            const response = await api.get('/appeal/getallappeals', 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const appeals = response.data.data.$values;
            setAppeal(appeals)
            console.log("Appeals: ", appeals);
            
        } catch (error) {
            console.error("Error Fetching", error);
        }
    }

    useEffect(() => {
        fetchAppeals();
    },[])

    return (
        <div>
            <div className='content-list'>
                <h2>Danh sách Kháng cáo của Contributor</h2>
            </div>
            <div>
                <table className="content-table table-appeal">
                    <thead>
                        <tr>
                            <th>Tên Contributor </th>
                            <th>Tên Staff </th>
                            <th>Nội dung kháng cáo </th>
                            <th>Phản hồi từ Staff </th>
                            <th>Ngày </th>
                            <th>Bản Review</th>
                            <th>Phản hồi Kháng cáo</th>
                            <th>Trạng Thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appeals.map((val) => (
                            <tr key={val.id}>
                                <td>{val.contributor}</td>
                                <td>{val.staff}</td>
                                <td>{val.reason}</td>
                                <td>{val.response}</td>
                                <td>{new Date(val.createdAt).toLocaleDateString()}</td>
                                <td><button onClick={() => navigate(`/review/content_version/${val.reviewId}`)}>Xem Review</button></td>
                                <td><button onClick={() => navigate(`/appeal/response/${val.id}`)}>Phản hồi</button></td>
                                <td>Under review</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default AppealList