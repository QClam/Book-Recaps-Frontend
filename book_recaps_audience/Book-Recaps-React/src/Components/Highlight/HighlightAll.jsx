
import React from 'react';
import HighlightedSentences from './HighlightRecap/HighlightedSentences';
import Highlight from './Highlight';


const HighlightAll = () => {
    return (
        <div>
            <Highlight />
           <HighlightedSentences />
        </div>
    );
};

export default HighlightAll;
