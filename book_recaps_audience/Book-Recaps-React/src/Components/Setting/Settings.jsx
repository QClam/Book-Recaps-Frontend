import React, { useEffect, useState } from 'react';
import './Settings.scss';
import { useNavigate } from 'react-router-dom';

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

    const handleViewApplication = () => {
        navigate('/application'); // Navigate to the Application route
    };

    const handleViewBilling = () => {
        navigate('/billing'); // Navigate to the Billing route
    };

    // Fetch user profile data
    useEffect(() => {
        const fetchProfile = async () => {
            const accessToken = localStorage.getItem('authToken');
            try {
                const response = await fetch('https://160.25.80.100:7124/api/personal/profile', {
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

    // Handle profile update
    const handleUpdateProfile = async () => {
        const accessToken = localStorage.getItem('authToken');
        
        // Log the form data to verify what is being sent
        console.log('Updated profile data:', updatedProfile);
    
        try {
            const response = await fetch('https://160.25.80.100:7124/api/personal/profile', {
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
    
    
    return (
        <div className="settings-container">
            <div className="settings-nav">
                <ul>
                    <li className="active">Profile</li>
                    <li>Password</li>
                    
                    <li>
                        <p onClick={handleViewBilling}>Billing</p>
                    </li>
                    <li>
                        <p onClick={handleViewApplication}>View Application</p>
                    </li>
                    <li>Become A Contributor</li>
                </ul>
            </div>
            <div className="settings-content">
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
                    </div>
                ) : (
                    <p>Loading profile...</p>
                )}
                <button className="update-button" onClick={() => setModalOpen(true)}>
                    Update Account Settings
                </button>

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

            </div>
        </div>
    );
}

export default Settings;
