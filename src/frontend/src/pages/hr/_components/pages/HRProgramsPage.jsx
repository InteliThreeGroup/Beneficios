import React from 'react';
import HRProgramCreation from '../HRProgramCreation';
import HRProgramList from '../HRProgramList';

const HRProgramsPage = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-800">Gerenciamento de Programas</h1>
                <p className="text-gray-500 mt-1">Crie e gerencie programas de benefícios para sua empresa.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    {/* Componente para criar novos programas */}
                    <HRProgramCreation />
                </div>
                <div className="space-y-6">
                    {/* Componente para listar os programas existentes */}
                    <HRProgramList />
                </div>
            </div>
        </div>
    );
};

export default HRProgramsPage;
