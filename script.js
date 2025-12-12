// Initialize app
function initOnLoad() {
    // Initialize app
    if (typeof initApp === 'function') {
        initApp();
    }
}

// Initialize on page load (wait for DOM)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnLoad);
} else {
    initOnLoad();
}

// Player database with position tiers and conflicts
const players = {
    // Midfield players
    'KHALID': { tier: 'midfield', conflicts: [] },
    'MEHDI': { tier: 'midfield', conflicts: [] },
    'SOUFIANE': { tier: 'midfield', conflicts: [] },
    'SAID': { tier: 'midfield', conflicts: [] },
    
    // Everywhere players
    'AYMENE': { tier: 'everywhere', conflicts: [] },
    'AYOUBE': { tier: 'everywhere', conflicts: ['ISSAM', 'YOUSSEF', 'MOHAMMED'] },
    'SAAD': { tier: 'everywhere', conflicts: [] },
    
    // Back players
    'YOUSSEF': { tier: 'back', conflicts: ['AYOUBE'] },
    'AKD': { tier: 'back', conflicts: [] },
    'KAMAL': { tier: 'back', conflicts: [] },
    'MOHAMMED TATI': { tier: 'back', conflicts: [] },
    
    // Attackers
    'ISSAM': { tier: 'attacker', conflicts: ['AYOUBE', 'ADIL'] },
    'MOHAMMED': { tier: 'attacker', conflicts: ['AYOUBE'] }, // 50% conflict
    
    // Everywhere players
    'ADIL': { tier: 'everywhere', conflicts: ['ISSAM'] },
    'ABDELLAH': { tier: 'everywhere', conflicts: [] }
};

// Data Service Layer - Handles localStorage and optional API sync
const DataService = {
    // Get API URL (empty string means localStorage only)
    getApiUrl() {
        if (typeof window !== 'undefined' && typeof getApiUrl === 'function') {
            return getApiUrl();
        }
        // Fallback: check CONFIG if available
        if (typeof CONFIG !== 'undefined' && CONFIG.API_URL) {
            return CONFIG.API_URL;
        }
        return '';
    },
    
    // Check if API is available
    async checkApiAvailable() {
        const apiUrl = this.getApiUrl();
        if (!apiUrl) return false;
        
        try {
            const response = await fetch(`${apiUrl}/nextMatch/1`, { 
                method: 'GET',
                signal: AbortSignal.timeout(3000) // 3 second timeout
            });
            return response.ok || response.status === 404; // 404 is OK, means server is up
        } catch (error) {
            return false;
        }
    },
    
    // Save next match (localStorage + optional API)
    async saveNextMatch(data) {
        // Always save to localStorage first
        localStorage.setItem(CONFIG.STORAGE_KEYS.NEXT_MATCH, JSON.stringify(data));
        
        // Try to sync with API if available
        const apiUrl = this.getApiUrl();
        if (apiUrl) {
            try {
                const apiData = { id: 1, ...data };
                await fetch(`${apiUrl}/nextMatch/1`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(apiData)
                }).catch(() => {
                    // If PUT fails, try POST
                    return fetch(`${apiUrl}/nextMatch`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(apiData)
                    });
                });
            } catch (error) {
                console.log('API sync failed, using localStorage only:', error);
            }
        }
    },
    
    // Load next match (try API first, fallback to localStorage)
    async loadNextMatch() {
        const apiUrl = this.getApiUrl();
        
        // Try API first if available
        if (apiUrl) {
            try {
                const response = await fetch(`${apiUrl}/nextMatch/1`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.validated && data.teamA && data.teamA.length > 0) {
                        // Sync to localStorage
                        localStorage.setItem(CONFIG.STORAGE_KEYS.NEXT_MATCH, JSON.stringify(data));
                        return data;
                    }
                }
            } catch (error) {
                console.log('API load failed, using localStorage:', error);
            }
        }
        
        // Fallback to localStorage
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.NEXT_MATCH);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error parsing stored next match:', e);
            }
        }
        
        return null;
    },
    
    // Save historique match (localStorage + optional API)
    async saveHistoriqueMatch(data) {
        // Load existing historique from localStorage
        let historique = this.loadHistoriqueMatchesSync();
        
        // Add new match
        historique.unshift(data); // Add to beginning
        
        // Keep only last 50 matches
        if (historique.length > 50) {
            historique = historique.slice(0, 50);
        }
        
        // Save to localStorage
        localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORIQUE, JSON.stringify(historique));
        
        // Try to sync with API if available
        const apiUrl = this.getApiUrl();
        if (apiUrl) {
            try {
                await fetch(`${apiUrl}/historique`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } catch (error) {
                console.log('API sync failed, using localStorage only:', error);
            }
        }
    },
    
    // Load historique matches (try API first, fallback to localStorage)
    async loadHistoriqueMatches() {
        const apiUrl = this.getApiUrl();
        
        // Try API first if available
        if (apiUrl) {
            try {
                const response = await fetch(`${apiUrl}/historique?_sort=date&_order=desc`);
                if (response.ok) {
                    const data = await response.json();
                    // Sync to localStorage
                    localStorage.setItem(CONFIG.STORAGE_KEYS.HISTORIQUE, JSON.stringify(data));
                    return data;
                }
            } catch (error) {
                console.log('API load failed, using localStorage:', error);
            }
        }
        
        // Fallback to localStorage
        return this.loadHistoriqueMatchesSync();
    },
    
    // Load historique from localStorage synchronously
    loadHistoriqueMatchesSync() {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEYS.HISTORIQUE);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                // Sort by date descending
                return data.sort((a, b) => new Date(b.date) - new Date(a.date));
            } catch (e) {
                console.error('Error parsing stored historique:', e);
            }
        }
        return [];
    }
};

