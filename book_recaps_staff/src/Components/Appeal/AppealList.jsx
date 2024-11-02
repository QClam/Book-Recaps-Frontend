import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Auth/AxiosInterceptors";
import "./Appeal.scss";

function AppealList() {
    const [appeals, setAppeal] = useState([]);
    const [users, setUsers] = useState([]);

    const navigate = useNavigate();

    const fetchAppeals = async () => {
        try {
            const response = await api.get("/api/appeal/getallappeals");
            const appeals = response.data.data.$values;
            console.log(appeals);

            setAppeal(appeals);
        } catch (error) {
            console.error("Error Fetching", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get("/api/users/getalluser");
            const users = response.data.$values;
            setUsers(users);
        } catch (error) { }
    };

    useEffect(() => {
        fetchAppeals();
        fetchUsers();
    }, []);

    // Tìm tên contributor hoặc staff theo ID
    const getUserNameById = (id) => {
        const user = users.find((user) => user.id === id);
        return user ? user.fullName : "Chưa có Staff Response Kháng cáo này";
    };

    return (
        <div>
            <div className="content-list">
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
                                <td>{getUserNameById(val.contributorId)}</td>
                                <td>{getUserNameById(val.staffId)}</td>
                                <td>{val.reason}</td>
                                <td>{val.response}</td>
                                <td>{new Date(val.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            navigate(`/review/content_version/${val.reviewId}`)
                                        }
                                    >
                                        Xem Review
                                    </button>
                                </td>
                                <td>
                                    <button
                                        onClick={() => navigate(`/appeal/response/${val.id}`)}
                                    >
                                        Phản hồi
                                    </button>
                                </td>
                                <td>
                                    {val.appealStatus === 1 ? (
                                        <button style={{ backgroundColor: "#007bff" }}>
                                            Under Review
                                        </button>
                                    ) : val.appealStatus === 2 ? (
                                        <button style={{ backgroundColor: "green" }}>
                                            Resolved
                                        </button>
                                    ) : (
                                        <button>Unknow</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AppealList;
