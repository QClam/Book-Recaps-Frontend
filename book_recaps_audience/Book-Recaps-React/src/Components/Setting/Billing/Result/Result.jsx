import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../Result/Result.scss';
import { routes } from "../../../../routes";
import { useAuth } from "../../../../contexts/Auth";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ paymentResult, setPaymentResult ] = useState({
    code: null,
    id: null,
    cancel: null,
    status: null,
    orderCode: null,
  });
  const [ iconType, setIconType ] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const id = params.get('id');
    const cancel = params.get('cancel') === 'true';
    const status = params.get('status');
    const orderCode = params.get('orderCode');

    setPaymentResult({ code, id, cancel, status, orderCode });
    setIconType(status === 'PAID' && code === '00' && !cancel ? 'success' : 'fail');

  }, [ location.search ]);

  const renderMessage = () => {
    if (paymentResult.cancel) {
      return (
        <div className="cancel-message">
          <h1>Thanh toán thất bại</h1>
          <p>Mã đơn: {paymentResult.orderCode}</p>
        </div>
      );
    } else if (paymentResult.status === 'PAID' && paymentResult.code === '00') {
      return (
        <div className="success-message">
          {/* <div className={`icon ${iconType}`}>
            {iconType === 'success' ? (
              <span className="checkmark">✓</span>
            ) : (
              <span className="x-icon">✗</span>
            )}
          </div> */}
          <h1>{user?.name}</h1>
          <h2>Thanh toán thành công</h2>
        </div>
      );
    } else {
      return (
        <div className="error-message">
          {/* <div className={`icon ${iconType}`}>
          {iconType === 'success' ? (
  <span className="checkmark">✓</span>
) : (
  <span className="x-icon">✗</span>
)}

          </div> */}
          <h1>Thanh toán thất bại</h1>
          <p>Giao dịch không thành công hoặc đã bị hủy. Vui lòng thử lại.</p>
          <p>Mã đơn: {paymentResult.orderCode}</p>
        </div>
      );
    }
  };

  return (
    <div className="payment-result-container">
      <div className="icon-container">
        {iconType === 'success' ? (
          <div className="icon success">
            <span className="checkmark">✓</span>
          </div>
        ) : (
          <div className="icon fail">
            <span className="x-icon">✗</span>
          </div>
        )}
      </div>
      {renderMessage()}
      <div className="payment-details">
        <div className="details-label">
          <p>Mã giao dịch</p>
        </div>
        <div className="details-value">
          <p>{paymentResult.id}</p>
        </div>
      </div>
      {/*{error && <p className="error">{error}</p>}*/}
      <div className="button-group">
        <button className="explore-button" onClick={() => navigate(routes.index)}>Trang chủ</button>
        <button className="try-again-button" onClick={() => navigate(routes.billing)}>Thử lại</button>
      </div>
    </div>
  );
};

export default Result;
