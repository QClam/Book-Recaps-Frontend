import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ContractManager.scss';

const ContractManager = () => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]); // For filtered display
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [attachments, setAttachments] = useState({}); // Lưu trữ attachment theo contractId

  const [statusFilters, setStatusFilters] = useState({
    pending: false,
    notStarted: false,
    approved: false,
    expired: false,
    rejected: false,
  });

  const [searchQuery, setSearchQuery] = useState(''); // State to hold search query

  const navigate = useNavigate();
  const accessToken = localStorage.getItem("authToken");
  const refreshToken = localStorage.getItem("refreshToken");

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await axios.get(
          `https://160.25.80.100:7124/api/Contract/getallcontract`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        const result = response.data;
        setContracts(result.data.$values); 
        setFilteredContracts(result.data.$values); // Initialize with full list
        setLoading(false);
         // Sau khi lấy hợp đồng, gọi API để lấy các attachment cho mỗi contract
         result.data.$values.forEach((contract) => {
          fetchContractAttachments(contract.id);
        });

      } catch (error) {
        if (error.response && error.response.status === 401) {
          await handleTokenRefresh();
          fetchContracts();
        } else {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    fetchContracts();
  }, [accessToken]);

   // Gọi API để lấy các attachment cho hợp đồng
   const fetchContractAttachments = async (contractId) => {
    try {
      const response = await axios.get(
        `https://160.25.80.100:7124/api/contract-attachment/getallattachmentbycontractid/${contractId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      const attachmentNames = response.data.data.$values.map(item => item.name);
      setAttachments(prev => ({
        ...prev,
        [contractId]: attachmentNames,
      }));
    } catch (error) {
      console.error("Error fetching attachments: ", error);
    }
  };

  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;
      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
    } catch (error) {
      setError("Session expired. Please log in again.");
    }
  };

  const handleDetailClick = (contractId) => {
    navigate(`/contract-detail/${contractId}`);
  };

  
  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "Bản nháp";
      case 1:
        return "Đang xử lý";
      case 2:
        return "Chưa bắt đầu";
      case 3:
        return "Đang kích hoạt";
      case 4:
        return "Hết hạn";
        case 5:
          return "Từ chối";
      default:
        return "Unknown";
    }
  };

  const handleFilterChange = (status) => {
    setStatusFilters((prevFilters) => ({
      ...prevFilters,
      [status]: !prevFilters[status],
    }));
  };


  
  useEffect(() => {
    const filtered = contracts.filter((contract) => {
      const statusLabel = contract.status !== undefined ? getStatusLabel(contract.status).toLowerCase() : ""; // Ensure status is defined
      return (
        (statusFilters.pending && statusLabel === "pending") ||
        (statusFilters.notStarted && statusLabel === "notstarted") ||
        (statusFilters.approved && statusLabel === "approved") ||
        (statusFilters.expired && statusLabel === "expired") ||
        (statusFilters.rejected && statusLabel === "rejected")
      );
    });
  
    setFilteredContracts(
      Object.values(statusFilters).some(Boolean) ? filtered : contracts
    );
  }, [statusFilters, contracts]);
  

  // Filter contracts by ID or Name based on search query
  useEffect(() => {
    const filtered = contracts.filter((contract) => {
      const contractName = contract.name ? contract.name.toLowerCase() : ''; // Safely access contract.name
      const query = searchQuery ? searchQuery.toLowerCase() : ''; // Safely access searchQuery
  
      // Kiểm tra nếu query tìm thấy trong contract.id hoặc contract.name hoặc tên của các attachment
      const attachmentsMatch = attachments[contract.id]
        ? attachments[contract.id].some((name) => {
            // Kiểm tra nếu name là chuỗi hợp lệ trước khi gọi toLowerCase
            return typeof name === 'string' && name.toLowerCase().includes(query);
          })
        : false;
  
      return (
        contract.id.toString().includes(query) ||
        contractName.includes(query) ||
        attachmentsMatch // Tìm kiếm trong attachments
      );
    });
  
    setFilteredContracts(filtered);
  }, [searchQuery, contracts, attachments]);
  

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="contract-manager">
      <header className="header">
        <h2>Search Contracts</h2>
        <input
          type="text"
          placeholder="Search by Name, ID"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // Update search query state
        />

      </header>
      
      <div className="status-filters">
        <label>
          <input type="checkbox" checked={statusFilters.pending} onChange={() => handleFilterChange("pending")} />
          Pending
        </label>
        <label>
          <input type="checkbox" checked={statusFilters.notStarted} onChange={() => handleFilterChange("notStarted")} />
          NotStarted
        </label>
        <label>
          <input type="checkbox" checked={statusFilters.approved} onChange={() => handleFilterChange("approved")} />
          Approved
        </label>
        <label>
          <input type="checkbox" checked={statusFilters.expired} onChange={() => handleFilterChange("expired")} />
          Expired
        </label>
        <label>
          <input type="checkbox" checked={statusFilters.rejected} onChange={() => handleFilterChange("rejected")} />
          Rejected
        </label>
      </div>

      <table className="contract-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th> 
            <th>Start Date</th>
            <th>Termination Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredContracts.map((contract) => (
            <tr key={contract.id}>
              <td>{contract.id}</td>
              <td>{contract.name}</td>

        
              <td>{new Date(contract.startDate).toLocaleDateString()}</td>
              <td>{new Date(contract.endDate).toLocaleDateString()}</td>
              <td className={`status ${getStatusLabel(contract.status).toLowerCase()}`}>
                {getStatusLabel(contract.status)}
              </td>
              <td>
                <div className="action">
                <button onClick={() => setShowDetail(showDetail === contract.id ? null : contract.id)}>⋮</button>
                  {showDetail === contract.id && (
                    <div className="action-menu">
                      <button onClick={() => handleDetailClick(contract.id)}>Detail</button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContractManager;
