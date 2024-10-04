import React, { useState } from 'react';
//import ContractViewer from './ContractViewer'; // Import component hiển thị hợp đồng

const ContractList = () => {
  const contracts = [
    { id: 1, title: 'Hợp đồng 1', file: '/HỢP ĐỒNG.docx' },
    { id: 2, title: 'Hợp đồng 2', file: '/HỢP ĐỒNG XUẤT BẢN SÁCH.docx' },
    
  ];

  const [selectedContract, setSelectedContract] = useState(null); // Trạng thái để lưu hợp đồng được chọn

  return (
    <div className="contract-list">
      <h1>Danh sách Hợp đồng</h1>
      <ul>
        {contracts.map((contract) => (
          <li key={contract.id} onClick={() => setSelectedContract(contract)}>
            {contract.title}
          </li>
        ))}
      </ul>

      {/* Hiển thị hợp đồng được chọn */}
      {selectedContract && (
        <ContractViewer file={selectedContract.file} />
      )}
    </div>
  );
};

export default ContractList;
