import React from 'react'

import { sampleData } from '../Recaps/ContentItems'
import './Overview.scss'

function Overview() {
    return (
        <div className='overview-container'>
            <div>
                <h2>Nội dung đang chờ xét duyệt</h2>
            </div>
            {/* <div className='overview-content-info'>
                <div className='overview-content-card'>
                    <h3>{sampleData[1].title}</h3>
                    <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQV4yWihrnwBCaQNXCMF_zSIAPDMidcLtnR3g&s' />
                    <p>{sampleData[1].description}</p>
                </div>
                <div className='overview-content-card'>Comming soon</div>
            </div> */}
        </div>
    )
}

export default Overview