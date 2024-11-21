import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs'

import api from '../Auth/AxiosInterceptors';

function HistoryContributorPayout() {

    const { historyId } = useParams();

    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayouts = async () => {
        try {
            const response = await api.get(`/api/contributorpayout/getlistpayoutinfobycontributorid/${historyId}`)
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

    return (
        <Box sx={{ width: "80vw" }}>
            <Typography variant='h5'>Lịch sử quyết toán</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên</TableCell>
                            <TableCell>Từ ngày</TableCell>
                            <TableCell>Đến ngày</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payouts.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{formatDate(item.fromDate)}</TableCell>
                                <TableCell>{formatDate(item.toDate)}</TableCell>
                                <TableCell>{item.amount}</TableCell>
                                {item.status === 1 ? (
                                    <TableCell>Hoàn tất</TableCell>
                                ) : (
                                    <TableCell>Unknow</TableCell>
                                )}
                                <TableCell><Button href={`/contributor-payout-history/${historyId}/detail/${item.id}`}>Xem chi tiết</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default HistoryContributorPayout