import React from 'react';
import HRProgramCreation from '../HRProgramCreation';
import HRProgramList from '../HRProgramList';

const HRProgramsPage = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-800">Program Management</h1>
                <p className="text-gray-500 mt-1">Create and manage benefit programs for your company.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    {/* Component to create new programs */}
                    <HRProgramCreation />
                </div>
                <div className="space-y-6">
                    {/* Component to list existing programs */}
                    <HRProgramList />
                </div>
            </div>
        </div>
    );
};

export default HRProgramsPage;
