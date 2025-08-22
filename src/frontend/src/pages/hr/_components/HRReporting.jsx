import React from 'react';
import { FileText, Download, Users, Coins, Calendar } from 'lucide-react';

const reports = [
    { title: "Workers Report", description: "Complete list of workers and their benefits.", icon: <Users className="text-blue-500"/>, enabled: false },
    { title: "Financial Report", description: "Analysis of expenses and fund distribution.", icon: <Coins className="text-green-500"/>, enabled: false },
    { title: "Monthly Report", description: "Monthly summary of activities and transactions.", icon: <Calendar className="text-orange-500"/>, enabled: false },
];

export default function HRReporting() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-4xl font-bold text-gray-800">Reports & Analytics</h1>
            <p className="text-gray-500 mt-1">View data and generate reports about benefit usage.</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gray-100 text-gray-600 p-3 rounded-full">
                    <FileText size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">Available Reports</h3>
                    <p className="text-sm text-gray-500">Generate detailed reports for analysis.</p>
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
                            Generate
                        </button>
                    </div>
                ))}
            </div>
            <p className="text-center text-sm text-gray-400 mt-6">Report generation functionality under development.</p>
        </div>
    </div>
  );
}
