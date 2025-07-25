// src/frontend/src/components/WorkerDashboard.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

// This component now simply redirects to the WalletScreen
const WorkerDashboard = () => {
  return <Navigate to="/carteira" replace />;
};

export default WorkerDashboard;