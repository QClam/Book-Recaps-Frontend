import { useEffect, useRef, useState } from 'react';
import './Settings.scss';
import { useLocation, useNavigate } from 'react-router-dom';
import _ from "lodash";
import { axiosInstance } from "../../utils/axios";
import { useAuth } from "../../contexts/Auth";
import { useToast } from "../../contexts/Toast";
import { routes } from "../../routes";
import { Dialog } from "primereact/dialog";

function Settings() {
  const navigate = useNavigate(); // Create a navigate function
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [ profile, setProfile ] = useState(user.profileData); // State to store profile data
  const [ isModalOpen, setModalOpen ] = useState(false); // Modal state
  const [ updatedProfile, setUpdatedProfile ] = useState({
    fullName: user.profileData.fullName || '',
    gender: user.profileData.gender || 0,
    birthDate: user.profileData.birthDate || '',
    address: user.profileData.address || '',
  });

  const [ phoneUpdateModalOpen, setPhoneUpdateModalOpen ] = useState(false);
  const [ phoneUpdate, setPhoneUpdate ] = useState({
    userId: '',
    phoneNumber: user.profileData.phoneNumber || '',
    password: '',
  });
  const [ passwordModalOpen, setPasswordModalOpen ] = useState(false);
  const [ passwordData, setPasswordData ] = useState({
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [ currentTab, setCurrentTab ] = useState('profile');
  const [ imageUpdateModalOpen, setImageUpdateModalOpen ] = useState(false)
  const [ imageFile, setImageFile ] = useState(null); // New state to store selected image file
  const [ imageUploadLoading, setImageUploadLoading ] = useState(false);
  const [ publisher, setPublisher ] = useState(user.publisherData);
  const [ updatePublisherModalOpen, setUpdatePublisherModalOpen ] = useState(false);
  const [ publisherUpdate, setPublisherUpdate ] = useState({
    publisherName: user.publisherData.publisherName || '',
    contactInfo: user.publisherData.contactInfo || '',
    bankAccount: user.publisherData.bankAccount || '',
    revenueSharePercentage: user.publisherData.revenueSharePercentage || 0,
  });
  const [ updatingPublisher, setUpdatingPublisher ] = useState(false);
  const [ passwordVisible, setPasswordVisible ] = useState(false); // State để quản lý xem mật khẩu
  const [ password, setPassword ] = useState(""); // State để lưu mật khẩu
  const mounted = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (!_.isEqual(user.profileData, profile) && mounted.current) {
      window.location.reload();
    }
    mounted.current = true;
  }, [ location ]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleUpdatePublisherInfo = async () => {
    setUpdatingPublisher(true);
    try {
      const response = await axiosInstance.put(`/api/publisher/updatepublisherinfo/${publisher.id}`, publisherUpdate);

      const updatedPublisher = response.data;
      // console.log('Publisher updated:', updatedPublisher);

      setPublisher(updatedPublisher); // Cập nhật state với thông tin mới
      setUser({ ...user, publisherData: updatedPublisher }); // Cập nhật thông tin NXB trong user context
      setUpdatePublisherModalOpen(false); // Đóng modal
      setUpdatingPublisher(false);
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Publisher info updated successfully!',
      });
    } catch (error) {
      console.error('Error updating publisher info:', error);
      setUpdatingPublisher(false);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!updatedProfile.fullName) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Full Name is required',
      });
      return;
    }

    try {
      const response = await axiosInstance.put('/api/personal/profile', {
        fullName: updatedProfile.fullName,
        gender: parseInt(updatedProfile.gender, 10), // Ensure gender is sent as an integer
        birthDate: updatedProfile.birthDate || null, // Ensure correct date format
        address: updatedProfile.address || null,
      });

      const result = response.data;

      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully!',
      });
      setProfile({ ...result.data, imageUrl: profile.imageUrl }); // Update profile in state
      setModalOpen(false); // Close modal
      setUser({
        ...user,
        name: result.data.fullName,
        email: result.data.email,
        profileData: {
          ...result.data,
          subscriptions: { ...user.profileData.subscriptions }
        }
      })
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update profile. Please try again.',
      });
    }
  };

  // Handle phone number input changes
  const handlePhoneInputChange = (e) => {
    const { name, value } = e.target;
    setPhoneUpdate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle phone update
  const handleUpdatePhone = async () => {
    try {
      await axiosInstance.put('/api/personal/update-phone', phoneUpdate);
      console.log('Phone number updated successfully!');
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Phone number updated successfully!',
      });
      setPhoneUpdateModalOpen(false); // Close phone update modal

      // Refetch the profile to update the state with the correct data
      await fetchProfile();  // Ensure the latest profile data is fetched
    } catch (error) {
      console.error('Error updating phone number:', error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update phone number!',
      });
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/api/personal/profile');

      const data = await response.data;
      // Set profile data
      setProfile(data);
      setUser({
        ...user,
        name: data.fullName,
        email: data.email,
        profileData: {
          ...data,
          subscriptions: { ...user.profileData.subscriptions }
        }
      })
      setUpdatedProfile({
        fullName: data.fullName || '',
        gender: data.gender || 0,
        birthDate: data.birthDate || '',
        address: data.address || '',
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password update
  const handleUpdatePassword = async () => {
    try {
      await axiosInstance.put('/api/personal/update-password', passwordData);

      // Nếu không có lỗi, thông báo thành công
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Password updated successfully! Please login again.',
      });

      // Đăng xuất khỏi các phiên làm việc cũ, nếu có
      await axiosInstance.post('/api/personal/logout');
      navigate(routes.logout);
    } catch (error) {
      console.error('Error updating password:', error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update password!',
      });
    }
  };

  // Handle Image File Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  // Handle Image Upload
  const handleUpdateImage = async () => {
    if (!imageFile) {
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select an image file first!',
      });
      return;
    }

    const formData = new FormData();
    formData.append('UserId', user.id);
    formData.append('Image', imageFile); // Add the image file
    formData.append('DeleteCurrentImage', false); // Modify based on your logic

    try {
      setImageUploadLoading(true);
      await axiosInstance.put('/api/personal/update-avatar', formData);
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile image updated successfully!',
      });

      // Gọi lại fetchProfile để cập nhật lại thông tin profile sau khi ảnh được cập nhật
      await fetchProfile();

      // // Cập nhật profile trong state
      // setProfile(result.data);

    } catch (error) {
      console.error('Error updating profile image:', error);
      showToast({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update profile image!',
      });
    } finally {
      setImageUploadLoading(false);
      setImageUpdateModalOpen(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-nav">
        <ul>
          <li className={currentTab === 'profile' ? 'active' : ''} onClick={() => handleTabChange('profile')}>Profile
          </li>
          {/* <li className={currentTab === 'password' ? 'active' : ''} onClick={() => handleTabChange('password')}>Password</li> */}

        </ul>
      </div>
      <div className="settings-content">
        {currentTab === 'profile' && (
          <div>
            <h2>Thông tin NXB</h2>
            {publisher ? (
              <div className="info-group">
                <div className="info-item">
                  <label>Tên NXB</label>
                  <span>{publisher.publisherName || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Thông tin liên lạc</label>
                  <span>{publisher.contactInfo || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Số tài khoản</label>
                  <span>{publisher.bankAccount || "N/A"}</span>
                </div>
              </div>
            ) : (
              <p>Loading publisher info...</p>
            )}
            {profile ? (
              <div className="info-group">
                <div className="info-item">
                  <label>Họ Tên</label>
                  <span>{profile.fullName || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Tên</label>
                  <span>{profile.userName || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <span>{profile.email || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Địa chỉ</label>
                  <span>{profile.address || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Số điện thoại</label>
                  <span>{profile.phoneNumber || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Giới tính</label>
                  <span>{profile.gender === 0 ? "Nữ" : profile.gender === 1 ? "Nam" : "Khác"}</span>
                </div>
                <div className="info-item">
                  <label>Ngày tháng năm sinh</label>
                  <span>{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Hình</label>
                  {profile.imageUrl ? (
                    <img src={profile.imageUrl} alt="Profile" className="profile-image"/>
                  ) : (
                    <span>No Image Available</span>
                  )}
                </div>
                {/* Image Upload Section */}
                {/* <div>
                    <h3>Update Profile Image</h3>
                    <input type="file" onChange={handleImageChange} accept="image/*" />
                    <button onClick={handleUpdateImage} disabled={imageUploadLoading}>
                        {imageUploadLoading ? 'Uploading...' : 'Upload'}
                    </button>

                    {profile.avatar && (
                        <div className="profile-image-preview">
                            <img src={profile.avatar} alt="Profile" />
                        </div>
                    )}
                </div> */}


              </div>
            ) : (
              <p>Loading profile...</p>
            )}


            <button className="update-button" onClick={() => setModalOpen(true)}>
              Cập nhật thông tin
            </button>

            <button className="update-button" onClick={() => setPhoneUpdateModalOpen(true)}>
              Cập nhật Số điện thoại
            </button>

            <button className="update-button" onClick={() => setImageUpdateModalOpen(true)}>Cập nhật hình</button>

            <button className="update-button" onClick={() => setUpdatePublisherModalOpen(true)}>Cập nhật thông tin NXB
            </button>

            <Dialog
              visible={isModalOpen}
              onHide={() => {
                setUpdatedProfile({
                  fullName: user.profileData.fullName || '',
                  gender: user.profileData.gender || 0,
                  birthDate: user.profileData.birthDate || '',
                  address: user.profileData.address || '',
                })
                setModalOpen(false)
              }}
              content={({ hide }) => (
                <div className="modal">
                  <div className="modal-content mx-auto">
                    <h3 className="!font-semibold">Cập nhật thông tin</h3>
                    <div className="form-group">
                      <label className="!font-normal">Họ tên</label>
                      <input
                        type="text"
                        name="fullName"
                        value={updatedProfile.fullName}
                        onChange={handleInputChange}
                        className="!mb-0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="!font-normal">Giới tính</label>
                      <select
                        name="gender"
                        value={updatedProfile.gender}
                        onChange={handleInputChange}
                      >
                        <option value={0}>Female</option>
                        <option value={1}>Male</option>
                        <option value={2}>Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="!font-normal">Ngày sinh</label>
                      <input
                        type="date"
                        name="birthDate"
                        value={updatedProfile.birthDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="!font-normal">Địa chỉ</label>
                      <input
                        type="text"
                        name="address"
                        value={updatedProfile.address}
                        onChange={handleInputChange}
                        className="!mb-0"
                      />
                    </div>
                    <div className="flex gap-2 items-center justify-end !mb-0">
                      <button
                        className="bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300"
                        onClick={hide}
                      >
                        Hủy
                      </button>
                      <button
                        className="text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700"
                        onClick={handleUpdateProfile}
                      >
                        Cập nhật
                      </button>
                    </div>
                  </div>
                </div>
              )}
            />

            <Dialog
              visible={phoneUpdateModalOpen}
              onHide={() => setPhoneUpdateModalOpen(false)}
              content={({ hide }) => (
                <div className="modal">
                  <div className="modal-content mx-auto">
                    <h3 className="!font-semibold">Cập nhật số điện thoại</h3>
                    <div className="form-group">
                      <label className="!font-normal">Số điện thoại</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={phoneUpdate.phoneNumber}
                        onChange={handlePhoneInputChange}
                        className="!mb-0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="!font-normal">Nhập mật khẩu</label>
                      <input
                        type="password"
                        name="password"
                        value={phoneUpdate.password}
                        onChange={handlePhoneInputChange}
                      />
                    </div>
                    <div className="flex gap-2 items-center justify-end !mb-0">
                      <button
                        className="bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300"
                        onClick={hide}
                      >
                        Hủy
                      </button>
                      <button
                        className="text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700"
                        onClick={handleUpdatePhone}
                      >
                        Cập nhật
                      </button>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        )}


        {currentTab === 'password' && (
          <div>
            <h2>Update Password</h2>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <button onClick={handleUpdatePassword}>Cập nhật mật khẩu</button>
          </div>
        )}


        {/* Image Update Modal */}
        <Dialog
          visible={imageUpdateModalOpen}
          onHide={() => setImageUpdateModalOpen(false)}
          content={({ hide }) => (
            <div className="modal">
              <div className="modal-content mx-auto">
                <h3>Cập nhật ảnh đại diện</h3>
                <input type="file" accept="image/*" onChange={handleImageChange}/>

                <div className="flex gap-2 items-center justify-end !mb-0 mt-4">
                  <button
                    className="bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300"
                    onClick={hide}
                    disabled={imageUploadLoading}
                  >
                    Hủy
                  </button>
                  <button
                    className="text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700"
                    onClick={handleUpdateImage}
                    disabled={imageUploadLoading}
                  >
                    {imageUploadLoading ? 'Uploading...' : 'Cập nhật'}
                  </button>
                </div>
              </div>
            </div>
          )}
        />

        <Dialog
          visible={updatePublisherModalOpen}
          onHide={() => setUpdatePublisherModalOpen(false)}
          content={({ hide }) => (
            <div className="modal">
              <div className="modal-content mx-auto">
                <h3>Cập nhật thông tin NXB</h3>
                <div className="form-group">
                  <label>Tên NXB</label>
                  <input
                    type="text"
                    name="publisherName"
                    value={publisherUpdate.publisherName}
                    onChange={(e) => setPublisherUpdate({ ...publisherUpdate, publisherName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Thông tin liên lạc</label>
                  <input
                    type="email"
                    name="contactInfo"
                    value={publisherUpdate.contactInfo}
                    onChange={(e) => setPublisherUpdate({ ...publisherUpdate, contactInfo: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Số tài khoản</label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={publisherUpdate.bankAccount}
                    onChange={(e) => setPublisherUpdate({ ...publisherUpdate, bankAccount: e.target.value })}
                  />
                </div>

                <div className="flex gap-2 items-center justify-end !mb-0 mt-4">
                  <button
                    className="bg-gray-200 rounded py-1.5 px-3 border font-semibold hover:bg-gray-300"
                    onClick={hide}
                    disabled={updatingPublisher}
                  >
                    Hủy
                  </button>
                  <button
                    className="text-white bg-indigo-600 rounded py-1.5 px-3 border font-semibold hover:bg-indigo-700"
                    onClick={handleUpdatePublisherInfo}
                    disabled={updatingPublisher}
                  >
                    {updatingPublisher ? 'Uploading...' : 'Cập nhật'}
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}

export default Settings;
