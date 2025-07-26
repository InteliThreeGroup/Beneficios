import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthClientContext';
import { Principal } from '@dfinity/principal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faUser, faClipboardList, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const HRAssignWorker = () => {
    const { actors, profile } = useAuth();
    const [workerPrincipal, setWorkerPrincipal] = useState('');
    const [programId, setProgramId] = useState('');
    const [availablePrograms, setAvailablePrograms] = useState([]);
    const [assignmentMessage, setAssignmentMessage] = useState('');
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [programsLoading, setProgramsLoading] = useState(true);

    const fetchPrograms = useCallback(async () => {
        if (!actors?.benefits_manager || !profile?.companyId?.[0]) return;
        
        setProgramsLoading(true);
        try {
            const companyId = profile.companyId[0];
            const result = await actors.benefits_manager.getCompanyBenefitPrograms(companyId);
            setAvailablePrograms(result);
            if (result.length > 0) {
                setProgramId(result[0].id);
            }
        } catch (error) {
            console.error("Error loading programs for assignment:", error);
        } finally {
            setProgramsLoading(false);
        }
    }, [actors, profile]);

    useEffect(() => {
        fetchPrograms();
    }, [fetchPrograms]);

    const handleAssignWorker = async (e) => {
        e.preventDefault();
        setAssignmentLoading(true);
        setAssignmentMessage('');
        
        if (!workerPrincipal || !programId) {
            setAssignmentMessage('Please fill in the Principal and select a Program.');
            setAssignmentLoading(false);
            return;
        }
        
        try {
            const workerId = Principal.fromText(workerPrincipal);
            const result = await actors.benefits_manager.assignWorkerToBenefit(workerId, programId, []);
            
            if (result.ok) {
                setAssignmentMessage('Worker successfully assigned!');
                setWorkerPrincipal('');
            } else {
                setAssignmentMessage(`Error assigning worker: ${result.err}`);
            }
        } catch (error) {
            console.error('Error assigning worker:', error);
            setAssignmentMessage('An error occurred while processing the assignment.');
        } finally {
            setAssignmentLoading(false);
        }
    };

    return (
        <div className="dashboard-card worker-assign-card">
            <div className="card-header">
                <div className="card-icon">
                    <FontAwesomeIcon icon={faUserPlus} />
                </div>
                <div>
                    <h3>Assign Worker to Program</h3>
                    <p>Link workers to benefit programs</p>
                </div>
            </div>

            <form onSubmit={handleAssignWorker} className="assign-form">
                <div className="form-group">
                    <label htmlFor="workerPrincipal">
                        <FontAwesomeIcon icon={faUser} />
                        Worker Principal
                    </label>
                    <input 
                        type="text" 
                        id="workerPrincipal" 
                        value={workerPrincipal} 
                        onChange={(e) => setWorkerPrincipal(e.target.value)} 
                        required 
                        placeholder="Paste the worker's Principal ID"
                        className="form-input"
                        disabled={assignmentLoading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="programId">
                        <FontAwesomeIcon icon={faClipboardList} />
                        Benefit Program
                    </label>
                    {programsLoading ? (
                        <div className="loading-select">
                            <FontAwesomeIcon icon={faSpinner} spin />
                            Loading programs...
                        </div>
                    ) : (
                        <select 
                            id="programId" 
                            value={programId} 
                            onChange={(e) => setProgramId(e.target.value)} 
                            required 
                            disabled={availablePrograms.length === 0 || assignmentLoading}
                            className="form-select"
                        >
                            <option value="">
                                {availablePrograms.length === 0 ? 'No programs available' : 'Select a program'}
                            </option>
                            {availablePrograms.map(program => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn btn-primary assign-button" 
                        disabled={assignmentLoading || availablePrograms.length === 0 || programsLoading}
                    >
                        {assignmentLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Assigning...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faUserPlus} />
                                Assign Worker
                            </>
                        )}
                    </button>
                </div>

                {assignmentMessage && (
                    <div className={`message ${assignmentMessage.startsWith('Error') ? 'message-error' : 'message-success'}`}>
                        <FontAwesomeIcon icon={assignmentMessage.startsWith('Error') ? faUser : faCheckCircle} />
                        {assignmentMessage}
                    </div>
                )}
            </form>
        </div>
    );
};

export default HRAssignWorker;
