import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { Hourglass } from 'react-loader-spinner';
import dayjs from 'dayjs';

import api from '../Auth/AxiosInterceptors';
import { Visibility } from '@mui/icons-material';

function HistoryContributorPayout() {

    const { historyId } = useParams();
    const navigate = useNavigate();

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
        return date ? dayjs(date).format("DD/MM/YYYY") : null;
    }

    const detailPayout = (id) => {
        navigate(`/contributor-payout-detail/${id}`)
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
            <Typography variant='h5' sx={{margin: 2}}>Lịch sử quyết toán Người đóng góp</Typography>
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
                                <TableCell>{item.contributorName}</TableCell>
                                <TableCell>{formatDate(item.fromdate)}</TableCell>
                                <TableCell>{formatDate(item.todate)}</TableCell>
                                <TableCell>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalEarnings)}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                {item.status === "Done" ? (
                                    <TableCell><Typography color='success'>Đã Hoàn thành</Typography></TableCell>
                                ) : (
                                    <TableCell>Unknow</TableCell>
                                )}
                                <TableCell><Button onClick={() => detailPayout(item.payoutId)}><Visibility /></Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default HistoryContributorPayout