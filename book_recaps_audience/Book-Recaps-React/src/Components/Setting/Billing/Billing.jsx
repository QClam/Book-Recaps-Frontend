import React from 'react';
import './Billing.scss';

function Billing() {
  return (
    <div className="billing-container">
      <h1>Start your 5-day free trial</h1>
      <p>
        Get full access to Shortform. You won't be charged until your free trial ends on Sept 24. Cancel anytime.
      </p>

      <div className="billing-options">
        {/* Annual Plan */}
        <div className="billing-card">
          <div className="billing-header">
            <div className="billing-title">
              <i className="calendar-icon"></i>
              <h2>Annually</h2>
            </div>
            <p className="price">$16.42/mo</p>
            <p className="billed">Billed annually at <strong>$197</strong></p>
          </div>
          <button className="start-trial-button annual">Start Free Trial</button>
          <ul className="features-list">
            <li>5-Day Free Trial</li>
            <li>1000+ Books Covered</li>
            <li>500+ Article and Topic Guides</li>
            <li>Mobile App (iOS/Android)</li>
            <li>Highlights & Notes</li>
            <li>Audio Narrations</li>
            <li>Community Discussions</li>
          </ul>
        </div>

        {/* Monthly Plan */}
        <div className="billing-card">
          <div className="billing-header">
            <div className="billing-title">
              <i className="calendar-icon"></i>
              <h2>Monthly</h2>
            </div>
            <p className="price">$24.00/mo</p>
            <p className="billed">Billed monthly</p>
          </div>
          <button className="start-trial-button monthly">Start Free Trial</button>
          <ul className="features-list">
            <li>5-Day Free Trial</li>
            <li>1000+ Books Covered</li>
            <li>500+ Article and Topic Guides</li>
            <li>Mobile App (iOS/Android)</li>
            <li>Highlights & Notes</li>
            <li>Audio Narrations</li>
            <li>Community Discussions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Billing;
