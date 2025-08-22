import React from 'react';
import { useAuth } from '../../../auth/AuthClientContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faChartLine } from '@fortawesome/free-solid-svg-icons';
import HRFundsManagement from '../HRFundsManagement';

const HRMainDashboardPage = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800">Dashboard & Funds</h1>
        <p className="text-gray-500 mt-1">Manage your information and company funds.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Manager Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                <FontAwesomeIcon icon={faUsers} className="text-2xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Manager Information</h3>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Name:</span>
                <span className="font-semibold text-gray-900">{profile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Company:</span>
                <span className="font-semibold text-gray-900">{profile?.companyId[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-500">Role:</span>
                <span className="font-semibold text-blue-600">Human Resources</span>
              </div>
            </div>
          </div>

          {/* Funds Management Component */}
          <HRFundsManagement />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center text-gray-400 py-8">
              <FontAwesomeIcon icon={faChartLine} className="text-5xl mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Analytics Coming Soon</h3>
              <p className="text-sm">Dashboard metrics and analytics will be available here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRMainDashboardPage;
