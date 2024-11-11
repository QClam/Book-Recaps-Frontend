import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, TextField, Button, Typography, Card, CardContent, IconButton, Grid } from '@mui/material';
import api from '../Auth/AxiosInterceptors';
import { Article } from '@mui/icons-material';


function ContractDetail() {

    const { contractId } = useParams();

    const [contract, setContract] = useState([]);
    const [contractAttachments, setContractAttachments] = useState([]);

    const fetchContractDetail = async () => {
        if (!contractId) {
            return;
        }

        try {
            const response = await api.get(`api/Contract/getcontractby/${contractId}`)
            const contract = response.data.data;
            const contractAttachments = contract.contractAttachments.$values;
            setContract(contract);
            setContractAttachments(contractAttachments);
            console.log(contract);
            console.log("Hợp đồng đính kèm: ", contractAttachments);
        } catch (error) {
            console.error("Error Fetching", error);
        }
    }

    useEffect(() => {
        fetchContractDetail();
    }, [contractId])

    return (
        <div className='contract-list-container'>
            <Box sx={{ display: 'flex', flexDirection: 'column', p: 4 }}>
                {/* Contact Detail Section */}
                <Box sx={{ width: '100%', mb: 4 }}>
                    <Typography variant="h6" gutterBottom>Chi tiết Bản hợp đồng</Typography>
                    <Card variant="outlined">
                        <CardContent>
                            <Box display="flex" gap={1} alignItems="center" mb={2}>
                                <Typography>Tên Publisher: {contract.publisher?.publisherName}</Typography>
                            </Box>
                            <Box display="flex" gap={1} mb={2}>
                                <Typography>Phần trăm chia sẻ doanh thu:</Typography>
                                <Typography color='primary'>{contract.revenueSharePercentage}%</Typography>
                            </Box>
                            <Box gap={2} mb={2}>
                                <Typography>Ngày bắt đầu: {contract.startDate}</Typography>
                                <Typography>Ngày kết thúc: {contract.endDate}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body1">
                                    Trạng thái: {contract.status === 0 ? (
                                        <Typography variant="contained" color='warning'>Bản nháp</Typography>
                                    ) : contract.status === 1 ? (
                                        <Typography variant="contained" color='primary'>Đang xử lý</Typography>
                                    ) : contract.status === 2 ? (
                                        <Typography variant="contained" color='info'>Chưa bắt đầu</Typography>
                                    ) : contract.status === 3 ? (
                                        <Typography variant="contained" color='success'>Đang kích hoạt</Typography>
                                    ) : contract.status === 4 ? (
                                        <Typography variant="contained" color='error'>Hết hạn</Typography>
                                    ) : contract.status === 5 ? (
                                        <Typography variant="contained" color='error'>Từ chối</Typography>
                                    ) : (
                                        <Typography variant="contained">Unknow</Typography>
                                    )}
                                </Typography>
                                <Typography variant="body2">Ngày tạo: {new Date(contract.createdAt).toLocaleDateString()}</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Tài liệu đính kèm Section */}
                <Box sx={{ width: '100%', maxWidth: 800 }}>
                    <Typography variant="h6" gutterBottom>Tài liệu đính kèm</Typography>
                    <Grid container spacing={2}>
                        {contractAttachments.map((item) => (
                            <Grid item xs={12} sm={6} md={3} key={item.id}>
                                <Card variant="outlined" sx={{ width: '100%' }}>
                                    <CardContent sx={{ padding: 2 }}>
                                        <Box sx={{ height: 150, border: '1px solid gray', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
                                            <Article />
                                        </Box>
                                        <Typography variant="body1">{item.name}</Typography>
                                        <Typography variant="body2">Ngày tạo: {new Date(item.createdAt).toLocaleDateString()}</Typography>
                                        <Button href={item.attachmentURL}>Chi tiết</Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Box>
        </div>
    )
}

export default ContractDetail