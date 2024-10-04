import React, { useEffect, useState } from 'react';
import * as mammoth from 'mammoth'; // Import mammoth để đọc file Word
import './ContractViewer.scss'; // Import file SCSS

const ContractViewer = () => {
  const [contractContent, setContractContent] = useState('');

  useEffect(() => {
    const loadContract = async () => {
      const response = await fetch('/HỢP ĐỒNG.docx'); // Đường dẫn đến file Word trong thư mục public
      const arrayBuffer = await response.arrayBuffer();

      mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
        .then((result) => {
          setContractContent(result.value); // Lưu nội dung HTML vào state
        })
        .catch((err) => console.log(err));
    };

    loadContract(); // Gọi hàm đọc nội dung
  }, []);

  return (
    <div className="contract-viewer">
      <h1 className="contract-title">Nội dung Hợp Đồng</h1>
      <div className="contract-content" dangerouslySetInnerHTML={{ __html: contractContent }} />
    </div>
  );
};

export default ContractViewer;
