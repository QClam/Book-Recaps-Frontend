import React from 'react'; 
import './Billing.scss';

function Billing() {
  return (
    <div className="billing-container">
      <h1>Bắt đầu dùng thử miễn phí 5 ngày</h1>
      <p>
        Nhận quyền truy cập đầy đủ vào BookRecaps. Bạn sẽ không bị tính phí cho đến khi kết thúc thời gian dùng thử miễn phí. Huỷ bất cứ lúc nào.
      </p>

      <div className="billing-options">
                {/* Gói hàng tháng */}
                <div className="billing-card">
          <div className="billing-header">
            <div className="billing-title">
              <i className="calendar-icon"></i>
              <h2>Hàng tháng</h2>
            </div>
            <p className="price">80.000/tháng</p>
            <p className="billed">Tính phí hàng tháng</p>
          </div>
          <button className="start-trial-button monthly">Bắt đầu dùng thử miễn phí</button>
          <ul className="features-list">
            
            <li>Hơn 100 cuốn sách</li>
            <li>Hơn 100 bài tóm tắt sách khác nhau</li>
            <li>Ứng dụng di động (iOS/Android)</li>
            <li>Đánh dấu & Ghi chú</li>
            <li>Kể chuyện bằng âm thanh</li>
           
          </ul>
        </div>

        {/* Gói hàng năm */}
        <div className="billing-card">
          <div className="billing-header">
            <div className="billing-title">
              <i className="calendar-icon"></i>
              <h2>Hàng năm</h2>
            </div>
            <p className="price">800.000/năm</p>
            <p className="billed">Tính phí hàng năm</p>
          </div>
          <button className="start-trial-button annual">Bắt đầu dùng thử miễn phí</button>
          <ul className="features-list">
            <li>Hơn 100 cuốn sách</li>
            <li>Hơn 100 hướng dẫn bài viết và chủ đề</li>
            <li>Ứng dụng di động (iOS/Android)</li>
            <li>Đánh dấu & Ghi chú</li>
            <li>Kể chuyện bằng âm thanh</li>
            
          </ul>
        </div>


      </div>
    </div>
  );
}

export default Billing;
