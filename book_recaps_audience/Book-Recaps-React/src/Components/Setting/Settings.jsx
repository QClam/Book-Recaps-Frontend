import React, { useEffect, useState } from 'react';
import './Settings.scss';
import { useNavigate } from 'react-router-dom';
import { routes } from "../../routes";

function Settings() {
    const navigate = useNavigate(); // Create a navigate function
    const [profile, setProfile] = useState(null); // State to store profile data
    const [isModalOpen, setModalOpen] = useState(false); // Modal state
    const [updatedProfile, setUpdatedProfile] = useState({
        fullName: '',
        gender: '',
        birthDate: '',
        address: '',
    });

    const [phoneUpdateModalOpen, setPhoneUpdateModalOpen] = useState(false);
    const [phoneUpdate, setPhoneUpdate] = useState({
        userId: '',
        phoneNumber: '',
        password: '',
    });
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        password: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [currentTab, setCurrentTab] = useState('profile');
    const [imageUpdateModalOpen, setImageUpdateModalOpen] = useState(false)
    const [imageFile, setImageFile] = useState(null); // New state to store selected image file
    const [imageUploadLoading, setImageUploadLoading] = useState(false);
    const [subscriptionPackageName, setSubscriptionPackageName] = useState('');

    const handleViewApplication = () => {
        navigate('/application'); // Navigate to the Application route
    };

    const handleViewBilling = () => {
        navigate('/billing'); // Navigate to the Billing route
    };

    const handleBecomeContributor = () => {
        navigate('/become-contributor');
    }
     // Handle tab change
     const handleTabChange = (tab) => {
        setCurrentTab(tab);
    };

    const handleViewSubcriptionHistory = () => {
        navigate('/subscription-history');
    };

    
    // Fetch user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            const accessToken = localStorage.getItem('authToken');
            try {
                const response = await fetch('https://bookrecaps.cloud/api/personal/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });
    
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
    
                const data = await response.json();
                console.log('Fetched profile data:', data); // Log the data to inspect its structure
                
                if (data) { // Check if data exists
                    setProfile(data); // Set profile directly
                    setUpdatedProfile({
                        fullName: data.fullName || '', // Access properties directly
                        gender: data.gender || '',
                        birthDate: data.birthDate || '',
                        address: data.address || '',
                    });
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
    const accessToken = localStorage.getItem('authToken');
    try {
        const response = await fetch(`https://bookrecaps.cloud/api/subscriptionpackages/getpackagebyid/${subscriptionPackageId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const packageData = await response.json();
        if (packageData && packageData.data) {
            setSubscriptionPackageName(packageData.data.name); // Set the subscription package name
        }
    } catch (error) {
        console.error('Error fetching subscription package:', error);
    }
};


    // Handle profile update
    const handleUpdateProfile = async () => {
        const accessToken = localStorage.getItem('authToken');
        
        // Log the form data to verify what is being sent
        console.log('Updated profile data:', updatedProfile);
    
        try {
            const response = await fetch('https://bookrecaps.cloud/api/personal/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: updatedProfile.fullName,
                    gender: parseInt(updatedProfile.gender, 10), // Ensure gender is sent as an integer
                    birthDate: updatedProfile.birthDate, // Ensure correct date format
                    address: updatedProfile.address,
                }),
            });
    
            const result = await response.json();
    
            if (response.ok) {
                console.log('Profile updated successfully!', result);
                setProfile(result.data); // Update profile in state
                setModalOpen(false); // Close modal
            } else {
                console.error('Error updating profile:', result.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
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
        const accessToken = localStorage.getItem('authToken');
        
        try {
            const response = await fetch('https://bookrecaps.cloud/api/personal/update-phone', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(phoneUpdate),
            });
    
            // Check if the response is JSON or text
            const contentType = response.headers.get('content-type');
            let result;
            if (contentType && contentType.includes('application/json')) {
                result = await response.json();
            } else {
                result = await response.text();
                console.log('Response is not JSON:', result);  // Log the success message
            }
    
            if (response.ok) {
                console.log('Phone number updated successfully!');
                setPhoneUpdateModalOpen(false); // Close phone update modal
                
                // Refetch the profile to update the state with the correct data
                await fetchProfile();  // Ensure the latest profile data is fetched
            } else {
                console.error('Error updating phone number:', result);
            }
        } catch (error) {
            console.error('Error updating phone number:', error);
        }
    };
    const fetchProfile = async () => {
        const accessToken = localStorage.getItem('authToken');
        try {
            const response = await fetch('https://bookrecaps.cloud/api/personal/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
    
            const data = await response.json();
            console.log('Fetched profile data:', data);
            
            // Set profile data
            setProfile(data);
            setUpdatedProfile({
                fullName: data.fullName || '',
                gender: data.gender || '',
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
        const accessToken = localStorage.getItem('authToken');
        try {
            const response = await fetch('https://bookrecaps.cloud/api/personal/update-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordData) // Đảm bảo passwordData là đúng
            });
    
            // Kiểm tra xem response có ok không
            if (!response.ok) {
                const errorText = await response.text(); // Đọc phản hồi như là text
                console.error('Error response text:', errorText); // Ghi log lỗi để kiểm tra
                throw new Error(errorText); // Ném ra lỗi với nội dung phản hồi
            }
    
            // Nếu không có lỗi, thông báo thành công
            alert('Thay đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
    
            // Clear auth token from localStorage
            localStorage.removeItem('authToken');
    
            // Navigate to login page
            navigate(routes.login);
    
            // Đăng xuất khỏi các phiên làm việc cũ, nếu có
            await fetch('https://bookrecaps.cloud/api/personal/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
    
        } catch (error) {
            console.error('Error updating password:', error);
            // alert('Cập nhật mật khẩu thất bại: ' + error.message);
        }
    };
    
    // Handle Image File Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
    };

    // Handle Image Upload
    const handleUpdateImage = async () => {
        const accessToken = localStorage.getItem('authToken');
        const userId = profile?.userId || ''; // Assuming `userId` is part of the profile data

        if (!imageFile) {
            alert('Please select an image file first!');
            return;
        }

        const formData = new FormData();
        formData.append('UserId', userId);
        formData.append('Image', imageFile); // Add the image file
        formData.append('DeleteCurrentImage', false); // Modify based on your logic

        try {
            setImageUploadLoading(true);
            const response = await fetch('https://bookrecaps.cloud/api/personal/update-avatar', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Profile image updated successfully!', result);
                 // Gọi lại fetchProfile để cập nhật lại thông tin profile sau khi ảnh được cập nhật
            await fetchProfile();

            // // Cập nhật profile trong state
            // setProfile(result.data); 

            } else {
                const errorText = await response.text();
                console.error('Error updating image:', errorText);
            }
        } catch (error) {
            console.error('Error updating profile image:', error);
        } finally {
            setImageUploadLoading(false);
        }
    };


    return (
        <div className="settings-container">
            <div className="settings-nav">
                <ul>
                <li className={currentTab === 'profile' ? 'active' : ''} onClick={() => handleTabChange('profile')}>Profile</li>
                <li className={currentTab === 'password' ? 'active' : ''} onClick={() => handleTabChange('password')}>Password</li>
                    
                    <li>
                        <p onClick={handleViewBilling}>Billing</p>
                    </li>
                    <li>
                        <p onClick={handleViewSubcriptionHistory}>Subcription History</p>
                    </li>
                    <li>
                        <p onClick={handleViewApplication}>View Application</p>
                    </li>
                    <li> <p onClick={handleBecomeContributor}>Become A Contributor</p></li>
                </ul>
            </div>
            <div className="settings-content">
            {currentTab === 'profile' && (
                <div>
                <h2>Basic Info</h2>
                {profile ? (
                    <div className="info-group">
                        <div className="info-item">
                            <label>FullName</label>
                            <span>{profile.fullName || "N/A"}</span>
                        </div>
                        <div className="info-item">
                            <label>Username</label>
                            <span>{profile.userName || "N/A"}</span>
                        </div>
                        <div className="info-item">
                            <label>Email ID</label>
                            <span>{profile.email || "N/A"}</span>
                        </div>
                        <div className="info-item">
                            <label>Location</label>
                            <span>{profile.address || "N/A"}</span>
                        </div>
                        <div className="info-item">
                            <label>Phone Number</label>
                            <span>{profile.phoneNumber || "N/A"}</span>
                        </div>
                        <div className="info-item">
                            <label>Gender</label>
                            <span>{profile.gender === 0 ? "Female" : profile.gender === 1 ? "Male" : "Other"}</span>
                        </div>
                        <div className="info-item">
                            <label>Birth Date</label>
                            <span>{profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                        <div className="info-item">
                            <label>Profile Image</label>
                            {profile.imageUrl ? (
                                <img src={profile.imageUrl} alt="Profile" className="profile-image" />
                            ) : (
                                <span>No Image Available</span>
                            )}
                        </div>
                        <div className="info-item">
                    <label>Subscription Package</label>
                    <span>{subscriptionPackageName || "No subscription"}</span> {/* Display subscription package name */}
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
                    Update Account Settings
                </button>

                <button className="update-button" onClick={() => setPhoneUpdateModalOpen(true)}>
                    Update Phone
                </button>

                <button className="update-button" onClick={() => setImageUpdateModalOpen(true)}>Update Profile Image</button>


                {isModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Update Profile</h3>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={updatedProfile.fullName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
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
                                <label>Birth Date</label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={updatedProfile.birthDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={updatedProfile.address}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <button onClick={handleUpdateProfile}>Update</button>
                            <button onClick={() => setModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}

                    {phoneUpdateModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Update Phone Number</h3>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={phoneUpdate.phoneNumber}
                                    onChange={handlePhoneInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={phoneUpdate.password}
                                    onChange={handlePhoneInputChange}
                                />
                            </div>
                            <button onClick={handleUpdatePhone}>Update Phone</button>
                            <button onClick={() => setPhoneUpdateModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
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
                        <button onClick={handleUpdatePassword}>Update Password</button>
                    </div>
                )}


                {/* Image Update Modal */}
            {imageUpdateModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Update Profile Image</h3>
                        <input type="file" accept="image/*" onChange={handleImageChange} />
                        <button onClick={handleUpdateImage} disabled={imageUploadLoading}>
                            {imageUploadLoading ? 'Uploading...' : 'Upload'}
                        </button>
                        <button onClick={() => setImageUpdateModalOpen(false)}>Cancel</button>
                    </div>
                </div>
            )}

            </div>
        </div>
    );
}

export default Settings;
