import React from 'react';
import { FileText, Download, Users, Coins, Calendar } from 'lucide-react';

const reports = [
    { title: "Relatório de Trabalhadores", description: "Lista completa de trabalhadores e seus benefícios.", icon: <Users className="text-blue-500"/>, enabled: false },
    { title: "Relatório Financeiro", description: "Análise de gastos e distribuição de fundos.", icon: <Coins className="text-green-500"/>, enabled: false },
    { title: "Relatório Mensal", description: "Resumo mensal de atividades e transações.", icon: <Calendar className="text-orange-500"/>, enabled: false },
];

export default function HRReporting() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-4xl font-bold text-gray-800">Relatórios e Análises</h1>
            <p className="text-gray-500 mt-1">Visualize dados e gere relatórios sobre o uso dos benefícios.</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gray-100 text-gray-600 p-3 rounded-full">
                    <FileText size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Relatórios Disponíveis</h3>
                    <p className="text-sm text-gray-500">Gere relatórios detalhados para análise.</p>
                </div>
            </div>

            <div className="space-y-4">
                {reports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-50 p-3 rounded-full">
                                {report.icon}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{report.title}</p>
                                <p className="text-sm text-gray-500">{report.description}</p>
                            </div>
                        </div>
                        <button 
                            disabled={!report.enabled}
                            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Download size={16}/>
                            Gerar
                        </button>
                    </div>
                ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-6">Funcionalidade de geração de relatórios em desenvolvimento.</p>
        </div>
    </div>
  );
}
