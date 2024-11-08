import React, { useEffect, useState } from 'react'
import { Hourglass } from 'react-loader-spinner';
import api from '../Auth/AxiosInterceptors';
import { handleFetchError } from '../../utils/handleError';
import { json } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Pagination, Select, TextField } from '@mui/material';
import Swal from 'sweetalert2';

import "./Report.scss"

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

function ReportList() {

    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [users, setUsers] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [responseText, setResponseText] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [currentPage, setCurrentPage] = useState(1); // MUI Pagination uses 1-based indexing
    const [isDarkMode, setIsDarkMode] = useState(true);

    const reportsPerPage = 5;

    const displayReports = reports.slice(
        (currentPage - 1) * reportsPerPage,
        currentPage * reportsPerPage
    );

    const fetchReports = async () => {
        try {
            const response = await api.get('/api/supportticket/getallsupportticket');
            let reports = resolveRefs(response.data.data.$values);
            console.log("Reports: ", reports);
            setReports(reports);
            return reports.id;
        } catch (error) {
            const err = handleFetchError(error)
            throw json({ error: err.error }, { status: err.status });
        }
    };

    const fetchUsers = async () => {

        try {
            const response = await api.get(`/api/users/getalluser`);
            const users = response.data.$values;
            // console.log(users);
            setUsers(users);
        } catch (error) {
            const err = handleFetchError(error)
            throw json({ error: err.error }, { status: err.status });
        }
    }

    const openDialog = (report) => {
        setSelectedReport(report);
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setSelectedReport(null);
        setResponseText("");
    };

    const handleResponseChange = (e) => {
        setResponseText(e.target.value);
    };

    const handleResponse = async (id) => {
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
                        response: responseText,
                    };
                    await api.put(`/api/supportticket/responseticket/${id}`, responseForm);
                    Swal.fire('Thành công!', 'Phản hồi của bạn đã được gửi.', 'success');
                    closeDialog();
                    fetchReports();
                } catch (error) {
                    console.error("Error Response", error);
                    Swal.fire('Lỗi!', 'Đã xảy ra lỗi khi gửi phản hồi.', 'error');
                }
            }
        });
    };

    const handleStatusChange = (event) => {
        setFilterStatus(event.target.value);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    useEffect(() => {
        fetchReports();
        fetchUsers();
    }, [])

    const getUserNamebyId = (userId) => {
        const user = users.find((user) => user.id.toString() === userId.toString());
        // console.log("Matching user: ", user); // Kiểm tra user được tìm thấy
        return user ? user.fullName : "Không xác định";
    }

    if (!loading) {
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

    return (
        <div>
            <div className="content-list">
                <h2>Danh sách Report của Audience</h2>
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
                <table className="content-table table-report">
                    <thead>
                        <tr>
                            <th>Tên bản Recap</th>
                            <th>Tên cuốn sách</th>
                            <th>Tên Audience</th>
                            <th>Nội dung</th>
                            <th>Phản hồi từ Staff</th>
                            <th>Ngày</th>
                            <th>Phản hồi</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayReports
                            .filter((val) => filterStatus === "" || val.status === filterStatus)
                            .map((val) => (
                                <tr key={val.id}>
                                    <td>{val.recaps?.name}</td>
                                    <td>{val.recaps?.book?.title}</td>
                                    <td>{getUserNamebyId(val.userId)}</td>
                                    <td>{val.description}</td>
                                    <td>{val.response || "Chưa có phản hồi từ staff"}</td>
                                    <td>{new Date(val.createdAt).toLocaleDateString()}</td>
                                    <td><button onClick={() => openDialog(val)}
                                        disabled={val.status === 2}
                                        style={{ width: "150px" }}
                                    >
                                        Phản hồi</button></td>
                                    <td>{val.status === 1 ? (
                                        <button style={{ backgroundColor: "#007bff", color: "#f0f0f0", width: "130px" }}>
                                            Đang xử lý
                                        </button>
                                    ) : val.status === 2 ? (
                                        <button style={{ backgroundColor: "green", color: "#f0f0f0", width: "120px" }}>
                                            Đã xử lý
                                        </button>
                                    ) : (
                                        <button>Unknow</button>
                                    )}</td>
                                </tr>
                            ))}
                        {reports.length === 0 && (
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
                <DialogTitle>Phản hồi Report</DialogTitle>
                <DialogContent>
                    <p><strong>Nội dung:</strong> {selectedReport?.description}</p>
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
                    <Button color="primary" onClick={() => handleResponse(selectedReport?.id)}>Gửi Phản hồi</Button>
                </DialogActions>
            </Dialog>

            <Pagination
                className="center"
                count={Math.ceil(reports.length / reportsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
                sx={{
                    "& .MuiPaginationItem-root": {
                        color: isDarkMode ? "#fff" : "#000",
                        backgroundColor: isDarkMode ? "#555" : "#f0f0f0",
                    },
                    "& .MuiPaginationItem-root.Mui-selected": {
                        backgroundColor: isDarkMode ? "#306cce" : "#72a1ed",
                        color: "#fff",
                    },
                    "& .MuiPaginationItem-root.Mui-selected:hover": {
                        backgroundColor: isDarkMode ? "#2057a4" : "#5698d3",
                    },
                    "& .MuiPaginationItem-root:hover": {
                        backgroundColor: isDarkMode ? "#666" : "#e0e0e0",
                    },
                }}
            />
        </div>
    )
}

export default ReportList