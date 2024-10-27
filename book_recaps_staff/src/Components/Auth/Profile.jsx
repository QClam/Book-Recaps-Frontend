// fetchProfile.js
import axios from 'axios';

export const fetchProfile = async (token, setProfile) => {
    try {
        const response = await axios.get('https://160.25.80.100:7124/api/personal/profile', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setProfile(response.data);
        console.log("User Profile: ", response.data);
    } catch (error) {
        console.log("Error fetching profile", error);
    }
};
