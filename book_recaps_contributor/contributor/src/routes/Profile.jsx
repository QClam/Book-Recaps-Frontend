import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/Auth";
import { axiosInstance } from "../utils/axios";
import { useToast } from "../contexts/Toast";
import { routes } from "../routes";
import { Dialog } from "primereact/dialog";

const Profile = () => {
  const navigate = useNavigate(); // Create a navigate function
  const [ profile, setProfile ] = useState(null); // State to store profile data
  const [ isModalOpen, setModalOpen ] = useState(false); // Modal state
  const [ updatedProfile, setUpdatedProfile ] = useState({
    fullName: '',
    gender: 0,
    birthDate: '',
    address: '',
    bankAccount: '',
  });

  const [ phoneUpdateModalOpen, setPhoneUpdateModalOpen ] = useState(false);
  const [ phoneUpdate, setPhoneUpdate ] = useState({
    userId: '',
    phoneNumber: '',
    password: '',
  });
  const [ passwordData, setPasswordData ] = useState({
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [ currentTab, setCurrentTab ] = useState('profile');
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log(user)
        const data = user.profileData

        if (data) { // Check if data exists
          setProfile(data); // Set profile directly
          setUpdatedProfile({
            fullName: data.fullName || '', // Access properties directly
            gender: data.gender || 0,
            birthDate: data.birthDate || '',
            address: data.address || '',
            bankAccount: data.bankAccount || '',
          });
        } else {
          console.error('Profile data is not available');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const handleUpdateProfile = async () => {
    try {
      const response = await axiosInstance.put('/api/personal/profile', {
        fullName: updatedProfile.fullName,
        gender: parseInt(updatedProfile.gender, 10), // Ensure gender is sent as an integer
        birthDate: updatedProfile.birthDate || null, // Ensure correct date format
        address: updatedProfile.address,
        bankAccount: updatedProfile.bankAccount,
      });

      const result = await response.data;

      console.log('Profile updated successfully!', result);
      showToast({ severity: 'success', summary: 'Success', detail: 'Cập nhật thông tin thành công!' });
      setProfile({ ...result.data, imageUrl: profile.imageUrl }); // Update profile in state
      setModalOpen(false); // Close modal

    } catch (error) {
      console.error('Error updating profile:', error);
      showToast({ severity: 'error', summary: 'Error', detail: 'Cập nhật thông tin thất bại!' });
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
      showToast({ severity: 'success', summary: 'Success', detail: 'Cập nhật số điện thoại thành công!' });
      setPhoneUpdateModalOpen(false); // Close phone update modal

      // Refetch the profile to update the state with the correct data
      await fetchProfile();  // Ensure the latest profile data is fetched
    } catch (error) {
      console.error('Error updating phone number:', error);
      // toast.error('Cập nhật số điện thoại thất bại!');
      showToast({ severity: 'error', summary: 'Error', detail: 'Cập nhật số điện thoại thất bại!' });
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/api/personal/profile');

      const data = await response.data;
      setUser({
        ...user,
        name: data.userName,
        email: data.email,
        profileData: data
      })
      // Set profile data
      setProfile(data);
      setUpdatedProfile({
        fullName: data.fullName || '',
        gender: data.gender || '',
        birthDate: data.birthDate || '',
        address: data.address || '',
        bankAccount: data.bankAccount || ''
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
      // toast.success('Thay đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      showToast({
        severity: 'success',
        summary: 'Success',
        detail: 'Thay đổi mật khẩu thành công! Vui lòng đăng nhập lại.'
      });

      // Đăng xuất khỏi các phiên làm việc cũ, nếu có
      await axiosInstance.post('/api/personal/logout');
      navigate(routes.logout);
    } catch (error) {
      console.error('Error updating password:', error);
      // toast.error('Thay đổi mật khẩu thất bại');
      showToast({ severity: 'error', summary: 'Error', detail: 'Thay đổi mật khẩu thất bại' });
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-nav">
        <ul>
          <li className={currentTab === 'profile' ? 'active' : ''} onClick={() => handleTabChange('profile')}>
            Hồ sơ
          </li>
          <li
            className={currentTab === 'password' ? 'active' : ''}
            onClick={() => handleTabChange('password')}
          >
            Mật khẩu
          </li>
        </ul>
      </div>
      <div className="settings-content">
        {currentTab === 'profile' && (
          <div>
            <h2 className="font-semibold">Thông tin cơ bản</h2>
            {profile ? (
              <div className="info-group">
                <div className="info-item">
                  <label>Họ tên</label>
                  <span>{profile.fullName || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Username</label>
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
                  <label>Thông tin ngân hàng</label>
                  <span>{profile.bankAccount || "N/A"}</span>
                </div>
              </div>
            ) : (
              <p>Loading profile...</p>
            )}
            <button className="update-button" onClick={() => setModalOpen(true)}>
              Cập nhật thông tin cá nhân
            </button>

            <button className="update-button" onClick={() => setPhoneUpdateModalOpen(true)}>
              Cập nhật số điện thoại
            </button>

            <Dialog
              visible={isModalOpen}
              onHide={() => setModalOpen(false)}
              content={({ hide }) => (
                <div className="modal">
                  <div className="modal-content mx-auto">
                    <h3 className="!font-semibold mb-4">Cập nhật thông tin</h3>
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
                    <div className="form-group">
                      <label className="!font-normal">Thông tin ngân hàng</label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={updatedProfile.bankAccount}
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
                    <h3 className="!font-semibold mb-4">Cập nhật số điện thoại</h3>
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
            <h2 className="font-semibold">Thay đổi mật khẩu</h2>
            <div className="form-group">
              <label className="!font-normal">Mật khẩu hiện tại</label>
              <input
                type="password"
                name="password"
                autoComplete="off"
                value={passwordData.password}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label className="!font-normal">Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <div className="form-group">
              <label className="!font-normal">Nhập lại mật khẩu mới</label>
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
              />
            </div>
            <button className="update-button" onClick={handleUpdatePassword}>Lưu thay đổi</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile