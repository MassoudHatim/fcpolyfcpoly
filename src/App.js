import React, { useState } from 'react';
import TeamPicker from './components/TeamPicker';
import MVPVoting from './components/MVPVoting';
import PaymentsTracker from './components/PaymentsTracker';

function App() {
  const [activeTab, setActiveTab] = useState('teams');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              ⚽ Football Match Manager
            </h1>
            <div className="text-sm text-gray-500">
              Static Site • No Backend Required
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'teams', label: 'Team Picker', icon: '👥' },
              { id: 'mvp', label: 'MVP Voting', icon: '🏆' },
              { id: 'payments', label: 'Payments', icon: '💰' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'teams' && <TeamPicker />}
        {activeTab === 'mvp' && <MVPVoting />}
        {activeTab === 'payments' && <PaymentsTracker />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Football Match Manager • Built with React + TailwindCSS</p>
            <p className="mt-1">All data stored locally in your browser</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
