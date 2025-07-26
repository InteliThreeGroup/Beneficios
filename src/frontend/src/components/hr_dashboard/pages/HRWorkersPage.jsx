import React from 'react';
import HRAssignWorker from '../HRAssignWorker';
import HRManualPayment from '../HRManualPayment';
import HRUpdateBenefitAmount from '../HRUpdateBenefitAmount';

const HRWorkersPage = () => {
    return (
        <div className="hr-workers-page">
            <div className="workers-page-header">
                <h2>Worker Management</h2>
                <p>Manage workers, payments, and benefits</p>
            </div>
            
            <div className="workers-page-grid">
                <div className="workers-left-column">
                    <HRAssignWorker />
                    <HRUpdateBenefitAmount />
                </div>
                <div className="workers-right-column">
                    <HRManualPayment />
                </div>
            </div>
        </div>
    );
};

export default HRWorkersPage;
