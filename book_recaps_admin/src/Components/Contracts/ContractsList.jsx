import React, { useEffect, useState } from 'react'
import { Box, Button, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Hourglass } from 'react-loader-spinner';
import { useNavigate } from "react-router-dom";

import api from '../Auth/AxiosInterceptors';
import './Contract.scss'

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
    const [publishers, setPublishers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [contractForm, setContractForm] = useState({
        status: 0,
    })

    const navigate = useNavigate();

    const contractsPerPage = 5;

    const displayContracts= contracts.slice(
        (currentPage - 1) * contractsPerPage,
        currentPage * contractsPerPage
    ); // Adjust slicing for 1-based page indexing
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const fetchContracts = async () => {
        try {
            const response = await api.get('/api/Contract/getallcontract')
            const contracts = resolveRefs(response.data.data.$values);
            setContracts(contracts);
            console.log(contracts);
            setLoading(false);

        } catch (error) {
            console.error("Error Fetching", error);
        }
    }

    const createContract = async () => {
        try {
            const response = await api.post('/api/Contract/createprepare', contractForm);
            const contractId = response.data.data?.id;

            if (contractId) {
                console.log("Create Contract successfully: ", response.data.data);
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

    if (loading) {
        return (
            <div className="loading">
                <Hourglass
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="hourglass-loading"
                    colors={["#306cce", "#72a1ed"]}
                />
            </div>
        );
    }

    return (
        <div className='contract-list-container'>
            <Typography variant='h5'>Danh sách các bản hợp đồng</Typography>
            <Box display="flex" justifyContent="flex-end" mt={2}>
                <Button variant="contained" color="primary" onClick={() => createContract()}>
                    Thêm Hợp Đồng
                </Button>
            </Box>
            <Box>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tên Publisher</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Phần trăm doanh thu được chia sẽ</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Từ ngày</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Đến ngày</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Tự động gia hạn</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayContracts.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.publisher?.publisherName}</TableCell>
                                    <TableCell>{item.revenueSharePercentage}%</TableCell>
                                    <TableCell>{item.startDate}</TableCell>
                                    <TableCell>{item.endDate}</TableCell>
                                    <TableCell>{item.autoRenew === true ? (
                                        <Button>Có</Button>
                                    ) : (
                                        <Button color="error">Không</Button>
                                    )}</TableCell>
                                    <TableCell>{item.status === 0 ? (
                                        <Button variant="contained" color='warning'>Bản nháp</Button>
                                    ) : item.status === 1 ? (
                                        <Button variant="contained" color='primary'>Đang xử lý</Button>
                                    ) : item.status === 2 ? (
                                        <Button variant="contained" color='info'>Chưa bắt đầu</Button>
                                    ) : item.status === 3 ? (
                                        <Button variant="contained" color='success'>Đang kích hoạt</Button>
                                    ) : item.status === 4 ? (
                                        <Button variant="contained" color='error'>Hết hạn</Button>
                                    ) : item.status === 5 ? (
                                        <Button variant="contained" color='error'>Từ chối</Button>
                                    ) : (
                                        <Button variant="contained">Unknow</Button>
                                    )}</TableCell>
                                    <TableCell><Button variant='outlined' href={`/contract/${item.id}`}>Xem chi tiết</Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Pagination
                className="center"
                count={Math.ceil(contracts.length / contractsPerPage)} // Total number of pages
                page={currentPage} // Current page
                onChange={handlePageChange} // Handle page change
                color="primary" // Styling options
                showFirstButton
                showLastButton
                sx={{marginTop: 2}}
            />
            </Box>
        </div>
    )
}

export default ContractsList