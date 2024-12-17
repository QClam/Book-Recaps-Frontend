import React, { useEffect, useState } from 'react'
import { Box, Button, MenuItem, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField, Typography } from '@mui/material';
import { Hourglass } from 'react-loader-spinner';
import { useNavigate } from "react-router-dom";
import { Delete, Visibility } from "@mui/icons-material";

import api from '../Auth/AxiosInterceptors';
import './Contract.scss'
import Swal from 'sweetalert2';

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

function ContractsList() {

    const [contracts, setContracts] = useState([]);
    const [filteredContracts, setFilteredContracts] = useState([]);
    const [page, setPage] = useState(0); // Trang hiện tại
    const [rowsPerPage, setRowsPerPage] = useState(5); // Dòng mỗi trang    
    const [searchTerm, setSearchTerm] = useState(""); // Nhập input ô search
    const [filterStatus, setFilterStatus] = useState(""); // Lọc trạng thái
    const [publishers, setPublishers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isHover, setIsHover] = useState(false);

    const [contractForm, setContractForm] = useState({
        status: 0,
    })

    const navigate = useNavigate();

    const fetchContracts = async () => {
        try {
            const response = await api.get('/api/Contract/getallcontract')
            const contracts = resolveRefs(response.data.data.$values);
            contracts.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
            setContracts(contracts);
            setFilteredContracts(contracts)
            // console.log(contracts);
            setLoading(false);

        } catch (error) {
            console.error("Error Fetching", error);
        } finally {
            setLoading(false);
        }
    }

    const createContract = async () => {
        try {
            const response = await api.post('/api/Contract/createprepare', contractForm);
            const contractId = response.data.data?.id;

            if (contractId) {
                // console.log("Create Contract successfully: ", response.data.data);
                navigate(`/contract/${contractId}`);
            } else {
                console.log("ContractId not Found.");
            }
        } catch (error) {
            console.error("Error create contract", error);
        }
    }

    useEffect(() => {
        fetchContracts();
    }, [])

    const handleChangePage = (event, newPage) => {
        // Kiểm tra xem trang có hợp lệ hay không
        const totalPages = Math.ceil(filteredContracts.length / rowsPerPage);
        if (newPage < totalPages && newPage >= 0) {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when rows per page changes
    };

    useEffect(() => {
        // console.log("useEffect triggered - filterStatus:", filterStatus); // Kiểm tra xem useEffect có được kích hoạt không
        let filteredData = contracts;

        // Search filter
        if (searchTerm) {
            filteredData = filteredData.filter((item) =>
                item.publisher?.publisherName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== "") {
            filteredData = filteredData.filter((item) => {
                // console.log("Item Status: ", item.status); // Kiểm tra giá trị của item.status
                return item.status === Number(filterStatus);
            });
        }

        setFilteredContracts(filteredData);

        // Kiểm tra nếu page vượt quá tổng số trang
        const totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (page >= totalPages) {
            setPage(0);  // Reset page về 0 nếu vượt quá số trang
        }
    }, [searchTerm, filterStatus, contracts, page, rowsPerPage]);

    const handleDetail = (id) => {
        navigate(`/contract/${id}`);
    }

    const handleDeleteContract = (id) => {
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
                    const response = await api.delete(`/api/Contract/delete/${id}`);
                    if (response && response.status === 200) {
                        setContracts(contracts.filter((contract) => contract.id !== id))
                        Swal.fire("Đã xóa!", "Hợp đồng đã được xóa", "success");
                        await fetchContracts();
                    }
                } catch (error) {
                    Swal.fire("Thất bại", "Có lỗi xảy ra trong quá trình xóa, hãy chắc rằng không có tệp đính kèm nào đang ở trong bản hợp đồng", "error");
                }
            }
        })
    }

    const handleMouseEnter = () => {
        setIsHover(true);
    }

    const handleMouseLeave = () => {
        setIsHover(false);
    }

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" width="80vw">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    colors={["#306cce", "#72a1ed"]}
                />
            </Box>
        );
    }

    return (
        <div className='contract-list-container'>
            <Typography variant='h5'>Danh sách các bản hợp đồng</Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <TextField
                    label="Tìm kiếm theo tên NXB"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: "40%" }}
                />
                <TextField
                    select
                    label="Trạng thái"
                    value={filterStatus}
                    onChange={(e) => {
                        const value = e.target.value === "" ? "" : Number(e.target.value);
                        setFilterStatus(value); // Cập nhật giá trị của filterStatus
                    }}
                    size="small"
                    sx={{ width: '20%' }}
                >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value={0}>Bản nháp</MenuItem>
                    <MenuItem value={1}>Đang xử lý</MenuItem>
                    <MenuItem value={2}>Chưa bắt đầu</MenuItem>
                    <MenuItem value={3}>Đang kích hoạt</MenuItem>
                    <MenuItem value={4}>Hết hạn</MenuItem>
                    <MenuItem value={5}>Từ chối</MenuItem>
                </TextField>

                <Chip
                    label="Thêm hợp đồng"
                    variant={isHover ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => createContract()}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                />


            </Box>
            <Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Nhà xuất bản</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Doanh thu chia sẻ</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Từ ngày</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Đến ngày</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tự động gia hạn</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredContracts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            Không có dữ liệu
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredContracts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.publisher?.publisherName || "Hợp đồng này đang đợi chỉnh sửa"}</TableCell>
                                            <TableCell><Typography color='primary'>{item.revenueSharePercentage || 0}%</Typography></TableCell>
                                            <TableCell>{new Date(item.startDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(item.endDate).toLocaleDateString()}</TableCell>
                                            <TableCell>{item.autoRenew === true ? (
                                                <Typography color='success'>Có</Typography>
                                            ) : (
                                                <Typography color='error'>Không</Typography>
                                            )}</TableCell>
                                            <TableCell>{item.status === 0 ? (
                                                <Typography color='secondary'>Bản nháp</Typography>
                                            ) : item.status === 1 ? (
                                                <Typography color='primary'>Đang xử lý</Typography>
                                            ) : item.status === 2 ? (
                                                <Typography color='info'>Chưa bắt đầu</Typography>
                                            ) : item.status === 3 ? (
                                                <Typography color='success'>Đang kích hoạt</Typography>
                                            ) : item.status === 4 ? (
                                                <Typography color='error'>Hết hạn</Typography>
                                            ) : item.status === 5 ? (
                                                <Typography color='error'>Từ chối</Typography>
                                            ) : (
                                                <Button variant="contained">Unknow</Button>
                                            )}</TableCell>
                                            <TableCell>
                                                <Box display='flex'>

                                                    <Button onClick={() => handleDetail(item.id)}><Visibility /></Button>
                                                    <Button onClick={() => handleDeleteContract(item.id)} disabled={item.status !== 0 && item.status !== 4} color='error'><Delete /></Button>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    )))}
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={filteredContracts.length} // Tổng số dòng sau khi lọc
                                    page={page} // Trang hiện tại
                                    onPageChange={handleChangePage} // Hàm xử lý thay đổi trang
                                    rowsPerPage={rowsPerPage} // Số dòng hiển thị mỗi trang
                                    onRowsPerPageChange={handleChangeRowsPerPage} // Hàm xử lý thay đổi số dòng mỗi trang
                                    rowsPerPageOptions={[5, 10, 25]} // Tùy chọn số dòng mỗi trang
                                    labelRowsPerPage="Số dòng mỗi trang:" // Văn bản tiếng Việt
                                    labelDisplayedRows={({ from, to, count }) =>
                                        `${from}–${to} trên ${count !== -1 ? count : `nhiều hơn ${to}`}`
                                    }
                                    showFirstButton
                                    showLastButton
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Box>
        </div>
    )
}

export default ContractsList