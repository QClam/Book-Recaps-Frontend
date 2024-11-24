import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hourglass } from "react-loader-spinner";
import Pagination from "@mui/material/Pagination";

import { fetchProfile } from "../Auth/Profile";
import api from "../Auth/AxiosInterceptors";
import "./Content.scss";
import "../Loading.scss";

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, 100) + "...";
    }
    return text;
}

const resolveRefs = (data) => {
    const refMap = new Map();
    const createRefMap = (obj) => {
        if (typeof obj !== "object" || obj === null) return;
        if (obj.$id) {
            refMap.set(obj.$id, obj);
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                createRefMap(obj[key]);
            }
        }
    };
    const resolveRef = (obj) => {
        if (typeof obj !== "object" || obj === null) return obj;
        if (obj.$ref) {
            return refMap.get(obj.$ref);
        }
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                obj[key] = resolveRef(obj[key]);
            }
        }
        return obj;
    };
    createRefMap(data);
    return resolveRef(data);
};

function RecapsList() {
    const [contentItems, setContentItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [review, setReview] = useState([]);
    const [reviewForm, setReviewForm] = useState({
        staffId: "",
        recapVersionId: "",
        comments: "",
    });

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();

    const recapsPerPage = 4;
    const maxLength = 150;

    const fetchRecaps = async () => {
        try {
            const response = await api.get("/api/recap/Getallrecap", {
                headers: {
                    Accept: "*/*",
                    Authorization: `Bearer ${token}`,
                },
            });
            let recaps = resolveRefs(response.data.data.$values);
            console.log("Recaps: ", recaps);

            // Xử lý từng recap để get version status và contributor
            const updatedRecaps = await Promise.all(
                recaps.map(async (recap) => {
                    let updatedRecap = { ...recap };

                    // Check status từ recapVersions
                    if (
                        recap.recapVersions?.$values &&
                        recap.recapVersions.$values.length > 0
                    ) {
                        updatedRecap.currentVersionStatus =
                            recap.recapVersions.$values[0].status;
                        updatedRecap.recapVersionId = recap.recapVersions.$values[0].id;
                        // console.log("recapVersionId: ", updatedRecap.recapVersionId);
                    } else {
                        updatedRecap.currentVersionStatus = "No Version";
                        updatedRecap.recapVersionId = "No ID";
                    }

                    // Fetch version status từ currentVersionId
                    if (recap.currentVersionId) {
                        try {
                            const versionData = await fetchRecapVersion(
                                recap.currentVersionId
                            );
                            if (versionData.data?.status) {
                                updatedRecap.currentVersionStatus = versionData.data.status; // Ghi đè status hiện tại nếu có
                            }
                            // console.log("Recap Version Data for ID", recap.currentVersionId, versionData);
                        } catch (versionError) {
                            console.log("Error fetching recap version:", versionError);
                        }
                    }

                    // Fetch contributor
                    if (recap.userId) {
                        try {
                            const contributorData = await fetchContributor(recap.userId);
                            updatedRecap.contributor = contributorData.data;
                        } catch (contributorError) {
                            console.log("Error fetching contributor:", contributorError);
                            updatedRecap.contributor = { fullName: "Unknown" };
                        }
                    } else {
                        updatedRecap.contributor = { fullName: "Unknown" };
                    }

                    return updatedRecap;
                })
            );
            // updatedRecaps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setContentItems(updatedRecaps);
        } catch (error) {
            console.log("Error fetching data, using sample data as fallback:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecaps();
        fetchReview();
    }, []);

    useEffect(() => {
        fetchProfile(token, (profileData) => {
            setProfile(profileData);
            setReviewForm((prevForm) => ({
                ...prevForm,
                staffId: profileData.id, // Cập nhật staffId vào form review
            }));
        });
    }, [token]);

    // Fetch version details
    const fetchRecapVersion = async (currentVersionId) => {
        try {
            const response = await api.get(`/version/${currentVersionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // console.log("Recap Version: ", response.data);

            return response.data;
        } catch (error) {
            console.log("Error Fetching currentVersionId: ", error);
        }
    };

    const fetchContributor = async (userId) => {
        try {
            const response = await api.get(
                `/api/users/get-user-account-byID?userId=${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // console.log("Contributor: ", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching user account: ", error);
            return null; // Handle lỗi
        }
    };

    const createReview = async (recapVersionId) => {
        try {
            const newReview = {
                staffId: reviewForm.staffId,
                recapVersionId: recapVersionId,
                comments: "Chưa Đạt",
            };

            const response = await api.post("/api/review/createreview", newReview, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const reviewId = response.data.data?.id;
            if (reviewId) {
                console.log("Review created successfully:", response.data);
                navigate(`/review/content_version/${reviewId}`);
            } else {
                console.error("Review created but ID not found.");
            }
        } catch (error) {
            console.error("Error creating review:", error);
        }
    };

    const fetchReview = async () => {
        try {
            const response = await api.get(`/api/review/getallreview`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const reviews = response.data.data.$values;
            console.log("Reviews: ", reviews);
            setReview(reviews);
        } catch (error) {
            console.error("Error fetching review:", error);
        }
    };

    if (loading) {
        return (
            <div className="loading">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    colors={["#306cce", "#72a1ed"]}
                />
            </div>
        );
    }

    //Filter
    const filteredRecaps = contentItems.filter((item) => {
        const search = item.book?.title
            .toLowerCase()
            .includes(searchQuery.toLocaleLowerCase());
        const status = selectedStatus
            ? item.currentVersionStatus === parseInt(selectedStatus)
            : true;
        return search && status;
    });

    const displayRecaps = filteredRecaps.slice(
        (currentPage - 1) * recapsPerPage,
        currentPage * recapsPerPage
    );
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    return (
        <div className="content-container">
            <div>
                <h2>Nội dung của Contributor</h2>
            </div>
            {/* <div className="search-filter-container">
                <input
                    type="text"
                    placeholder="Tìm theo cuốn sách..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                >
                    <option value="">Tất cả</option>
                    <option value="1">Đang xử lý</option>
                    <option value="2">Chấp thuận</option>
                    <option value="3">Từ chối</option>
                </select>
            </div> */}
            <div className="content-list">
                <table className="content-table">
                    <thead>
                        <tr>
                            <th>Tên bản Recap</th>
                            <th>Tên cuốn sách</th>
                            <th>Mô tả cuốn sách</th>
                            <th>Tên Contributor</th>
                            <th>Ngày</th>
                            <th>Duyệt nội dung</th>
                            <th>Chi tiết bản duyệt</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayRecaps.map((val) => (
                            <tr key={val.id}>
                                <td>{val.name}</td>
                                <td>{val.book?.title}</td>
                                <td>{truncateText(val.book?.description, maxLength)}</td>
                                <td>{val.contributor?.fullName}</td>
                                <td>{new Date(val.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        className="button"
                                        style={{ backgroundColor: "green", color: "#fff", width: "120px" }}
                                        onClick={() => createReview(val.recapVersionId)}
                                        disabled={val.currentVersionStatus !== 1}
                                    >
                                        Tạo Review
                                    </button>
                                </td>
                                <td>
                                    {review
                                        .filter((rev) => rev.recapVersionId === val.recapVersionId)
                                        .map((rev) => (
                                            <button
                                                key={rev.id}
                                                className="button"
                                                style={{
                                                    backgroundColor: "#007bff",
                                                    color: "#fff",
                                                    marginLeft: 5,
                                                    width: "130px"
                                                }}
                                                onClick={() =>
                                                    navigate(`/review/content_version/${rev.id}`)
                                                }
                                            >
                                                Xem Review
                                            </button>
                                        ))}
                                </td>
                                <td>
                                    {val.currentVersionStatus === 1 ? (
                                        <button
                                            className="role-container"
                                            style={{ backgroundColor: "#007bff", color: "#f0f0f0", width: "140px" }}
                                        >
                                            Đang xử lý
                                        </button>
                                    ) : val.currentVersionStatus === 2 ? (
                                        <button
                                            className="role-container"
                                            style={{ backgroundColor: "green", color: "#f0f0f0", width: "140px" }}
                                        >
                                            Chấp thuận
                                        </button>
                                    ) : val.currentVersionStatus === 3 ? (
                                        <button
                                            className="role-container"
                                            style={{ backgroundColor: "red", color: "#f0f0f0", width: "140px" }}
                                        >
                                            Từ chối
                                        </button>
                                    ) : val.currentVersionStatus === 0 ? (
                                        <button
                                            className="role-container"
                                            style={{ backgroundColor: "#CDB38B", color: "#f0f0f0" }}
                                        >
                                            Bản nháp
                                        </button>
                                    ) : (
                                        <button
                                            className="role-container"
                                            style={{ backgroundColor: "#5e6061", color: "#f0f0f0" }}
                                        >
                                            Unknow
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Pagination
                className="center"
                count={Math.ceil(contentItems.length / recapsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
            />
        </div>
    );
}

export default RecapsList;
