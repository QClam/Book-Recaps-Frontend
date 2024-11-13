import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React from 'react'
import { useParams } from 'react-router-dom';

function HistoryPublisherPayout() {

    const {historyId} = useParams();

    const payoutHistoryData = [
        {
            id:'1',
            name: 'Publisher A',
            fromDate: '19-09-2024',
            toDate: new Date().toISOString().slice(0, 10),
            revenue: '12.000.000 VND',
            status: 'Hoàn thành',
        },
        {
            id:'2',
            name: 'Publisher A',
            fromDate: '19-10-2024',
            toDate: new Date().toISOString().slice(0, 10),
            revenue: '8.000.000 VND',
            status: 'Hoàn thành',
        },
        {
            id:'3',
            name: 'Publisher A',
            fromDate: '19-11-2024',
            toDate: new Date().toISOString().slice(0, 10),
            revenue: '15.000.000 VND',
            status: 'Hoàn thành',
        },

    ];
    
    return (
        <div className='publisher-payout-container'>           
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
                            {payoutHistoryData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.fromDate}</TableCell>
                                    <TableCell>{item.toDate}</TableCell>
                                    <TableCell>{item.revenue}</TableCell>
                                    <TableCell>{item.status}</TableCell>
                                    <TableCell><Button href={`/publisher-payout-history/${historyId}/detail/${item.id}`}>Xem chi tiết</Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
        </div>
    )
}

export default HistoryPublisherPayout