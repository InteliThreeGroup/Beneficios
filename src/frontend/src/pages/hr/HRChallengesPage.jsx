import React from 'react';
import NewChallengeForm from '../../components/hr/NewChallengeForm';
import HRChallengeList from '../../components/hr/HRChallengeList';

const HRChallengesPage = () => {
    // Este estado e função permitem que a lista de desafios seja atualizada
    // automaticamente quando um novo desafio é criado.
    const [refreshKey, setRefreshKey] = React.useState(0);
    const handleChallengeCreated = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-800">Gerenciamento de Desafios</h1>
                <p className="text-gray-500 mt-1">Crie e gerencie desafios de engajamento para os colaboradores.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                    {/* Componente para criar novos desafios */}
                    <NewChallengeForm onChallengeCreated={handleChallengeCreated} />
                </div>
                <div className="space-y-6">
                    {/* Componente para listar os desafios existentes */}
                    <HRChallengeList key={refreshKey} />
                </div>
            </div>
        </div>
    );
};

export default HRChallengesPage;
