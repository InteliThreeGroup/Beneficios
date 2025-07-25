// src/BENEFICIOS_frontend/src/components/ProfileScreen.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

const ProfileScreen = ({ profile, principal, logout }) => {
  return (
    <main>
      <div className="profile-header" style={{ marginBottom: '1rem' }}> {/* Adjusted margin for profile screen */}
        <div className="profile-avatar">
          <img src="https://via.placeholder.com/150/cccccc/ffffff?text=U" alt="Avatar" /> {/* Placeholder image */}
        </div>
        <div className="profile-info">
          <h2 style={{ fontSize: '1.6rem' }}>{profile?.name || 'Nome do Usuário'}</h2> {/* Adjusted font size */}
          <p>Chave de Identificação</p>
        </div>
      </div>

      <div className="profile-card-group">
        <div className="profile-card">
          <span className="profile-card-label">Chave Pública</span>
          <div className="profile-card-value">
            {principal?.toString().substring(0, 20)}...
            <button onClick={() => navigator.clipboard.writeText(principal?.toString())} style={{ background: 'none', border: 'none', color: '#007bff', padding: '5px', cursor: 'pointer', width: 'auto' }}>
              <FontAwesomeIcon icon={faCopy} />
            </button>
          </div>
        </div>

        {profile?.companyId && ( // Assuming companyId is available in profile for Establishment
          <div className="profile-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <span className="profile-card-label">Nome da Empresa</span>
                <span className="profile-card-value">{profile.companyId[0] || 'N/A'}</span> {/* Use companyId for name if available */}
                <span className="profile-card-label" style={{ fontSize: '0.9rem', color: '#555' }}>Empresa Atual</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="profile-card-value" style={{ fontSize: '1.4rem' }}>12</span> {/* Placeholder for number of receipts */}
                <span className="profile-card-label" style={{ fontSize: '0.9rem', color: '#555' }}>Recebimentos</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <button onClick={logout} className="secondary" style={{ width: '100%', marginTop: '20px' }}>
        Sair
      </button>
    </main>
  );
};

export default ProfileScreen;