import axios from 'axios';
import React, { useEffect, useState } from 'react'

import { fetchProfile } from './Profile';

function UserProfile() {
    
    const [profile, setProfile] = useState([]);
    
    const token = localStorage.getItem("access_token");

    useEffect(() => {
        fetchProfile(token, setProfile);
    },[token]);

  return (
    <div>UserProfile</div>
  )
}

export default UserProfile