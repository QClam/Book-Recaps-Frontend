import React from 'react'
import { useParams } from 'react-router-dom';

function DetailContributorPayout() {

    const { historyId, id } = useParams();

    return (
        <div>
            <h2>Detail for Contributor ID: {historyId}, Payout ID: {id}</h2>
        </div>
    )
}

export default DetailContributorPayout