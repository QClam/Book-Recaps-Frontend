import React, { useEffect, useState } from 'react'
import api from '../Auth/AxiosInterceptors';
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Hourglass } from 'react-loader-spinner';

import './Contract.scss'

function ContractsList() {

  const [contracts, setContracts] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchContracts = async () => {
    try {
      const response = await api.get('/api/Contract/getallcontract')
      const contracts = response.data.data.$values;
      setContracts(contracts);
      console.log(contracts);
      setLoading(false);

    } catch (error) {
      console.error("Error Fetching", error);
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
        <Button variant="contained" color="primary" href="/contract/create">
          Thêm Hợp Đồng
        </Button>
      </Box>
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên Publisher</TableCell>
              <TableCell>Phần trăm doanh thu được chia sẽ</TableCell>
              <TableCell>Từ ngày</TableCell>
              <TableCell>Đến ngày</TableCell>
              <TableCell>Tự động gia hạn</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.map((item) => (
              <TableRow key={item.id}>
                <TableCell>Sẽ nhờ HA thêm field sau</TableCell>
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
      </Box>
    </div>
  )
}

export default ContractsList