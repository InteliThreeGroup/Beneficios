// src/components/hr_dashboard/pages/HRMainDashboardPage.jsx
import React from 'react';
import { useAuth } from '../../AuthClientContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faChartLine, faFileText, faListAlt } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

// Importing the component that already fetches and manages funds correctly
import HRFundsManagement from '../HRFundsManagement';

const HRMainDashboardPage = () => {
  const { profile } = useAuth();

  return (
    <div className="hr-main-dashboard">
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Profile Card */}
          <div className="dashboard-card profile-info-card">
            <div className="card-header">
              <div className="card-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div>
                <h3>Manager Information</h3>
                <p>Profile and company data</p>
              </div>
            </div>
            <div className="profile-details">
              <div className="profile-detail-item">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{profile?.name}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Company:</span>
                <span className="detail-value">{profile?.companyId[0]}</span>
              </div>
              <div className="profile-detail-item">
                <span className="detail-label">Role:</span>
                <span className="detail-value">Human Resources</span>
              </div>
            </div>
          </div>

          {/* Rendering the working Funds Management component */}
          <HRFundsManagement />
        </div>

        {/* Right Column */}
        <div className="dashboard-right-column">
         

          
        </div>
      </div>
    </div>
  );
};

export default HRMainDashboardPage;