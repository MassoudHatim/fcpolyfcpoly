# ⚽ Football Match Manager

A React + TailwindCSS web application for managing football matches, MVP voting, and payment tracking. Built as a static site that can be deployed for free on GitHub Pages.

## 🚀 Features

### 👥 Team Picker
- Add player names to create a roster
- Randomly split players into two balanced teams
- Clear team assignments and regenerate
- Persistent storage using LocalStorage

### 🏆 MVP Voting
- Vote for the most valuable player (MVP)
- One vote per device (LocalStorage prevents multiple votes)
- Real-time leaderboard showing vote counts
- Admin controls to reset voting

### 💰 Payments Tracker
- Track 80dh payments per player
- Visual progress indicators
- Payment status table with toggle controls
- Financial summary with totals and pending amounts
- Bulk actions (mark all paid/unpaid)

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TailwindCSS** - Utility-first CSS framework
- **LocalStorage** - Client-side data persistence
- **GitHub Pages** - Free static hosting

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/football-match-manager.git
cd football-match-manager
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🚀 Deployment to GitHub Pages

1. **Update the homepage URL** in `package.json`:
```json
{
  "homepage": "https://yourusername.github.io/football-match-manager"
}
```

2. **Install gh-pages** (already included in devDependencies):
```bash
npm install --save-dev gh-pages
```

3. **Deploy to GitHub Pages**:
```bash
npm run deploy
```

This will:
- Build the production version
- Create a `gh-pages` branch
- Push the built files to GitHub Pages
- Make your app available at `https://yourusername.github.io/football-match-manager`

## 📱 Usage

### Adding Players
1. Go to the "Team Picker" tab
2. Enter player names and click "Add Player"
3. Click "Generate Teams" to randomly split players

### MVP Voting
1. Go to the "MVP Voting" tab
2. Select a player from the dropdown
3. Click "Vote Now" (one vote per device)
4. View the leaderboard with current vote counts

### Payment Tracking
1. Go to the "Payments" tab
2. Toggle payment status for each player
3. Use bulk actions for quick updates
4. View financial summary and progress

## 💾 Data Storage

All data is stored locally in your browser's LocalStorage:
- **Players**: `football-players`
- **MVP Votes**: `football-mvp-votes`
- **User Vote Status**: `football-user-voted`
- **Payment Status**: `football-payments`

## 🎨 Design Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Modern UI** - Clean, professional interface with TailwindCSS
- **Color-coded Teams** - Blue for Team A, Red for Team B
- **Progress Indicators** - Visual feedback for payments and voting
- **Accessibility** - Proper contrast and keyboard navigation

## 🔧 Customization

### Changing Payment Amount
Edit the `paymentAmount` constant in `src/components/PaymentsTracker.js`:
```javascript
const [paymentAmount] = useState(80); // Change to your desired amount
```

### Styling
Modify `src/index.css` and `tailwind.config.js` to customize colors and styling.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or issues, please open an issue on GitHub.
