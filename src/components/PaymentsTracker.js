import React, { useState, useEffect } from 'react';

const PaymentsTracker = () => {
  const [players, setPlayers] = useState([]);
  const [payments, setPayments] = useState({});
  const [paymentAmount] = useState(80); // Fixed at 80dh as requested

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('football-players');
    const savedPayments = localStorage.getItem('football-payments');

    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  // Save payments to localStorage whenever payments change
  useEffect(() => {
    localStorage.setItem('football-payments', JSON.stringify(payments));
  }, [payments]);

  const togglePayment = (playerName) => {
    setPayments(prev => ({
      ...prev,
      [playerName]: !prev[playerName]
    }));
  };

  const markAllAsPaid = () => {
    const allPaid = {};
    players.forEach(player => {
      allPaid[player] = true;
    });
    setPayments(allPaid);
  };

  const markAllAsUnpaid = () => {
    const allUnpaid = {};
    players.forEach(player => {
      allUnpaid[player] = false;
    });
    setPayments(allUnpaid);
  };

  const resetPayments = () => {
    if (window.confirm('Are you sure you want to reset all payment records? This action cannot be undone.')) {
      setPayments({});
    }
  };

  // Calculate payment statistics
  const paidPlayers = players.filter(player => payments[player]);
  const unpaidPlayers = players.filter(player => !payments[player]);
  const totalAmount = players.length * paymentAmount;
  const paidAmount = paidPlayers.length * paymentAmount;
  const remainingAmount = totalAmount - paidAmount;

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 Payments Tracker</h2>
        
        {players.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">No players available</h3>
            <p className="text-gray-400">Add players in the Team Picker tab first!</p>
          </div>
        ) : (
          <>
            {/* Payment Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">✅</div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{paidPlayers.length}</div>
                    <div className="text-sm text-green-700">Paid</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">❌</div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{unpaidPlayers.length}</div>
                    <div className="text-sm text-red-700">Unpaid</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">💵</div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{paidAmount}dh</div>
                    <div className="text-sm text-blue-700">Collected</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Payment Progress</span>
                <span className="text-sm text-gray-500">
                  {paidPlayers.length}/{players.length} players
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${players.length > 0 ? (paidPlayers.length / players.length) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0dh</span>
                <span>{totalAmount}dh total</span>
              </div>
            </div>

            {/* Admin Controls */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={markAllAsPaid} className="btn-primary">
                  Mark All as Paid
                </button>
                <button onClick={markAllAsUnpaid} className="btn-secondary">
                  Mark All as Unpaid
                </button>
                <button onClick={resetPayments} className="btn-secondary">
                  Reset All
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Players Payment Table */}
      {players.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Payment Status ({paymentAmount}dh per player)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player, index) => {
                  const isPaid = payments[player];
                  return (
                    <tr key={index} className={isPaid ? 'bg-green-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{player}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{paymentAmount}dh</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isPaid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isPaid ? '✅ Paid' : '❌ Unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => togglePayment(player)}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md transition-colors duration-200 ${
                            isPaid
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Summary */}
      {players.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Financial Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-blue-900">Total Expected:</span>
                <span className="font-bold text-blue-900">{totalAmount}dh</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-green-900">Amount Collected:</span>
                <span className="font-bold text-green-900">{paidAmount}dh</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="font-medium text-red-900">Amount Pending:</span>
                <span className="font-bold text-red-900">{remainingAmount}dh</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2">Unpaid Players:</h4>
                {unpaidPlayers.length === 0 ? (
                  <p className="text-green-600 font-medium">🎉 All players have paid!</p>
                ) : (
                  <ul className="space-y-1">
                    {unpaidPlayers.map((player, index) => (
                      <li key={index} className="text-sm text-red-600">
                        • {player}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTracker;