let selectedPlayers = new Set();
let currentTeams = { teamA: [], teamB: [] };

// Initialize the player list
function initPlayerList() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    
    // Define the 12 players to preselect
    const preselectedPlayers = [
        'KHALID', 'MEHDI', 'SOUFIANE', 'SAID',  // Midfield players
        'YOUSSEF', 'AYOUBE',                     // Back and everywhere players
        'AKD', 'KAMAL', 'MOHAMMED TATI',         // Back players
        'ISSAM', 'MOHAMMED',                     // Attackers
        'ADIL'                                    // Everywhere player
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

// Calculate tier distribution balance score (lower is better)
function calculateTierBalance(teamA, teamB) {
    const tierCounts = { 'midfield': 0, 'attacker': 0, 'back': 0, 'everywhere': 0 };
    const teamATiers = { 'midfield': 0, 'attacker': 0, 'back': 0, 'everywhere': 0 };
    const teamBTiers = { 'midfield': 0, 'attacker': 0, 'back': 0, 'everywhere': 0 };
    
    // Count tiers in each team
    teamA.forEach(player => {
        const tier = players[player]?.tier || 'everywhere';
        teamATiers[tier]++;
    });
    
    teamB.forEach(player => {
        const tier = players[player]?.tier || 'everywhere';
        teamBTiers[tier]++;
    });
    
    // Calculate imbalance score (sum of absolute differences per tier)
    let imbalance = 0;
    Object.keys(tierCounts).forEach(tier => {
        imbalance += Math.abs(teamATiers[tier] - teamBTiers[tier]);
    });
    
    return imbalance;
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
    let bestBalance = Infinity;
    
    for (let attempt = 0; attempt < 50; attempt++) {
        const teams = createTeams(playerArray);
        const balance = calculateTierBalance(teams.teamA, teams.teamB);
        
        if (balance < bestBalance) {
            bestBalance = balance;
            bestTeams = teams;
            
            // If we found a perfect balance, use it
            if (balance === 0) break;
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
    const hasKhalid = shuffled.includes('KHALID');
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
    
    // MIDFIELD DISTRIBUTION LOGIC
    const midfielders = ['KHALID', 'MEHDI', 'SOUFIANE', 'SAID'].filter(p => shuffled.includes(p));
    const otherMidfielders = ['MEHDI', 'SOUFIANE', 'SAID'].filter(p => shuffled.includes(p));
    
    if (hasKhalid) {
        // KHALID is playing - apply special distribution rules
        if (otherMidfielders.length === 3) {
            // 4 midfielders total: KHALID + 1 on red (Team A), 2 on green (Team B)
            const khalidPartner = otherMidfielders[Math.floor(Math.random() * otherMidfielders.length)];
            const greenMidfielders = otherMidfielders.filter(m => m !== khalidPartner);
            
            if (!playerTeamMap.has(khalidPartner)) {
                playerTeamMap.set(khalidPartner, 'A'); // With KHALID on Team A (red)
            }
            greenMidfielders.forEach(midfielder => {
                if (!playerTeamMap.has(midfielder)) {
                    playerTeamMap.set(midfielder, 'B'); // On Team B (green)
                }
            });
        } else if (otherMidfielders.length === 2) {
            // 3 midfielders total: KHALID + 1 on red (Team A), 1 on green (Team B)
            const khalidPartner = otherMidfielders[Math.floor(Math.random() * otherMidfielders.length)];
            const greenMidfielder = otherMidfielders.find(m => m !== khalidPartner);
            
            if (!playerTeamMap.has(khalidPartner)) {
                playerTeamMap.set(khalidPartner, 'A'); // With KHALID on Team A (red)
            }
            if (greenMidfielder && !playerTeamMap.has(greenMidfielder)) {
                playerTeamMap.set(greenMidfielder, 'B'); // On Team B (green)
            }
        } else if (otherMidfielders.length === 1) {
            // 2 midfielders total: KHALID on red (Team A), 1 on green (Team B)
            const greenMidfielder = otherMidfielders[0];
            if (!playerTeamMap.has(greenMidfielder)) {
                playerTeamMap.set(greenMidfielder, 'B'); // On Team B (green)
            }
        }
        // If only KHALID (1 midfielder), he's already assigned to Team A
    } else {
        // KHALID is NOT playing - distribute evenly
        if (otherMidfielders.length === 3) {
            // 3 midfielders: 2 on one team, 1 on other team (random)
            const teamWithTwo = Math.random() < 0.5 ? 'A' : 'B';
            const teamWithOne = teamWithTwo === 'A' ? 'B' : 'A';
            
            const shuffledMids = [...otherMidfielders].sort(() => Math.random() - 0.5);
            if (!playerTeamMap.has(shuffledMids[0])) {
                playerTeamMap.set(shuffledMids[0], teamWithTwo);
            }
            if (!playerTeamMap.has(shuffledMids[1])) {
                playerTeamMap.set(shuffledMids[1], teamWithTwo);
            }
            if (!playerTeamMap.has(shuffledMids[2])) {
                playerTeamMap.set(shuffledMids[2], teamWithOne);
            }
        } else if (otherMidfielders.length === 2) {
            // 2 midfielders: 1 on each team
            const shuffledMids = [...otherMidfielders].sort(() => Math.random() - 0.5);
            if (!playerTeamMap.has(shuffledMids[0])) {
                playerTeamMap.set(shuffledMids[0], 'A');
            }
            if (!playerTeamMap.has(shuffledMids[1])) {
                playerTeamMap.set(shuffledMids[1], 'B');
            }
        } else if (otherMidfielders.length === 1) {
            // 1 midfielder: goes to one team (random)
            const team = Math.random() < 0.5 ? 'A' : 'B';
            if (!playerTeamMap.has(otherMidfielders[0])) {
                playerTeamMap.set(otherMidfielders[0], team);
            }
        }
    }
    
    // Distribute all remaining players randomly to balance teams
    const remaining = shuffled.filter(p => !playerTeamMap.has(p));
    
    // Shuffle remaining players for randomness
    const shuffledRemaining = [...remaining].sort(() => Math.random() - 0.5);
    
    // Helper function to count tiers in a team from playerTeamMap
    function countTiersInTeam(teamLetter) {
        const tierCounts = { 'midfield': 0, 'attacker': 0, 'back': 0, 'everywhere': 0 };
        playerTeamMap.forEach((team, player) => {
            if (team === teamLetter) {
                const tier = players[player]?.tier || 'everywhere';
                tierCounts[tier]++;
            }
        });
        return tierCounts;
    }
    
    // Distribute remaining players to balance teams
    shuffledRemaining.forEach((player) => {
        const playerTier = players[player]?.tier || 'everywhere';
        
        // Check player count for balance
        const teamACount = Array.from(playerTeamMap.values()).filter(t => t === 'A').length;
        const teamBCount = Array.from(playerTeamMap.values()).filter(t => t === 'B').length;
        
        // Prioritize count balance
        if (teamACount < teamBCount) {
            // Team A has fewer players, assign to A
            playerTeamMap.set(player, 'A');
        } else if (teamBCount < teamACount) {
            // Team B has fewer players, assign to B
            playerTeamMap.set(player, 'B');
        } else {
            // Equal count, balance by tier distribution
            const teamATiers = countTiersInTeam('A');
            const teamBTiers = countTiersInTeam('B');
            
            // Assign to team with fewer players of this tier
            if (teamATiers[playerTier] <= teamBTiers[playerTier]) {
                playerTeamMap.set(player, 'A');
            } else {
                playerTeamMap.set(player, 'B');
            }
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
    
    // Shuffle players within each team for random placement
    teamAPlayers.sort(() => Math.random() - 0.5);
    teamBPlayers.sort(() => Math.random() - 0.5);
    
    // Assign to teams
    teamA.push(...teamAPlayers);
    teamB.push(...teamBPlayers);
    
    return { teamA, teamB };
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
    
    // Determine which team should be red
    const hasKhalid = currentTeams.teamA.includes('KHALID') || currentTeams.teamB.includes('KHALID');
    let teamAIsRed;
    
    if (hasKhalid) {
        // KHALID's team becomes red
        teamAIsRed = currentTeams.teamA.includes('KHALID');
    } else {
        // If KHALID not playing, randomly assign red/green
        teamAIsRed = Math.random() < 0.5;
    }
    
    // Remove existing color classes
    teamAContainer.classList.remove('team-red', 'team-green');
    teamBContainer.classList.remove('team-red', 'team-green');
    
    // Assign colors
    if (teamAIsRed) {
        teamAContainer.classList.add('team-red');
        teamBContainer.classList.add('team-green');
    } else {
        teamAContainer.classList.add('team-green');
        teamBContainer.classList.add('team-red');
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
    
    // Set default date/time to current date/time
    const matchDateTimeInput = document.getElementById('matchDateTime');
    if (matchDateTimeInput) {
        const now = new Date();
        // Format: YYYY-MM-DDTHH:mm (datetime-local format)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        matchDateTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}

// Validate teams and save (localStorage + optional API)
async function validateTeams() {
    if (!currentTeams.teamA.length || !currentTeams.teamB.length) {
        alert('Please generate teams first');
        return;
    }

    // Get the selected match date/time
    const matchDateTimeInput = document.getElementById('matchDateTime');
    let matchDate;
    
    if (matchDateTimeInput && matchDateTimeInput.value) {
        // Use the selected date/time
        matchDate = new Date(matchDateTimeInput.value).toISOString();
    } else {
        // Fallback to current date/time if not set
        alert('Please select a match date and time');
        return;
    }

    try {
        const nextMatchData = {
            date: matchDate,
            teamA: currentTeams.teamA,
            teamB: currentTeams.teamB,
            validated: true
        };

        // Save next match (localStorage + optional API)
        await DataService.saveNextMatch(nextMatchData);

        // Save to historique matches
        const historiqueData = {
            date: matchDate,
            teamA: currentTeams.teamA,
            teamB: currentTeams.teamB
        };

        await DataService.saveHistoriqueMatch(historiqueData);

        alert('Teams validated and saved!');
        
        // Reload displays
        loadNextMatchTeam();
        loadHistoriqueMatches();
        
        // Hide teams section and show selection section
        document.getElementById('teamsSection').classList.add('hidden');
        document.querySelector('.selection-section').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error validating teams:', error);
        alert('Error saving teams. Data saved locally.');
    }
}

// Load next match team (localStorage + optional API)
async function loadNextMatchTeam() {
    try {
        const data = await DataService.loadNextMatch();
        
        if (data && data.validated && data.teamA && data.teamA.length > 0) {
            displayNextMatchTeam(data);
        } else {
            document.getElementById('nextMatchSection').classList.add('hidden');
        }
    } catch (error) {
        console.error('Error loading next match:', error);
        document.getElementById('nextMatchSection').classList.add('hidden');
    }
}

// Display next match team
function displayNextMatchTeam(data) {
    const nextMatchSection = document.getElementById('nextMatchSection');
    const teamAList = document.getElementById('nextMatchTeamA');
    const teamBList = document.getElementById('nextMatchTeamB');
    const dateElement = document.getElementById('nextMatchDate');
    const teamAContainer = teamAList.closest('.team');
    const teamBContainer = teamBList.closest('.team');

    nextMatchSection.classList.remove('hidden');

    // Determine team colors (check if KHALID is in teamA or teamB)
    const hasKhalid = data.teamA.includes('KHALID') || data.teamB.includes('KHALID');
    let teamAIsRed;

    if (hasKhalid) {
        teamAIsRed = data.teamA.includes('KHALID');
    } else {
        // Random assignment if KHALID not playing
        teamAIsRed = Math.random() < 0.5;
    }

    // Remove existing color classes
    teamAContainer.classList.remove('team-red', 'team-green');
    teamBContainer.classList.remove('team-red', 'team-green');

    // Assign colors
    if (teamAIsRed) {
        teamAContainer.classList.add('team-red');
        teamBContainer.classList.add('team-green');
    } else {
        teamAContainer.classList.add('team-green');
        teamBContainer.classList.add('team-red');
    }

    // Display teams
    teamAList.innerHTML = '';
    teamBList.innerHTML = '';

    data.teamA.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        teamAList.appendChild(li);
    });

    data.teamB.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        teamBList.appendChild(li);
    });

    // Display date
    const date = new Date(data.date);
    dateElement.textContent = `Match Date: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Load historique matches (localStorage + optional API)
async function loadHistoriqueMatches() {
    try {
        const matches = await DataService.loadHistoriqueMatches();
        displayHistoriqueMatches(matches);
    } catch (error) {
        console.error('Error loading historique:', error);
        document.getElementById('historiqueList').innerHTML = '<p class="no-matches">Error loading match history.</p>';
    }
}

// Display historique matches
function displayHistoriqueMatches(matches) {
    const historiqueList = document.getElementById('historiqueList');
    
    if (matches.length === 0) {
        historiqueList.innerHTML = '<p class="no-matches">No match history yet.</p>';
        return;
    }

    historiqueList.innerHTML = '';

    matches.forEach(match => {
        const matchCard = document.createElement('div');
        matchCard.className = 'match-card';

        const date = new Date(match.date);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

        matchCard.innerHTML = `
            <div class="match-header">
                <h3>Match - ${dateStr}</h3>
            </div>
            <div class="match-teams">
                <div class="match-team">
                    <h4>Team A</h4>
                    <ul>
                        ${match.teamA.map(player => `<li>${player}</li>`).join('')}
                    </ul>
                </div>
                <div class="match-team">
                    <h4>Team B</h4>
                    <ul>
                        ${match.teamB.map(player => `<li>${player}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        historiqueList.appendChild(matchCard);
    });
}

// Initialize app (only after authentication)
function initApp() {
    // Event listeners
    document.getElementById('generateBtn').addEventListener('click', generateTeams);
    document.getElementById('reshuffleBtn').addEventListener('click', generateTeams);
    document.getElementById('validateBtn').addEventListener('click', validateTeams);
    
    // Initialize player list
    initPlayerList();
    
    // Load next match team and historique
    loadNextMatchTeam();
    loadHistoriqueMatches();
}


