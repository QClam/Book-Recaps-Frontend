
import React from 'react';
import ForUser from './ForUser/ForUser';
import TopRecap from './TopRecap/TopRecap';
import RecapRecent from './RecapRecent/RecapRecent';

const Homepage = () => {
    return (
        <div>
            <ForUser />
            <TopRecap />
            <RecapRecent />
        </div>
    );
};

export default Homepage;
