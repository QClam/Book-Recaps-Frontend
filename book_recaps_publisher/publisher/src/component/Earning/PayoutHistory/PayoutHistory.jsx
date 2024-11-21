import React from 'react';
import './PayoutHistory.scss';

const PayoutHistory = () => {
  return (
    <div className="payout-history">
      <h3>Lịch sử quyết toán</h3>
      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Publisher</td>
            <td>01-01-2010</td>
            <td>01-02-2010</td>
            <td>30,000,000 VND</td>
            <td className="status-completed">Hoàn tất</td>
          </tr>
          {/* Add more rows as needed */}
        </tbody>
      </table>
    </div>
  );
};

export default PayoutHistory;
