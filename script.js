// Player database with strength tiers and conflicts
const players = {
    // Top players (midfield) - equal strength
    'KHALID': { tier: 'top', conflicts: [] },
    'MEHDI': { tier: 'top', conflicts: [] },
    'SOUFIANE': { tier: 'top', conflicts: [] },
    'SAID': { tier: 'top', conflicts: [] },
    
    // Less players
    'YOUSSEF': { tier: 'less', conflicts: ['AYOUBE'] },
    'AYMENE': { tier: 'less', conflicts: [] },
    'AYOUBE': { tier: 'less', conflicts: ['ISSAM', 'YOUSSEF', 'MOHAMMED'] },
    'SAAD': { tier: 'less', conflicts: [] },
    
    // Back players
    'AKD': { tier: 'back', conflicts: [] },
    'KAMAL': { tier: 'back', conflicts: [] },
    'MOHAMMED TATI': { tier: 'back', conflicts: [] },
    
    // Attackers
    'ISSAM': { tier: 'attacker', conflicts: ['AYOUBE', 'ADIL'] },
    'MOHAMMED': { tier: 'attacker', conflicts: ['AYOUBE'] }, // 50% conflict
    
    // Less players
    'ADIL': { tier: 'less', conflicts: ['ISSAM'] },
    'ABDELLAH': { tier: 'less', conflicts: [] }
};

// Strength values for balancing
const tierStrength = {
    'top': 5,
    'attacker': 4,
    'back': 3,
    'less': 2
};

let selectedPlayers = new Set();
let currentTeams = { teamA: [], teamB: [] };

// Initialize the player list
function initPlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    
    Object.keys(players).forEach(playerName => {
        const btn = document.createElement('button');
        btn.className = 'player-btn';
        btn.textContent = playerName;
        btn.addEventListener('click', () => togglePlayer(playerName, btn));
        playerList.appendChild(btn);
    });
}

// Toggle player selection
function togglePlayer(playerName, btn) {
    if (selectedPlayers.has(playerName)) {
        selectedPlayers.delete(playerName);
        btn.classList.remove('selected');
    } else {
        selectedPlayers.add(playerName);
        btn.classList.add('selected');
    }
    
    updateSelectedCount();
    updateGenerateButton();
}

// Update selected count display
function updateSelectedCount() {
    document.getElementById('selectedCount').textContent = selectedPlayers.size;
}

// Update generate button state
function updateGenerateButton() {
    const count = selectedPlayers.size;
    const generateBtn = document.getElementById('generateBtn');
    
    if (count === 10 || count === 12) {
        generateBtn.disabled = false;
    } else {
        generateBtn.disabled = true;
    }
}

// Generate balanced teams
function generateTeams() {
    const playerArray = Array.from(selectedPlayers);
    
    if (playerArray.length !== 10 && playerArray.length !== 12) {
        alert('Please select exactly 10 or 12 players');
        return;
    }
    
    // Try multiple times to find a good balance
    let bestTeams = null;
    let bestDifference = Infinity;
    
    for (let attempt = 0; attempt < 50; attempt++) {
        const teams = createTeams(playerArray);
        const difference = Math.abs(calculateTeamStrength(teams.teamA) - calculateTeamStrength(teams.teamB));
        
        if (difference < bestDifference) {
            bestDifference = difference;
            bestTeams = teams;
            
            // If we found a perfect balance, use it
            if (difference === 0) break;
        }
    }
    
    currentTeams = bestTeams;
    displayTeams();
}

