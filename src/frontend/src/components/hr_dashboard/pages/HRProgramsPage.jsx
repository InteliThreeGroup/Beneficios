import React from 'react';
import HRProgramCreation from '../HRProgramCreation';
import HRProgramList from '../HRProgramList';

const HRProgramsPage = () => {
    return (
        <div className="hr-programs-page">
            <div className="programs-page-header">
                <h2>Program Management</h2>
                <p>Create and manage benefit programs for your company</p>
            </div>
            
            <div className="programs-page-grid">
                <div className="programs-list-section">
                    <HRProgramList />
                </div>
                <div className="programs-creation-section">
                    <HRProgramCreation />
                </div>
            </div>
        </div>
    );
};

export default HRProgramsPage;
