import React, { useState, useEffect } from 'react';

const MVPVoting = () => {
  const [players, setPlayers] = useState([]);
  const [votes, setVotes] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(true);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedPlayers = localStorage.getItem('football-players');
    const savedVotes = localStorage.getItem('football-mvp-votes');
    const userHasVoted = localStorage.getItem('football-user-voted');

    if (savedPlayers) {
      setPlayers(JSON.parse(savedPlayers));
    }
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }
    if (userHasVoted === 'true') {
      setHasVoted(true);
    }
  }, []);

  // Save votes to localStorage whenever votes change
  useEffect(() => {
    localStorage.setItem('football-mvp-votes', JSON.stringify(votes));
  }, [votes]);

  const submitVote = () => {
    if (!selectedPlayer) {
      alert('Please select a player to vote for!');
      return;
    }

    if (hasVoted) {
      alert('You have already voted!');
      return;
    }

    const newVotes = { ...votes };
    newVotes[selectedPlayer] = (newVotes[selectedPlayer] || 0) + 1;
    setVotes(newVotes);
    setHasVoted(true);
    localStorage.setItem('football-user-voted', 'true');
    
    // Show success message
    alert(`Vote submitted for ${selectedPlayer}!`);
  };

  const resetVoting = () => {
    if (window.confirm('Are you sure you want to reset all MVP votes? This action cannot be undone.')) {
      setVotes({});
      setHasVoted(false);
      setSelectedPlayer('');
      localStorage.removeItem('football-mvp-votes');
      localStorage.removeItem('football-user-voted');
    }
  };

  const resetUserVote = () => {
    if (window.confirm('Are you sure you want to reset your vote? You will be able to vote again.')) {
      setHasVoted(false);
      setSelectedPlayer('');
      localStorage.removeItem('football-user-voted');
    }
  };

  // Sort players by vote count (descending)
  const sortedPlayers = players
    .map(player => ({
      name: player,
      votes: votes[player] || 0
    }))
    .sort((a, b) => b.votes - a.votes);

  const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🏆 MVP Voting</h2>
        
        {players.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">No players available</h3>
            <p className="text-gray-400">Add players in the Team Picker tab first!</p>
          </div>
        ) : (
          <>
            {/* Voting Section */}
            {!hasVoted ? (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-3">Cast Your Vote</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedPlayer}
                    onChange={(e) => setSelectedPlayer(e.target.value)}
                    className="input-field flex-1"
                  >
                    <option value="">Select a player...</option>
                    {players.map((player, index) => (
                      <option key={index} value={player}>
                        {player}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={submitVote}
                    disabled={!selectedPlayer}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Vote Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-blue-800">✅ Vote Submitted!</h3>
                    <p className="text-blue-600">You have already voted for MVP.</p>
                  </div>
                  <button onClick={resetUserVote} className="btn-secondary">
                    Reset My Vote
                  </button>
                </div>
              </div>
            )}

            {/* Admin Controls */}
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Admin Controls</h3>
              <div className="flex gap-2">
                <button onClick={resetVoting} className="btn-secondary">
                  Reset All Votes
                </button>
                <button
                  onClick={() => setVotingEnabled(!votingEnabled)}
                  className={`${votingEnabled ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {votingEnabled ? 'Disable Voting' : 'Enable Voting'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Leaderboard */}
      {players.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            🏆 MVP Leaderboard
            {totalVotes > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({totalVotes} total vote{totalVotes !== 1 ? 's' : ''})
              </span>
            )}
          </h3>
          
          {totalVotes === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">No votes yet. Be the first to vote!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.name}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index === 0 && player.votes > 0
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 && player.votes > 0
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{player.name}</div>
                      {index === 0 && player.votes > 0 && (
                        <div className="text-sm text-yellow-600">👑 Current MVP</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{player.votes}</div>
                    <div className="text-sm text-gray-500">
                      vote{player.votes !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MVPVoting;
