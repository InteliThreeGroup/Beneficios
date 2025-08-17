import React from 'react';
import HRAssignWorker from '../HRAssignWorker';
import HRManualPayment from '../HRManualPayment';
import HRUpdateBenefitAmount from '../HRUpdateBenefitAmount';

const HRWorkersPage = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-800">Gerenciamento de Trabalhadores</h1>
                <p className="text-gray-500 mt-1">Gerencie trabalhadores, pagamentos e benefícios.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    <HRAssignWorker />
                    <HRUpdateBenefitAmount />
                </div>
                <div className="space-y-6">
                    <HRManualPayment />
                </div>
            </div>
        </div>
    );
};

export default HRWorkersPage;
