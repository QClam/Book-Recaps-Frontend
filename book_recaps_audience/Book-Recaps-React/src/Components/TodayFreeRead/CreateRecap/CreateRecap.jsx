// CreateRecap.jsx
import React, { useState } from 'react';
import axios from 'axios';
import './CreateRecap.scss'; // SCSS for styling

function CreateRecap() {
  const [bookId, setBookId] = useState('');
  const [recapVersionId, setRecapVersionId] = useState('');
  const [isRecapCreated, setIsRecapCreated] = useState(false);
  const [keyIdeas, setKeyIdeas] = useState([
    {
      title: '',
      body: '',
      image: '',
      order: 1,
    },
  ]);
  const [currentStep, setCurrentStep] = useState(1); // Manage current step

  const totalSteps = 4; // Total number of steps

  const authToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMTQ5ZWE4YS02MjE5LTQ2MzQtOWViOC00MzAyYjllNDhkN2MiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjhkMGFlYzdhLWZlZDEtNDFiZi1kYTQxLTA4ZGNlMmRjOTAyYSIsImVtYWlsIjoiY29udHJpYnV0b3JAcm9vdC5jb20iLCJzdWIiOiJjb250cmlidXRvckByb290LmNvbSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL21vYmlsZXBob25lIjoiMDk0MjcwNTYwNSIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJjb250cmlidXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2dpdmVubmFtZSI6ImNvbnRyaWJ1dG9yIiwiaXBBZGRyZXNzIjoiMTI1LjIzNS4yMzguMTgxIiwiaW1hZ2VfdXJsIjoiRmlsZXMvSW1hZ2UvanBnL2FkLmpwZyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNvbnRyaWJ1dG9yIiwiZXhwIjoxNzI4MDM3NDQyLCJpc3MiOiJodHRwczovL2xvY2FsaG9zdDo3MTI0IiwiYXVkIjoiYm9va3JlY2FwIn0.2pxH0Wl60kyv6b2iIB16ky1EuZbyt5oMfKV0c9WkWDg'; // Replace with dynamic token if possible

  const handleBookSelection = async (selectedBookId) => {
    try {
      const response = await axios.post(
        'https://160.25.80.100:7124/api/recap',
        {
          isPublished: true,
          isPremium: true,
          bookId: selectedBookId,
          contributorId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
        {
          headers: {
            Authorization: authToken,
          },
        }
      );
      setBookId(selectedBookId);
      setRecapVersionId(response.data.recapVersionId);
      setIsRecapCreated(true);
      setCurrentStep(1); // Step 1 after selecting a book
    } catch (error) {
      console.error("Error creating recap:", error);
      alert("Đã xảy ra lỗi khi tạo recap. Vui lòng thử lại.");
    }
  };

  const handleInputChange = (index, e) => {
    const updatedKeyIdeas = [...keyIdeas];
    updatedKeyIdeas[index][e.target.name] = e.target.value;
    setKeyIdeas(updatedKeyIdeas);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await Promise.all(
        keyIdeas.map(async (idea) => {
          await axios.post(
            'https://160.25.80.100:7124/api/keyidea/createkeyidea',
            {
              title: idea.title,
              body: idea.body,
              image: idea.image,
              order: idea.order,
              RecapVersionId: recapVersionId,
            },
            {
              headers: {
                Authorization: authToken,
              }
            }
          );
        })
      );
      alert("Key Ideas Created Successfully!");
      setCurrentStep(2); // Move to Step 2 after submitting form
    } catch (error) {
      console.error("Error creating key idea:", error);
      alert("Đã xảy ra lỗi khi tạo key idea. Vui lòng thử lại.");
    }
  };

  const addAnotherKeyIdea = () => {
    setKeyIdeas([
      ...keyIdeas,
      { title: '', body: '', image: '', order: keyIdeas.length + 1 },
    ]);
  };

  // ProgressBar Component with 4 steps
  const ProgressBar = () => {
    return (
      <div className="progress-bar">
        {[1, 2, 3, 4].map((step) => (
          <React.Fragment key={step}>
            <div className={`progress-step ${currentStep >= step ? 'active' : ''}`}>
              <div className="step-number">{step}</div>
              <div className="step-title">
                {step === 1 && 'Create Recaps'}
                {step === 2 && 'Staff Approval'}
                {step === 3 && 'Published'}
                {step === 4 && 'Other (Hide/Delete/Copyright)'}
              </div>
            </div>
            {step < totalSteps && <div className="progress-line"></div>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Render different content based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <button onClick={() => handleBookSelection('3fa85f64-5717-4562-b3fc-2c963f66afa6')}>
              Chọn Sách
            </button>

            {isRecapCreated && (
              <form onSubmit={handleFormSubmit}>
                {keyIdeas.map((idea, index) => (
                  <div key={index}>
                    <h2>Key Idea {index + 1}</h2>
                    <div className="form-group">
                      <label>Nhập tiêu đề key idea (tối đa 150 ký tự)</label>
                      <input
                        type="text"
                        name="title"
                        value={idea.title}
                        onChange={(e) => handleInputChange(index, e)}
                        placeholder="Nhập tiêu đề key idea"
                        maxLength={150}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Nhập nội dung key idea (tối đa 3000 ký tự)</label>
                      <textarea
                        name="body"
                        value={idea.body}
                        onChange={(e) => handleInputChange(index, e)}
                        placeholder="Nhập nội dung key idea"
                        maxLength={3000}
                        required
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label>Tải ảnh lên (không bắt buộc):</label>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={(e) => handleInputChange(index, e)}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-key-idea-btn"
                  onClick={addAnotherKeyIdea}
                >
                  Thêm Key Idea Khác
                </button>
                <button type="submit" className="submit-btn">
                  Gửi Recap
                </button>
              </form>
            )}
          </>
        );

      case 2:
        return (
          <div className="staff-approval">
            <h2>Đang chờ phê duyệt từ nhân viên</h2>
            <p>Recap của bạn đã được gửi và đang chờ phê duyệt. Vui lòng chờ trong giây lát.</p>
            {/* Optional: Add a loader or spinner */}
            <div className="loader"></div>
          </div>
        );

      case 3:
        return (
          <div className="published">
            <h2>Recap đã được xuất bản!</h2>
            <p>Cảm ơn bạn đã tạo Recap. Nó đã được phê duyệt và xuất bản thành công.</p>
            {/* Optional: Add buttons to navigate or perform other actions */}
          </div>
        );

      case 4:
        return (
          <div className="other-actions">
            <h2>Quản lý Recap</h2>
            <p>Bạn có thể ẩn, xóa hoặc quản lý bản quyền cho Recap của mình.</p>
            {/* Add relevant actions or links */}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="create-recap-container">
      <h1>Quy Trình Tạo Recap</h1>
      <ProgressBar />
      {renderStepContent()}
    </div>
  );
}

export default CreateRecap;
