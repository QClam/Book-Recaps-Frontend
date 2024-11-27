import React, { useState, useEffect } from 'react';  
import axios from 'axios';
//import './Contract.scss';
import { useNavigate } from 'react-router-dom';
import "../ContractManager/ContractManager.scss";

const resolveRefs = (data) => {
  const refMap = new Map();
  const createRefMap = (obj) => {
    if (typeof obj !== "object" || obj === null) return;
    if (obj.$id) {
      refMap.set(obj.$id, obj);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        createRefMap(obj[key]);
      }
    }
  };
  const resolveRef = (obj) => {
    if (typeof obj !== "object" || obj === null) return obj;
    if (obj.$ref) {
      return refMap.get(obj.$ref);
    }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = resolveRef(obj[key]);
      }
    }
    return obj;
  };
  createRefMap(data);
  return resolveRef(data);
};
  
const Contract = () => {
  const [contracts, setContracts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [attachments, setAttachments] = useState({});
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("authToken");
  const [statusFilter, setStatusFilter] = useState('All');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileResponse = await fetch('https://bookrecaps.cloud/api/personal/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile data");
        }

        const profileData = await profileResponse.json();
        setUserId(profileData?.id);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [accessToken]);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(
          `https://bookrecaps.cloud/api/Contract/getallcontract`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );
        // console.log("Raw contract data:", response.data);
        
        const result = resolveRefs(response.data);
        // console.log("Resolved contract data:", result);
        // Filter contracts based on the userId
        const userContracts = result.data.$values.filter(contract => {
          //console.log("Contract data:", contract); // Log từng hợp đồng
          const publisher = contract.publisher;
          return publisher && publisher.userId === userId;
        });
        
        console.log("Filtered contracts:", userContracts); 
        setContracts(userContracts);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchContracts();
  }, [userId, accessToken]);


  // Fetch attachments for each contract
  useEffect(() => {
    const fetchAttachments = async (contractId) => {
      try {
        const response = await axios.get(
          `https://bookrecaps.cloud/api/contract-attachment/getallattachmentbycontractid/${contractId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );
        const result = resolveRefs(response.data);
        return result.data.$values;
      } catch (error) {
        console.error("Error fetching attachments", error);
        return [];
      }
    };

    // For each contract, fetch its attachments
    const fetchAllAttachments = async () => {
        const attachmentData = {};
        for (const contract of contracts) {
          const attachmentsForContract = await fetchAttachments(contract.id);
          attachmentData[contract.id] = attachmentsForContract;
        }
        setAttachments(attachmentData);
      };
  
      if (contracts.length > 0) {
        fetchAllAttachments();
      }
    }, [contracts, accessToken]);

    
  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return "Bản nháp";
      case 1: return "Đang xử lý";
      case 2: return "Chưa bắt đầu";
      case 3: return "Đang kích hoạt";
      case 4: return "Hết hạn";
      case 5: return "Từ chối";
      default: return "Unknown";
    }
  };
  
  // Filter contracts based on selected status
  const filteredContracts = statusFilter === 'All' 
  ? contracts 
  : contracts.filter(contract => getStatusLabel(contract.status) === statusFilter);

  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  const handleDetailClick = (contractId) => {
    navigate(`/contract-detail/${contractId}`);
  };

  return (
    <div className="contract-manager">
      <h2>Contract List</h2>
      {/* Status filter controls */}
      <div>
                <label htmlFor="status-filter">Filter by Status:</label>
                <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All</option>
                    <option value="Bản nháp">Bản nháp</option>
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                    <option value="Đang kích hoạt">Đang kích hoạt</option>
                    <option value="Hết hạn">Hết hạn</option>
                    <option value="Từ chối">Từ chối</option>

                </select>
            </div>

      <table className="contract-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Publisher Name</th>
            <th>Revenue Share</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Attachment Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredContracts.map((contract) => (
            <tr key={contract.id}>
              <td>{contract.id}</td>
              <td>{contract.publisher.publisherName || ""}</td>
              <td>{contract.revenueSharePercentage}%</td>
              <td>{new Date(contract.startDate).toLocaleDateString()}</td>
              <td>{new Date(contract.endDate).toLocaleDateString()}</td>
              <td className={`status ${getStatusLabel(contract.status).toLowerCase()}`}>
                {getStatusLabel(contract.status)}
              </td>
              <td>
                {/* Display attachment names for the current contract */}
                {attachments[contract.id]?.map((attachment, index) => (
                  <div key={index}>{attachment.name}</div>
                ))}
              </td>

              <td>
              <button onClick={() => handleDetailClick(contract.id)}>Detail</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Contract;
