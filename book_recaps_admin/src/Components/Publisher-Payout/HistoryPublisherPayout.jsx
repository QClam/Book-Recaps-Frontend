import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import api from '../Auth/AxiosInterceptors';
import { Hourglass } from 'react-loader-spinner';
import { Visibility } from '@mui/icons-material';


function HistoryPublisherPayout() {

    const { historyId } = useParams();
    const navigate = useNavigate();

    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayouts = async () => {
        try {
            const response = await api.get(`/api/PublisherPayout/getlistpayoutinfobypublisherid/${historyId}`)
            const payouts = response.data.data.$values;
            setPayouts(payouts);
            setLoading(false);
        } catch (error) {
            console.error("Error Fetching Contributor Payout History", error);
        }
    }

    useEffect(() => {
        fetchPayouts();
    }, [])

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString() : null;
    }

    const detailPayout = (id) => {
        navigate(`/publisher-payout-detail/${id}`)
    } 

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
        <Box sx={{ width: "80vw" }}>
            <Typography variant='h5' sx={{margin: 2}}>Lịch sử quyết toán Publisher</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên</TableCell>
                            <TableCell>Từ ngày</TableCell>
                            <TableCell>Đến ngày</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                            <TableCell>Ghi chú</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payouts.map((item) => (
                            <TableRow key={item.payoutId}>
                                <TableCell>{item.publisherName}</TableCell>
                                <TableCell>{formatDate(item.fromDate)}</TableCell>
                                <TableCell>{formatDate(item.toDate)}</TableCell>
                                <TableCell>{item.totalEarnings}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                {item.status === "Done" ? (
                                    <TableCell>Hoàn thành</TableCell>
                                ) : (
                                    <TableCell>Lỗi</TableCell>
                                )}
                                <TableCell><Button onClick={() => detailPayout(item.payoutId)}><Visibility /> </Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default HistoryPublisherPayout