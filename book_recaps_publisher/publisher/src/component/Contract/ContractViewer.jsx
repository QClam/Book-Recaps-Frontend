import React, { useEffect, useState } from 'react';
import * as mammoth from 'mammoth'; 
import './ContractViewer.scss'; 

const ContractViewer = () => {
  const [contractContent, setContractContent] = useState('');

  useEffect(() => {
    const loadContract = async () => {
      const response = await fetch('/HỢP ĐỒNG.docx'); 
      const arrayBuffer = await response.arrayBuffer();

      mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
        .then((result) => {
          setContractContent(result.value); 
        })
        .catch((err) => console.log(err));
    };

    loadContract(); 
  }, []);

  return (
    <div className="contract-viewer">
      <h1 className="contract-title">Nội dung Hợp Đồng</h1>
      <div className="contract-content" dangerouslySetInnerHTML={{ __html: contractContent }} />
    </div>
  );
};

export default ContractViewer;
