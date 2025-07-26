import React, { useState } from 'react';
import { useAuth } from '../AuthClientContext';
import { Principal } from '@dfinity/principal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHandHoldingUsd,
    faUser,
    faCoins,
    faFileText,
    faUtensils,
    faGraduationCap,
    faHeartbeat,
    faBus,
    faPalette,
    faSpinner,
    faCheckCircle,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

const benefitIcons = {
    Food: faUtensils,
    Education: faGraduationCap,
    Health: faHeartbeat,
    Transport: faBus,
    Culture: faPalette
};

const benefitLabels = {
    Food: 'Food',
    Culture: 'Culture',
    Health: 'Health',
    Transport: 'Transport',
    Education: 'Education'
};

const HRManualPayment = () => {
    const { actors } = useAuth();
    const [workerPrincipal, setWorkerPrincipal] = useState('');
    const [amount, setAmount] = useState('');
    const [benefitType, setBenefitType] = useState('Food');
    const [description, setDescription] = useState('');
    const [paymentMessage, setPaymentMessage] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);

    const handleManualPayment = async (e) => {
        e.preventDefault();
        setPaymentLoading(true);
        setPaymentMessage('');

        if (!workerPrincipal || !amount || isNaN(amount) || parseFloat(amount) <= 0 || !description) {
            setPaymentMessage('Please fill in all fields with valid values.');
            setPaymentLoading(false);
            return;
        }

        try {
            if (actors && actors.wallets) {
                const workerId = Principal.fromText(workerPrincipal);
                const benefit = { [benefitType]: null };
                const amountInNats = BigInt(Math.floor(parseFloat(amount) * 10000));
                
                // --- CORREÇÃO APLICADA AQUI ---
                // O backend espera 5 argumentos separados, e não um objeto.
                // Adicionamos o programId como "manual" para compatibilidade.
                const result = await actors.wallets.creditBalance(
                    workerId,               // 1. workerId: Principal
                    benefit,                // 2. benefitType: BenefitType
                    amountInNats,           // 3. amount: Nat
                    "manual_payment",       // 4. programId: Text
                    description             // 5. description: Text
                );
                // --- FIM DA CORREÇÃO ---

                if (result.ok) {
                    setPaymentMessage(`Manual payment of ${parseFloat(amount).toFixed(2)} ICP to ${workerPrincipal} successfully completed!`);
                    setWorkerPrincipal('');
                    setAmount('');
                    setDescription('');
                } else {
                    setPaymentMessage(`Error making manual payment: ${result.err}`);
                }
            } else {
                setPaymentMessage('Error: Wallets module not loaded.');
            }
        } catch (error) {
            console.error('Error making manual payment:', error);
            setPaymentMessage('Error processing Worker Principal. Check if the ID is correct.');
        } finally {
            setPaymentLoading(false);
        }
    };

    return (
        <div className="dashboard-card manual-payment-card">
            <div className="card-header">
                <div className="card-icon">
                    <FontAwesomeIcon icon={faHandHoldingUsd} />
                </div>
                <div>
                    <h3>Manual Payment</h3>
                    <p>Make direct payments to workers</p>
                </div>
            </div>

            <form onSubmit={handleManualPayment} className="payment-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="workerPrincipal">
                            <FontAwesomeIcon icon={faUser} />
                            Worker's Principal
                        </label>
                        <input
                            type="text"
                            id="workerPrincipal"
                            value={workerPrincipal}
                            onChange={(e) => setWorkerPrincipal(e.target.value)}
                            required
                            className="form-input"
                            placeholder="Worker's Principal ID"
                            disabled={paymentLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">
                            <FontAwesomeIcon icon={faCoins} />
                            Amount (ICP)
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ex: 25.00"
                            step="0.01"
                            required
                            className="form-input"
                            disabled={paymentLoading}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Benefit Type</label>
                    <div className="benefit-type-selector">
                        {Object.entries(benefitLabels).map(([key, label]) => (
                            <div
                                key={key}
                                className={`benefit-option ${benefitType === key ? 'selected' : ''}`}
                                onClick={() => !paymentLoading && setBenefitType(key)}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !paymentLoading) {
                                        setBenefitType(key);
                                    }
                                }}
                            >
                                <FontAwesomeIcon icon={benefitIcons[key]} />
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">
                        <FontAwesomeIcon icon={faFileText} />
                        Payment Description
                    </label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="form-input"
                        placeholder="Describe the reason for payment"
                        disabled={paymentLoading}
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-success payment-button" disabled={paymentLoading}>
                        {paymentLoading ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin />
                                Processing...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faHandHoldingUsd} />
                                Make Payment
                            </>
                        )}
                    </button>
                </div>

                {paymentMessage && (
                    <div className={`message ${paymentMessage.toLowerCase().includes('error') || paymentMessage.toLowerCase().includes('erro') ? 'message-error' : 'message-success'}`}>
                        <FontAwesomeIcon icon={paymentMessage.toLowerCase().includes('error') || paymentMessage.toLowerCase().includes('erro') ? faExclamationTriangle : faCheckCircle} />
                        {paymentMessage
                            .replace('Erro', 'Error')
                            .replace('Pagamento manual de', 'Manual payment of')
                            .replace('concluído com sucesso!', 'successfully completed!')
                            .replace('para', 'to')
                            .replace('Erro ao realizar pagamento manual', 'Error making manual payment')
                            .replace('Erro: Módulo de carteiras não carregado.', 'Error: Wallets module not loaded.')
                            .replace('Erro ao processar o Principal do Trabalhador. Verifique se o ID está correto.', 'Error processing Worker Principal. Check if the ID is correct.')
                            .replace('Por favor, preencha todos os campos com valores válidos.', 'Please fill in all fields with valid values.')
                        }
                    </div>
                )}
            </form>
        </div>
    );
};

export default HRManualPayment;