// Create teams with conflict resolution
function createTeams(playerArray) {
    // Shuffle players
    const shuffled = [...playerArray].sort(() => Math.random() - 0.5);
    
    const teamA = [];
    const teamB = [];
    
    // Check if AYOUBE is playing
    const hasAyoube = shuffled.includes('AYOUBE');
    const hasIssam = shuffled.includes('ISSAM');
    const hasYoussef = shuffled.includes('YOUSSEF');
    const hasMohammed = shuffled.includes('MOHAMMED');
    const hasAdil = shuffled.includes('ADIL');
    
    // Handle ISSAM/ADIL conflict first (they must be on different teams)
    if (hasIssam && hasAdil) {
        // Randomly assign ISSAM to a team, ADIL goes to the other
        const issamTeam = Math.random() < 0.5 ? 'A' : 'B';
        if (issamTeam === 'A') {
            teamA.push('ISSAM');
            teamB.push('ADIL');
        } else {
            teamB.push('ISSAM');
            teamA.push('ADIL');
        }
    } else if (hasIssam) {
        // Only ISSAM is playing, will be assigned later
    } else if (hasAdil) {
        // Only ADIL is playing, will be assigned later
    }
    
    // Handle AYOUBE conflicts
    if (hasAyoube) {
        // Randomly assign AYOUBE to a team
        const ayoubeTeam = Math.random() < 0.5 ? 'A' : 'B';
        
        if (ayoubeTeam === 'A') {
            teamA.push('AYOUBE');
            // ISSAM and YOUSSEF must go to Team B (but only if ISSAM not already assigned)
            if (hasIssam && !teamA.includes('ISSAM') && !teamB.includes('ISSAM')) {
                teamB.push('ISSAM');
            }
            if (hasYoussef) teamB.push('YOUSSEF');
            // MOHAMMED: 50% chance to be with AYOUBE
            if (hasMohammed) {
                if (Math.random() < 0.5) {
                    teamA.push('MOHAMMED');
                } else {
                    teamB.push('MOHAMMED');
                }
            }
        } else {
            teamB.push('AYOUBE');
            // ISSAM and YOUSSEF must go to Team A (but only if ISSAM not already assigned)
            if (hasIssam && !teamA.includes('ISSAM') && !teamB.includes('ISSAM')) {
                teamA.push('ISSAM');
            }
            if (hasYoussef) teamA.push('YOUSSEF');
            // MOHAMMED: 50% chance to be with AYOUBE
            if (hasMohammed) {
                if (Math.random() < 0.5) {
                    teamB.push('MOHAMMED');
                } else {
                    teamA.push('MOHAMMED');
                }
            }
        }
    } else {
        // No AYOUBE, no conflict restrictions
        // Just randomly assign ISSAM, YOUSSEF, MOHAMMED if present
    }
    
    // Distribute remaining players
    const remaining = shuffled.filter(p => 
        !teamA.includes(p) && !teamB.includes(p)
    );
    
    // Sort remaining by strength (strongest first) for better balancing
    remaining.sort((a, b) => {
        const strengthA = tierStrength[players[a].tier];
        const strengthB = tierStrength[players[b].tier];
        return strengthB - strengthA;
    });
    
    // Distribute remaining players to balance teams
    remaining.forEach((player, index) => {
        const teamAStrength = calculateTeamStrength(teamA);
        const teamBStrength = calculateTeamStrength(teamB);
        
        // Alternate or balance by strength
        if (teamAStrength <= teamBStrength) {
            teamA.push(player);
        } else {
            teamB.push(player);
        }
    });
    
    return { teamA, teamB };
}

// Calculate team strength
function calculateTeamStrength(team) {
    return team.reduce((total, player) => {
        return total + (tierStrength[players[player].tier] || 0);
    }, 0);
}

// Display teams
function displayTeams() {
    const teamsSection = document.getElementById('teamsSection');
    const teamAList = document.getElementById('teamA');
    const teamBList = document.getElementById('teamB');
    
    teamsSection.classList.remove('hidden');
    
    teamAList.innerHTML = '';
    teamBList.innerHTML = '';
    
    currentTeams.teamA.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        teamAList.appendChild(li);
    });
    
    currentTeams.teamB.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        teamBList.appendChild(li);
    });
}

// Event listeners
document.getElementById('generateBtn').addEventListener('click', generateTeams);
document.getElementById('reshuffleBtn').addEventListener('click', generateTeams);

// Initialize on load
initPlayerList();

