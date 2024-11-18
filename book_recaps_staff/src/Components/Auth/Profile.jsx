// fetchProfile.js
import axios from 'axios';

export const fetchProfile = async (token, setProfile) => {
    try {
        const response = await axios.get('https://bookrecaps.cloud/api/personal/profile', {
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
