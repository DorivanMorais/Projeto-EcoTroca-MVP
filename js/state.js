// js/state.js

const DEFAULT_STATE = {
  user: {
    name: "João Silva",
    email: "joao.silva@ecotroca.com.br",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" // Modern clean avatar
  },
  points: 1250,
  co2Saved: 10.0, // kg
  history: [
    {
      id: "h1",
      date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      type: "redeem",
      itemId: "renner-15off",
      title: "Resgatou Cupom Renner 15% OFF",
      points: -700,
      co2: 0,
      code: "ECO-RENN-8F32"
    },
    {
      id: "h2",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      type: "earn",
      itemId: "bike",
      title: "Andou de bicicleta",
      points: 50,
      co2: 0.5
    },
    {
      id: "h3",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000 - 3 * 3600 * 1000).toISOString(), // 1 day and 3 hours ago
      type: "earn",
      itemId: "recycle",
      title: "Reciclou plástico e metal",
      points: 20,
      co2: 0.2
    },
    {
      id: "h4",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      type: "earn",
      itemId: "bike",
      title: "Andou de bicicleta",
      points: 50,
      co2: 0.5
    },
    {
      id: "h5",
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      type: "earn",
      itemId: "tree",
      title: "Plantou uma muda de árvore",
      points: 100,
      co2: 1.0
    }
  ],
  unlockedAchievements: ["first_action", "pedal_power"]
};

class StateManager {
  constructor() {
    this.storageKey = "ecotroca_state_v1";
    this.listeners = [];
    this.loadState();
  }

  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.state = JSON.parse(stored);
        // Ensure state integrity
        if (!this.state.history) this.state.history = [];
        if (!this.state.unlockedAchievements) this.state.unlockedAchievements = [];
      } else {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        this.saveState();
      }
    } catch (e) {
      console.error("Error loading state, using defaults", e);
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      this.notifyListeners();
    } catch (e) {
      console.error("Error saving state", e);
    }
  }

  getState() {
    return this.state;
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => callback(this.state));
  }

  // Business Actions
  registerAction(actionId) {
    const action = ACTIONS.find(a => a.id === actionId);
    if (!action) return null;

    this.state.points += action.points;
    this.state.co2Saved = parseFloat((this.state.co2Saved + action.co2).toFixed(2));

    const newHistoryItem = {
      id: "h_" + Date.now(),
      date: new Date().toISOString(),
      type: "earn",
      itemId: action.id,
      title: action.title,
      points: action.points,
      co2: action.co2
    };

    this.state.history.unshift(newHistoryItem);
    this.checkAchievements();
    this.saveState();

    return {
      pointsEarned: action.points,
      co2Avoided: action.co2,
      newTotalPoints: this.state.points,
      newTotalCo2: this.state.co2Saved
    };
  }

  redeemReward(rewardId) {
    const reward = REWARDS.find(r => r.id === rewardId);
    if (!reward) return { success: false, error: "Recompensa não encontrada" };

    if (this.state.points < reward.points) {
      return { success: false, error: "Pontos insuficientes" };
    }

    const code = `ECO-${reward.company.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    this.state.points -= reward.points;

    const newHistoryItem = {
      id: "h_" + Date.now(),
      date: new Date().toISOString(),
      type: "redeem",
      itemId: reward.id,
      title: `Resgatou ${reward.name} (${reward.company})`,
      points: -reward.points,
      co2: 0,
      code: code
    };

    this.state.history.unshift(newHistoryItem);
    this.checkAchievements();
    this.saveState();

    return {
      success: true,
      code: code,
      pointsDeducted: reward.points,
      newTotalPoints: this.state.points
    };
  }

  getCurrentLevel() {
    let currentLevel = LEVELS[0];
    for (const lvl of LEVELS) {
      if (this.state.points >= lvl.minPoints) {
        currentLevel = lvl;
      }
    }
    return currentLevel;
  }

  getNextLevelInfo() {
    const currentLvlIndex = LEVELS.findIndex(l => l.name === this.getCurrentLevel().name);
    if (currentLvlIndex === -1 || currentLvlIndex === LEVELS.length - 1) {
      return { nextLevel: null, pointsNeeded: 0, percentProgress: 100 };
    }

    const nextLevel = LEVELS[currentLvlIndex + 1];
    const currentMin = LEVELS[currentLvlIndex].minPoints;
    const nextMin = nextLevel.minPoints;

    const pointsInCurrentRange = this.state.points - currentMin;
    const rangeTotal = nextMin - currentMin;
    const pointsNeeded = nextMin - this.state.points;
    const percentProgress = Math.min(100, Math.max(0, (pointsInCurrentRange / rangeTotal) * 100));

    return {
      nextLevel: nextLevel,
      pointsNeeded: pointsNeeded,
      percentProgress: percentProgress
    };
  }

  checkAchievements() {
    const earnHistory = this.state.history.filter(h => h.type === "earn");
    const redeemHistory = this.state.history.filter(h => h.type === "redeem");

    const unlock = (id) => {
      if (!this.state.unlockedAchievements.includes(id)) {
        this.state.unlockedAchievements.push(id);
        // Show success notification or toast in active app
        this.triggerAchievementToast(id);
      }
    };

    // Rule 1: First Action
    if (earnHistory.length >= 1) unlock("first_action");

    // Rule 2: Five Actions
    if (earnHistory.length >= 5) unlock("five_actions");

    // Rule 3: First Redeem
    if (redeemHistory.length >= 1) unlock("first_redeem");

    // Rule 4: Eco-Ciclista (Biked > 2.0 kg CO2)
    const bikeCo2 = earnHistory
      .filter(h => h.itemId === "bike")
      .reduce((acc, h) => acc + (h.co2 || 0), 0);
    if (bikeCo2 >= 2.0) unlock("pedal_power");
  }

  triggerAchievementToast(id) {
    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return;

    // We will dispatch a custom DOM event so the UI can listen and show a notification toast
    const event = new CustomEvent("achievementUnlocked", { detail: ach });
    window.dispatchEvent(event);
  }

  resetState() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }
}

// Global state instance
const store = new StateManager();
window.store = store; // Make it globally accessible for testing
