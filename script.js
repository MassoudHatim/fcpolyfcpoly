// Password protection
const SITE_PASSWORD = 'fcpoly2024'; // Change this to your desired password

// Check authentication
function checkAuth() {
    // Check if already authenticated in this session
    if (sessionStorage.getItem('authenticated') === 'true') {
        showContent();
        return;
    }
    
    // Show password prompt
    const overlay = document.getElementById('passwordOverlay');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmit = document.getElementById('passwordSubmit');
    const passwordError = document.getElementById('passwordError');
    
    // Check if elements exist
    if (!overlay || !passwordInput || !passwordSubmit || !passwordError) {
        console.error('Password protection elements not found');
        return;
    }
    
    overlay.classList.remove('hidden');
    
    // Handle password submission
    function handleSubmit() {
        const enteredPassword = passwordInput.value;
        
        if (enteredPassword === SITE_PASSWORD) {
            sessionStorage.setItem('authenticated', 'true');
            showContent();
        } else {
            passwordError.textContent = 'Incorrect password. Please try again.';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
    
    passwordSubmit.addEventListener('click', handleSubmit);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
}

function showContent() {
    document.getElementById('passwordOverlay').classList.add('hidden');
    document.getElementById('mainContent').style.display = 'block';
    // Initialize app after showing content
    if (typeof initApp === 'function') {
        initApp();
    }
}

// Initialize authentication check on page load (wait for DOM)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}

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
    
    // Store ISSAM and AYOUBE for later random placement (not at top)
    let issamToAssign = null;
    let ayoubeToAssign = null;
    let issamTargetTeam = null;
    let ayoubeTargetTeam = null;
    
    // Determine which teams ISSAM and AYOUBE should go to (they must be on different teams - 100% enforced)
    if (hasIssam && hasAyoube) {
        // Randomly assign AYOUBE to a team, ISSAM goes to the other
        const ayoubeTeam = Math.random() < 0.5 ? 'A' : 'B';
        ayoubeToAssign = 'AYOUBE';
        issamToAssign = 'ISSAM';
        ayoubeTargetTeam = ayoubeTeam;
        issamTargetTeam = ayoubeTeam === 'A' ? 'B' : 'A';
    } else if (hasAyoube) {
        ayoubeToAssign = 'AYOUBE';
        ayoubeTargetTeam = Math.random() < 0.5 ? 'A' : 'B';
    } else if (hasIssam) {
        issamToAssign = 'ISSAM';
        issamTargetTeam = Math.random() < 0.5 ? 'A' : 'B';
    }
    
    // Store team assignments for conflict players (but don't place them yet)
    let adilTargetTeam = null;
    let youssefTargetTeam = null;
    let mohammedTargetTeam = null;
    let khalidTargetTeam = 'A'; // KHALID always goes to Team A
    
    // Handle ISSAM/ADIL conflict (they must be on different teams)
    if (hasIssam && hasAdil) {
        // If ISSAM not yet assigned, determine teams
        if (!issamToAssign) {
            issamToAssign = 'ISSAM';
            issamTargetTeam = Math.random() < 0.5 ? 'A' : 'B';
        }
        // ADIL goes to opposite team of ISSAM
        adilTargetTeam = issamTargetTeam === 'A' ? 'B' : 'A';
    } else if (hasAdil) {
        // ADIL only has conflict with ISSAM, so if ISSAM not playing, ADIL can go anywhere
        // Will be assigned randomly later
    }
    
    // Handle remaining AYOUBE conflicts (YOUSSEF and MOHAMMED)
    if (hasAyoube) {
        // If AYOUBE not yet assigned, determine team
        if (!ayoubeToAssign) {
            ayoubeToAssign = 'AYOUBE';
            ayoubeTargetTeam = Math.random() < 0.5 ? 'A' : 'B';
        }
        
        // YOUSSEF must go to opposite team of AYOUBE
        if (hasYoussef) {
            youssefTargetTeam = ayoubeTargetTeam === 'A' ? 'B' : 'A';
        }
        
        // MOHAMMED: 50% chance to be with AYOUBE
        if (hasMohammed) {
            mohammedTargetTeam = Math.random() < 0.5 ? ayoubeTargetTeam : (ayoubeTargetTeam === 'A' ? 'B' : 'A');
        }
    } else if (hasYoussef) {
        // YOUSSEF only has conflict with AYOUBE, so if AYOUBE not playing, YOUSSEF can go anywhere
        // Will be assigned randomly later
    }
    
    // YOUSSEF and ADIL have no conflict with each other
    // When both ISSAM and AYOUBE are playing, they will be on different teams due to other conflicts
    // But when only one is playing, or neither, they can be together
    // The current logic already handles this correctly
    
    // Create a map of which team each player should go to
    const playerTeamMap = new Map();
    
    // Assign conflict players to their teams
    if (issamToAssign && issamTargetTeam) {
        playerTeamMap.set('ISSAM', issamTargetTeam);
    }
    if (ayoubeToAssign && ayoubeTargetTeam) {
        playerTeamMap.set('AYOUBE', ayoubeTargetTeam);
    }
    if (adilTargetTeam) {
        playerTeamMap.set('ADIL', adilTargetTeam);
    }
    if (youssefTargetTeam) {
        playerTeamMap.set('YOUSSEF', youssefTargetTeam);
    }
    if (mohammedTargetTeam) {
        playerTeamMap.set('MOHAMMED', mohammedTargetTeam);
    }
    if (hasKhalid) {
        playerTeamMap.set('KHALID', khalidTargetTeam);
    }
    
    // Distribute all remaining players randomly to balance teams
    const remaining = shuffled.filter(p => !playerTeamMap.has(p));
    
    // Shuffle remaining players for randomness
    const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
    
    // Distribute remaining players to balance teams
    shuffledRemaining.forEach((player) => {
        const teamAStrength = calculateTeamStrength(teamA);
        const teamBStrength = calculateTeamStrength(teamB);
        
        // Alternate or balance by strength
        if (teamAStrength <= teamBStrength) {
            playerTeamMap.set(player, 'A');
        } else {
            playerTeamMap.set(player, 'B');
        }
    });
    
    // Now place ALL players randomly in their assigned teams
    const randomPositions = [1, 2, 3, 4, 5, 6]; // All positions are random now
    
    // Separate players by team
    const teamAPlayers = [];
    const teamBPlayers = [];
    
    playerTeamMap.forEach((team, player) => {
        if (team === 'A') {
            teamAPlayers.push(player);
        } else {
            teamBPlayers.push(player);
        }
    });
    
    // Properly shuffle players within each team for truly random placement
    // Use Fisher-Yates shuffle for better randomness
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    shuffleArray(teamAPlayers);
    shuffleArray(teamBPlayers);
    
    // Assign to teams
    teamA.push(...teamAPlayers);
    teamB.push(...teamBPlayers);
    
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
    
    // Ensure KHALID is always on the red team (swap with another player to maintain balance)
    const hasKhalid = currentTeams.teamA.includes('KHALID') || currentTeams.teamB.includes('KHALID');
    if (hasKhalid) {
        const khalidInTeamA = currentTeams.teamA.includes('KHALID');
        const redTeamIsA = teamAContainer.classList.contains('team-red');
        
        // If KHALID is not on the red team, swap him with another player to maintain balance
        if ((khalidInTeamA && !redTeamIsA) || (!khalidInTeamA && redTeamIsA)) {
            if (khalidInTeamA) {
                // KHALID is in Team A but red team is Team B, swap with a player from Team B
                const khalidIndex = currentTeams.teamA.indexOf('KHALID');
                // Find a player from Team B to swap (prefer not AYOUBE, ISSAM, or ADIL due to conflicts)
                const swapPlayer = currentTeams.teamB.find(p => 
                    p !== 'AYOUBE' && p !== 'ISSAM' && p !== 'ADIL' && p !== 'YOUSSEF'
                ) || currentTeams.teamB[0]; // fallback to first player if needed
                
                if (swapPlayer) {
                    const swapIndex = currentTeams.teamB.indexOf(swapPlayer);
                    // Swap the players
                    currentTeams.teamA[khalidIndex] = swapPlayer;
                    currentTeams.teamB[swapIndex] = 'KHALID';
                }
            } else {
                // KHALID is in Team B but red team is Team A, swap with a player from Team A
                const khalidIndex = currentTeams.teamB.indexOf('KHALID');
                // Find a player from Team A to swap (prefer not AYOUBE, ISSAM, or ADIL due to conflicts)
                const swapPlayer = currentTeams.teamA.find(p => 
                    p !== 'AYOUBE' && p !== 'ISSAM' && p !== 'ADIL' && p !== 'YOUSSEF'
                ) || currentTeams.teamA[0]; // fallback to first player if needed
                
                if (swapPlayer) {
                    const swapIndex = currentTeams.teamA.indexOf(swapPlayer);
                    // Swap the players
                    currentTeams.teamB[khalidIndex] = swapPlayer;
                    currentTeams.teamA[swapIndex] = 'KHALID';
                }
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

// Initialize app (only after authentication)
function initApp() {
    // Event listeners
    document.getElementById('generateBtn').addEventListener('click', generateTeams);
    document.getElementById('reshuffleBtn').addEventListener('click', generateTeams);
    
    // Initialize player list
    initPlayerList();
}

// Initialize app if already authenticated on page load
if (sessionStorage.getItem('authenticated') === 'true') {
    // App will be initialized by showContent() which is called by checkAuth()
}

