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
    
    // Define the 12 players to preselect
    const preselectedPlayers = [
        'KHALID', 'MEHDI', 'SOUFIANE', 'SAID',  // Top players
        'YOUSSEF', 'AYOUBE',                     // Less players (selected)
        'AKD', 'KAMAL', 'MOHAMMED TATI',         // Back players
        'ISSAM', 'MOHAMMED',                     // Attackers
        'ADIL'                                    // Less player
    ];
    
    Object.keys(players).forEach(playerName => {
        const btn = document.createElement('button');
        btn.className = 'player-btn';
        btn.textContent = playerName;
        btn.addEventListener('click', () => togglePlayer(playerName, btn));
        playerList.appendChild(btn);
        
        // Preselect only the specified 12 players
        if (preselectedPlayers.includes(playerName)) {
            selectedPlayers.add(playerName);
            btn.classList.add('selected');
        }
    });
    
    updateSelectedCount();
    updateGenerateButton();
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
    
    // Handle ISSAM/AYOUBE conflict first (they must be on different teams - 100% enforced)
    if (hasIssam && hasAyoube) {
        // Randomly assign AYOUBE to a team, ISSAM goes to the other
        const ayoubeTeam = Math.random() < 0.5 ? 'A' : 'B';
        if (ayoubeTeam === 'A') {
            teamA.push('AYOUBE');
            teamB.push('ISSAM');
        } else {
            teamB.push('AYOUBE');
            teamA.push('ISSAM');
        }
    } else if (hasAyoube) {
        // Only AYOUBE is playing, will be assigned later
    } else if (hasIssam) {
        // Only ISSAM is playing, will be assigned later
    }
    
    // Handle ISSAM/ADIL conflict (they must be on different teams)
    if (hasIssam && hasAdil) {
        // Only assign if ISSAM not already assigned by AYOUBE conflict
        if (!teamA.includes('ISSAM') && !teamB.includes('ISSAM')) {
            // Randomly assign ISSAM to a team, ADIL goes to the other
            const issamTeam = Math.random() < 0.5 ? 'A' : 'B';
            if (issamTeam === 'A') {
                teamA.push('ISSAM');
                teamB.push('ADIL');
            } else {
                teamB.push('ISSAM');
                teamA.push('ADIL');
            }
        } else {
            // ISSAM already assigned, put ADIL on opposite team
            if (teamA.includes('ISSAM')) {
                teamB.push('ADIL');
            } else if (teamB.includes('ISSAM')) {
                teamA.push('ADIL');
            }
        }
    } else if (hasAdil && !teamA.includes('ADIL') && !teamB.includes('ADIL')) {
        // Only ADIL is playing, will be assigned later
    }
    
    // Handle remaining AYOUBE conflicts (YOUSSEF and MOHAMMED)
    if (hasAyoube) {
        // AYOUBE already assigned above if ISSAM is playing, otherwise assign now
        if (!teamA.includes('AYOUBE') && !teamB.includes('AYOUBE')) {
            const ayoubeTeam = Math.random() < 0.5 ? 'A' : 'B';
            if (ayoubeTeam === 'A') {
                teamA.push('AYOUBE');
            } else {
                teamB.push('AYOUBE');
            }
        }
        
        // YOUSSEF must go to opposite team of AYOUBE
        if (hasYoussef) {
            if (teamA.includes('AYOUBE')) {
                teamB.push('YOUSSEF');
            } else {
                teamA.push('YOUSSEF');
            }
        }
        
        // MOHAMMED: 50% chance to be with AYOUBE
        if (hasMohammed && !teamA.includes('MOHAMMED') && !teamB.includes('MOHAMMED')) {
            if (Math.random() < 0.5) {
                if (teamA.includes('AYOUBE')) {
                    teamA.push('MOHAMMED');
                } else {
                    teamB.push('MOHAMMED');
                }
            } else {
                if (teamA.includes('AYOUBE')) {
                    teamB.push('MOHAMMED');
                } else {
                    teamA.push('MOHAMMED');
                }
            }
        }
    }
    
    // KHALID always goes to Team A (red team)
    const hasKhalid = shuffled.includes('KHALID');
    if (hasKhalid && !teamA.includes('KHALID') && !teamB.includes('KHALID')) {
        teamA.push('KHALID');
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
    const selectionSection = document.querySelector('.selection-section');
    const teamAList = document.getElementById('teamA');
    const teamBList = document.getElementById('teamB');
    const teamAContainer = teamAList.closest('.team');
    const teamBContainer = teamBList.closest('.team');
    
    // Hide selection section and show teams section
    selectionSection.classList.add('hidden');
    teamsSection.classList.remove('hidden');
    
    // Randomly assign red/green colors to teams
    const teamAIsRed = Math.random() < 0.5;
    
    // Remove existing color classes
    teamAContainer.classList.remove('team-red', 'team-green');
    teamBContainer.classList.remove('team-red', 'team-green');
    
    // Assign colors randomly
    if (teamAIsRed) {
        teamAContainer.classList.add('team-red');
        teamBContainer.classList.add('team-green');
    } else {
        teamAContainer.classList.add('team-green');
        teamBContainer.classList.add('team-red');
    }
    
    // Ensure KHALID is always on the red team
    const hasKhalid = currentTeams.teamA.includes('KHALID') || currentTeams.teamB.includes('KHALID');
    if (hasKhalid) {
        const khalidInTeamA = currentTeams.teamA.includes('KHALID');
        const redTeamIsA = teamAContainer.classList.contains('team-red');
        
        // If KHALID is not on the red team, swap him
        if ((khalidInTeamA && !redTeamIsA) || (!khalidInTeamA && redTeamIsA)) {
            // Remove KHALID from current team
            if (khalidInTeamA) {
                const khalidIndex = currentTeams.teamA.indexOf('KHALID');
                currentTeams.teamA.splice(khalidIndex, 1);
                currentTeams.teamB.push('KHALID');
            } else {
                const khalidIndex = currentTeams.teamB.indexOf('KHALID');
                currentTeams.teamB.splice(khalidIndex, 1);
                currentTeams.teamA.push('KHALID');
            }
        }
    }
    
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

