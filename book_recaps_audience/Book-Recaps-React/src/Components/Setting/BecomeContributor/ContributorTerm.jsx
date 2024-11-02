import React, { useState } from 'react';
import './ContributorTerm.scss';
import axios from 'axios';
import RecapImage from "../../../image/removeBR.png";
const ContributorTerm = () => {
  const [formData, setFormData] = useState({
    agreed: false,
    firstName: '',
    lastName: '',
    email: '',
    signature: ''
  });
  const [error, setError] = useState(null);

  // Get tokens from localStorage
  const accessToken = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTokenRefresh = async () => {
    try {
      const response = await axios.post("https://160.25.80.100:7124/api/tokens/refresh", {
        refreshToken,
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.message.token;

      localStorage.setItem("authToken", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      console.log("Token refreshed successfully");
      return newAccessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      setError("Session expired. Please log in again.");
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let token = accessToken;
      const response = await axios.put('https://160.25.80.100:7124/api/self-update-role', 
        { role: 'contributor' }, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log("API response:", response.data);
      setSubmitted(true);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        const newToken = await handleTokenRefresh();
        if (newToken) {
          // Retry the request with the new access token
          try {
            const retryResponse = await axios.put('https://160.25.80.100:7124/api/self-update-role', 
              { role: 'contributor' }, 
              {
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json'
                }
              }
            );
            console.log("API response after token refresh:", retryResponse.data);
            setSubmitted(true);
          } catch (retryError) {
            console.error("Retry failed:", retryError);
            setError("Failed to update role after token refresh.");
          }
        }
      } else {
        console.error("Error during submission:", error);
        setError("An error occurred. Please try again.");
      }
    }
  };



  return (
    <div className="terms-container">
      {submitted ? (
        <div className="welcome-message">
           <img src={RecapImage} alt="Logo" />
          <h1>Congratulations on becoming an contributor!</h1>
          <p>You've successfully created an account. We think this calls for a little celebration.</p>
          <p>Now, are you ready to explore?</p>
          <a href="https://contributor.hieuvo.dev/login" className="explore-button">Take me to Book Recaps</a>
        </div>
      ) : (
        <>
          <h1 className="terms-title">Terms and Conditions</h1>
          <p className="terms-subtitle">Please read and submit below</p>
          <hr className="terms-divider" />

          {/* (Your Terms sections and form go here, as in your original code) */}
          <div className="terms-section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using our services, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not access or use our services.
        </p>
      </div>
      <div className="terms-section">
        <h2>2. Description of Platform</h2>
        <p>Our services provide audiences with convenient access to concise book recaps in both text and audio formats, delivering a time-saving way to capture essential insights from a book. These recaps offer accessible, summarized content that distills the essence of popular titles, making it easy for readers to explore a variety of topics quickly and effectively.</p>
        <p>Contributors are empowered to create high-quality recaps and earn income based on content performance. Our staff reviews each recap to ensure it meets high standards, verifying content quality, accuracy, and adherence to community guidelines. We also ensure compliance with contractual terms established with publishers, guaranteeing that recaps align with publisher agreements and are free from inappropriate language or violations of community standards.
        </p>
      </div>
      
      <div className="terms-section">
        <h2>3. Copyright</h2>
        <p>The exclusive, legally-secured right to, among other things, reproduce and distribute works of original expression. Expression is your own unique way of expressing an idea, telling a story, or creating a work of art. Under copyright law, creators hold copyright in a book or other literary work from the moment they put the words down on paper, into a computer file, or into some other tangible medium.</p>
      </div>

      <div className="terms-section">
        <h2>4. Contract/Publishing Agreement</h2>
        <p>A legal document detailing a contributor or illustrator agreement to sell to a publisher some or all rights to a creative work. Contracts specify what rights under copyright are being granted, the contributor and publisher respective obligations under the agreement, the contributor compensation, and other provisions.</p>
      </div>

      <div className="terms-section">
        <h2>5. Permissions </h2>
        <p>Agreements from copyright holders granting the right to someone else to reproduce their work. Contributors who want to excerpt someone else's work in their own book may be obligated under copyright law to secure permissions.
        </p>
      </div>

      <div className="terms-section">
        <h2>6. User Conduct</h2>
        <p>You agree not to use our services for any unlawful purpose or in any way that violates these Terms and Conditions. You also agree not to:
            Harass, abuse, or harm other users
            Violate the rights of third parties
            Interfere with or disrupt the operation of our services
            Use our services for commercial solicitation without our prior written consent
        </p>
      </div>

      <div className="terms-section">
        <h2>7. Indemnification </h2>
        <p>You agree to indemnify and hold Book Recaps, its affiliates, officers, directors, employees, and agents harmless from and against any and all claims, liabilities, damages, losses, or expenses arising out of or in any way connected with your use of our services.
        </p>
      </div>


      <div className="terms-section">
        <h2>8. Changes to Terms and Conditions </h2>
        <p>We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Your continued use of our services after any such changes constitutes your acceptance of the new Terms and Conditions.</p>
      </div>


          <form className="terms-form" onSubmit={handleSubmit}>
            {/* Your form fields here */}
            <div className="checkbox-container">
        <input 
            type="checkbox"
            id="agree"
            name="agreed"
            checked={formData.agreed}
            onChange={handleChange}
            required
        />
        <label htmlFor="agree">
            I agree to <a href="/terms" target="_blank">terms & conditions</a>.
        </label>
        </div>

        <div className="form-group">
          <label>Name</label>
          <div className="name-fields">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="example@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
        <label>Signature</label>
        <input
            type="text"
            name="signature"
            placeholder="Sign Here"
            value={formData.signature}
            onChange={handleChange}
            required
        />
        </div>

            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="submit-button">Submit</button>
          </form>
        </>
      )}
    </div>
  );
};

export default ContributorTerm;

