import React from 'react';
import { useNavigate } from 'react-router-dom';

import './PublisherPayout.scss'

function PublisherPayout() {

  const navigate = useNavigate();
  // Dữ liệu mẫu
  const payoutData = [
    {
      id: '1',
      name: 'Publisher A',
      payoutPeriod: '01/11/2024 - 01/12/2024',
      newRevenue: '12.000.000 VND',
    },
    {
      id: '2',
      name: 'Publisher B',
      payoutPeriod: '01/10/2024 - 01/11/2024',
      newRevenue: '8.000.000 VND',
    },
    {
      id: '3',
      name: 'Publisher C',
      payoutPeriod: '01/09/2024 - 01/10/2024',
      newRevenue: '15.000.000 VND',
    },
  ];

  const createPayout = async (id) => {
    navigate(`/publisher-payout-create/${id}`)
  }

  return (
    <div className='publisher-payout-container'>
      <div>
        <h3>Quyết toán tiền bản quyền</h3>
      </div>
      <div className='content-table'>
        <table>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Đợt quyết toán gần nhất</th>
              <th>Doanh thu mới</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {payoutData.map((item, index) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.payoutPeriod}</td>
                <td>{item.newRevenue}</td>
                <td>
                  <button style={{ backgroundColor: '#9fc5f8' }} onClick={() => createPayout(item.id)}>Thanh toán</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PublisherPayout
