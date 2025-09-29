import React, { useState, useEffect } from 'react';

const TeamPicker = () => {
  const [players, setPlayers] = useState([]);
  const [playerInput, setPlayerInput] = useState('');
  const [teams, setTeams] = useState({ teamA: [], teamB: [] });
  const [hasGeneratedTeams, setHasGeneratedTeams] = useState(false);

  // Load players from localStorage on component mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('football-players');
    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
  }, []);

  // Save players to localStorage whenever players change
  useEffect(() => {
    localStorage.setItem('football-players', JSON.stringify(players));
  }, [players]);

  const addPlayer = () => {
    if (playerInput.trim() && !players.includes(playerInput.trim())) {
      setPlayers([...players, playerInput.trim()]);
      setPlayerInput('');
    }
  };

  const removePlayer = (playerToRemove) => {
    setPlayers(players.filter(player => player !== playerToRemove));
    setHasGeneratedTeams(false);
  };

  const generateTeams = () => {
    if (players.length < 2) {
      alert('You need at least 2 players to create teams!');
      return;
    }

    // Shuffle players array
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Split into two teams
    const midPoint = Math.ceil(shuffledPlayers.length / 2);
    const teamA = shuffledPlayers.slice(0, midPoint);
    const teamB = shuffledPlayers.slice(midPoint);
    
    setTeams({ teamA, teamB });
    setHasGeneratedTeams(true);
  };

  const resetTeams = () => {
    setTeams({ teamA: [], teamB: [] });
    setHasGeneratedTeams(false);
  };

  const clearAllPlayers = () => {
    setPlayers([]);
    setTeams({ teamA: [], teamB: [] });
    setHasGeneratedTeams(false);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">👥 Team Picker</h2>
        
        {/* Add Players Section */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="Enter player name..."
              className="input-field flex-1"
            />
            <button onClick={addPlayer} className="btn-primary">
              Add Player
            </button>
          </div>
          
          {players.length > 0 && (
            <div className="flex gap-2 mb-4">
              <button onClick={generateTeams} className="btn-primary">
                Generate Teams
              </button>
              <button onClick={resetTeams} className="btn-secondary">
                Reset Teams
              </button>
              <button onClick={clearAllPlayers} className="btn-secondary">
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Players List */}
        {players.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Players ({players.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {players.map((player, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                >
                  {player}
                  <button
                    onClick={() => removePlayer(player)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Teams Display */}
      {hasGeneratedTeams && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-blue-600 mb-4">
              🔵 Team A ({teams.teamA.length} players)
            </h3>
            <div className="space-y-2">
              {teams.teamA.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <span className="font-medium text-blue-900">{player}</span>
                  <span className="text-sm text-blue-600">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              🔴 Team B ({teams.teamB.length} players)
            </h3>
            <div className="space-y-2">
              {teams.teamB.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <span className="font-medium text-red-900">{player}</span>
                  <span className="text-sm text-red-600">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {players.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚽</div>
          <h3 className="text-lg font-medium text-gray-500 mb-2">No players added yet</h3>
          <p className="text-gray-400">Add some players to get started!</p>
        </div>
      )}
    </div>
  );
};

export default TeamPicker;
