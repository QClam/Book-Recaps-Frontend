import React from 'react';
import './PayoutDetail.scss';

const PayoutDetail = () => {
  return (
    <div className="payout-detail">
      <h3>Quyết toán tiền bản quyền</h3>
      <div className="payout-info">
        <div>
          <p>Nhà xuất bản: <span>Nhà xuất bản 1 thành viên</span></p>
          <p>Tài khoản ngân hàng: <span>--</span></p>
          <p>Thông tin liên hệ: <span>--</span></p>
        </div>
        <div>
          <p>Đợt quyết toán: <span>01-01-2010 đến 01-02-2010</span></p>
          <p>Tổng chi: <span>30,000,000 VND</span></p>
        </div>
      </div>

      <h4>Books</h4>
      <table>
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Doanh thu</th>
            <th>Hợp đồng</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>...</td>
            <td>01-02-2010</td>
            <td>(current date)</td>
            <td>12,000,000 VND</td>
            <td>(contract id)</td>
          </tr>
          {/* Add more rows as needed */}
        </tbody>
      </table>
    </div>
  );
};

export default PayoutDetail;
