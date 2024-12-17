import { useEffect, useRef, useState } from 'react';
import './Settings.scss';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { routes } from "../../routes";
import { useAuth } from "../../contexts/Auth";
import { axiosInstance } from "../../utils/axios";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import _ from "lodash";

function Settings() {
  const navigate = useNavigate(); // Create a navigate function
  const { user, setUser } = useAuth();
  const [ profile, setProfile ] = useState(user.profileData); // State to store profile data
  const [ isModalOpen, setModalOpen ] = useState(false); // Modal state
  const [ updatedProfile, setUpdatedProfile ] = useState({
    fullName: user.profileData.fullName || '',
    gender: user.profileData.gender || 0,
    birthDate: user.profileData.birthDate || '',
    address: user.profileData.address || '',
    bankAccount: user.profileData.bankAccount || '',
  });

  const [ phoneUpdateModalOpen, setPhoneUpdateModalOpen ] = useState(false);
  const [ phoneUpdate, setPhoneUpdate ] = useState({
    userId: '',
    phoneNumber: user.profileData.phoneNumber || '',
    password: '',
  });
  const [ passwordData, setPasswordData ] = useState({
    password: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [ currentTab, setCurrentTab ] = useState('profile');
  const [ imageUpdateModalOpen, setImageUpdateModalOpen ] = useState(false)
  const [ imageFile, setImageFile ] = useState(null); // New state to store selected image file
  const [ imageUploadLoading, setImageUploadLoading ] = useState(false);
  const [ subscriptionPackageName, setSubscriptionPackageName ] = useState('');
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

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = user.profileData

        if (data) {
          // Fetch subscription package if available
          if (data.subscriptions && data.subscriptions.$values.length > 0) {
            const subscriptionPackageId = data.subscriptions.$values[0].subscriptionPackageId;
            fetchSubscriptionPackage(subscriptionPackageId); // Fetch subscription package name
          }
        } else {
          console.error('Profile data is not available');
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch subscription package name based on subscriptionPackageId
  const fetchSubscriptionPackage = async (subscriptionPackageId) => {
    try {
      const response = await axiosInstance.get(`/api/subscriptionpackages/getpackagebyid/${subscriptionPackageId}`);

      const packageData = response.data;
      if (packageData && packageData.data) {
        setSubscriptionPackageName(packageData.data.name); // Set the subscription package name
      }
    } catch (error) {
      console.error('Error fetching subscription package:', error);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    // Log the form data to verify what is being sent
    if (!updatedProfile.fullName) {
      toast.error('Vui lòng nhập họ tên!');
      return;
    }

    try {
      const response = await axiosInstance.put('/api/personal/profile', {
        fullName: updatedProfile.fullName,
        gender: parseInt(updatedProfile.gender, 10), // Ensure gender is sent as an integer
        birthDate: updatedProfile.birthDate || null, // Ensure correct date format
        address: updatedProfile.address || null,
        bankAccount: updatedProfile.bankAccount || null,
      });

      const result = response.data;

      // console.log('Profile updated successfully!', result);
      toast.success('Cập nhật thông tin thành công!');
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
      toast.error('Cập nhật thông tin thất bại!');
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
      toast.success('Cập nhật số điện thoại thành công!');
      setPhoneUpdateModalOpen(false); // Close phone update modal

      // Refetch the profile to update the state with the correct data
      await fetchProfile();  // Ensure the latest profile data is fetched
    } catch (error) {
      console.error('Error updating phone number:', error);
      toast.error('Cập nhật số điện thoại thất bại!');
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
      toast.success('Thay đổi mật khẩu thành công! Vui lòng đăng nhập lại.');

      // Đăng xuất khỏi các phiên làm việc cũ, nếu có
      await axiosInstance.post('/api/personal/logout');
      navigate(routes.logout);
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Thay đổi mật khẩu thất bại');
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
      toast.error('Vui lòng chọn một hình ảnh!');
      return;
    }

    const formData = new FormData();
    formData.append('UserId', user.id);
    formData.append('Image', imageFile); // Add the image file
    formData.append('DeleteCurrentImage', false); // Modify based on your logic

    try {
      setImageUploadLoading(true);
      await axiosInstance.put('/api/personal/update-avatar', formData);
      toast.success('Cập nhật ảnh đại diện thành công!');

      // Gọi lại fetchProfile để cập nhật lại thông tin profile sau khi ảnh được cập nhật
      await fetchProfile();

      // // Cập nhật profile trong state
      // setProfile(result.data);

    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error('Cập nhật ảnh đại diện thất bại!');
    } finally {
      setImageUploadLoading(false);
      setImageUpdateModalOpen(false);
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

          <li><Link to={routes.billing}>Đăng ký gói</Link></li>
          <li>
            <Link to={routes.subscriptionHistory}>Lịch sử đăng ký gói</Link>
          </li>
          <li>
            <Link to={routes.supportTickets}>Đơn báo cáo</Link>
          </li>
          <li>
            <Link to={routes.becomeContributor}>Trở thành Contributor</Link>
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
                  <label>Giới tính</label>
                  <span>{profile.gender === 0 ? "Nữ" : profile.gender === 1 ? "Nam" : "Khác"}</span>
                </div>
                <div className="info-item">
                  <label>Ngày sinh</label>
                  <span>{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Gói đăng ký</label>
                  <span>{subscriptionPackageName || "No subscription"}</span> {/* Display subscription package name */}
                </div>
                <div className="info-item">
                  <label>Thông tin ngân hàng</label>
                  <span>{profile.bankAccount || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Hình đại diện</label>
                  <img src={profile.imageUrl?.replace("Files/Image/jpg/ad.jpg", "") || '/avatar-placeholder.png'}
                       alt="Profile" className="profile-image"/>
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
              Cập nhật thông tin cá nhân
            </button>

            <button className="update-button" onClick={() => setPhoneUpdateModalOpen(true)}>
              Cập nhật số điện thoại
            </button>

            <button className="update-button" onClick={() => setImageUpdateModalOpen(true)}>
              Cập nhật ảnh đại diện
            </button>

            <Dialog
              visible={isModalOpen}
              onHide={() => {
                setUpdatedProfile({
                  fullName: user.profileData.fullName || '',
                  gender: user.profileData.gender || 0,
                  birthDate: user.profileData.birthDate || '',
                  address: user.profileData.address || '',
                  bankAccount: user.profileData.bankAccount || '',
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
      </div>
    </div>
  );
}

export default Settings;
