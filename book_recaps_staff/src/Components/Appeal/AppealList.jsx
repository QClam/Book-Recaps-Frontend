import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Pagination,
} from "@mui/material";
import Swal from 'sweetalert2';

import { fetchProfile } from "../Auth/Profile";
import api from "../Auth/AxiosInterceptors";
import "./Appeal.scss";

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

function AppealList() {
    const [appeals, setAppeal] = useState([]);
    const [selectedAppeal, setSelectedAppeal] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [responseText, setResponseText] = useState("");
    const [profile, setProfile] = useState([]);
    const [staffId, setStaffId] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // MUI Pagination uses 1-based indexing
    const [isDarkMode, setIsDarkMode] = useState(true);

    const [responseForm, setResponseForm] = useState({
        id: "",
        staffId: "",
        response: "",
    })

    const navigate = useNavigate();
    const token = localStorage.getItem("access_token")

    const appealsPerPage = 3;

    const displayAppeals = appeals.slice(
        (currentPage - 1) * appealsPerPage,
        currentPage * appealsPerPage
    );

    const fetchAppeals = async () => {
        try {
            const response = await api.get("/api/appeal/getallappeals");
            const appeals = resolveRefs(response.data.data.$values);
            appeals.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
            console.log(appeals);
            setAppeal(appeals);
        } catch (error) {
            console.error("Error Fetching", error);
        }
    };

    useEffect(() => {
        fetchProfile(token, (profileData) => {
            setProfile(profileData);
            setStaffId(profileData.id);
            setResponseForm((prevForm) => ({
                ...prevForm,
                staffId: profileData.id, // Cập nhật staffId vào form
            }));
        });
    }, [token]);

    const handleResponse = async () => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Bạn có muốn gửi phản hồi này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, gửi phản hồi!',
            cancelButtonText: 'Hủy',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const responseForm = {
                        id: selectedAppeal.id,
                        staffId: profile.id,
                        response: responseText,
                    };
                    await api.put("/api/appeal/responseappealbystaff", responseForm);
                    Swal.fire('Thành công!', 'Phản hồi của bạn đã được gửi.', 'success');
                    closeDialog();
                    fetchAppeals();
                } catch (error) {
                    console.error("Error Response", error);
                    Swal.fire('Lỗi!', 'Đã xảy ra lỗi khi gửi phản hồi.', 'error');
                }
            }
        });
    };

    const openDialog = (appeal) => {
        setSelectedAppeal(appeal);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedAppeal(null);
        setResponseText("");
    };

    const handleResponseChange = (e) => {
        setResponseText(e.target.value);
    };

    const handleStatusChange = (event) => {
        setFilterStatus(event.target.value);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    useEffect(() => {
        fetchAppeals();
    }, []);

    return (
        <div className="appeal-container">
            <div className="content-list">
                <h2>Danh sách Kháng cáo của Contributor</h2>
                <FormControl variant="outlined" style={{ minWidth: 200, marginBottom: 20 }} className="form-control">
                    <InputLabel>{filterStatus === "" ? "Tất cả" : "Trạng thái"}</InputLabel>
                    <Select
                        value={filterStatus}
                        onChange={handleStatusChange}
                        label={filterStatus === "" ? "Tất cả" : "Trạng thái"}
                    >
                        <MenuItem value="">Tất cả</MenuItem>
                        <MenuItem value={1}>Đang xử lý</MenuItem>
                        <MenuItem value={2}>Đã xử lý</MenuItem>
                    </Select>
                </FormControl>
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
                        {displayAppeals
                            .map((val) => (
                                <tr key={val.id}>
                                    <td>{val.contributor?.fullName}</td>
                                    <td>{val.staff?.fullName || "Chưa có Staff phản hồi"}</td>
                                    <td>{val.reason}</td>
                                    <td>{val.response || "Chưa có phản hồi từ Staff"}</td>
                                    <td>{new Date(val.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button style={{ width: "150px", backgroundColor: "#007bff", color: "#fff" }}
                                            onClick={() =>
                                                navigate(`/review/content_version/${val.reviewId}`)
                                            }
                                        >
                                            Xem Review
                                        </button>
                                    </td>
                                    <td>
                                        <button onClick={() => openDialog(val)}
                                            disabled={val.appealStatus === 2}
                                            style={{ width: "150px", backgroundColor: "red", color: "#f0f0f0" }}
                                        >
                                            Phản hồi</button>
                                    </td>
                                    <td>
                                        {val.appealStatus === 1 ? (
                                            <button style={{ backgroundColor: "#007bff", color: "#f0f0f0", width: "130px" }}>
                                                Đang xử lý
                                            </button>
                                        ) : val.appealStatus === 2 ? (
                                            <button style={{ backgroundColor: "green", color: "#f0f0f0", width: "120px" }}>
                                                Đã xử lý
                                            </button>
                                        ) : val.appealStatus === 0 ? (
                                            <button>Đang mở</button>
                                        ) : (
                                            <button>Unknow</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        }
                        {appeals
                            .filter((val) => filterStatus === "" || val.appealStatus === filterStatus)
                            .filter((val) => val.appealStatus !== 0 && val.staff?.id === profile.id).length === 0 && (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center' }}>
                                        Hiện tại không có kháng cáo
                                    </td>
                                </tr>
                            )}
                    </tbody>
                </table>
            </div>

            <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth>
                <DialogTitle>Phản hồi Kháng cáo</DialogTitle>
                <DialogContent>
                    <p><strong>Nội dung kháng cáo:</strong> {selectedAppeal?.reason}</p>
                    <TextField
                        label="Phản hồi của bạn"
                        multiline
                        rows={4}
                        fullWidth
                        value={responseText}
                        onChange={handleResponseChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="secondary">Đóng</Button>
                    <Button color="primary" onClick={handleResponse}>Gửi Phản hồi</Button>
                </DialogActions>
            </Dialog>

            <Pagination
                className="center"
                count={Math.ceil(appeals.length / appealsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
            />
        </div>
    );
}

export default AppealList;
