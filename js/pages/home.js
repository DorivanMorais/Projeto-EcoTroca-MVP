// js/pages/home.js

function renderHomePage() {
  const state = store.getState();
  const level = store.getCurrentLevel();
  const nextLvlInfo = store.getNextLevelInfo();

  // 1. Update Header Info
  const headerUser = document.getElementById("header-user");
  if (headerUser) {
    headerUser.innerHTML = `
      <div class="user-info">
        <img src="${state.user.avatar}" alt="${state.user.name}" class="avatar-img">
        <div>
          <span class="user-greeting">Olá, ${state.user.name.split(" ")[0]}</span>
          <div class="user-level-badge" style="background-color: ${level.color}15; color: ${level.color}">
            <i data-lucide="${level.icon}" class="level-icon-small"></i>
            <span>Nível ${level.name}</span>
          </div>
        </div>
      </div>
      <button class="notification-btn" id="notif-btn">
        <i data-lucide="bell"></i>
        <span class="notification-dot"></span>
      </button>
    `;
    
    document.getElementById("notif-btn")?.addEventListener("click", () => {
      showToast("Notificações", "Nenhuma novidade por aqui. Continue poupando CO₂!", "bell", "#3B82F6");
    });
  }

  // 2. Render Main Cards / Circular Graphic
  const balanceVal = document.getElementById("home-balance-val");
  const co2Val = document.getElementById("home-co2-val");
  
  if (balanceVal) {
    animateCountUp("home-balance-val", state.points, 1000);
  }
  if (co2Val) {
    animateCountUp("home-co2-val", state.co2Saved, 1000, " kg");
  }

  // 3. Render Circular Progress indicator inside the balance card
  const progressSvgContainer = document.getElementById("home-progress-svg");
  if (progressSvgContainer) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const progressPercent = nextLvlInfo.percentProgress;
    const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

    progressSvgContainer.innerHTML = `
      <svg class="radial-progress-svg" width="120" height="120" viewBox="0 0 120 120">
        <circle class="radial-bg" cx="60" cy="60" r="${radius}" stroke-width="8" />
        <circle class="radial-indicator" cx="60" cy="60" r="${radius}" stroke-width="8" 
          stroke-dasharray="${circumference}" 
          stroke-dashoffset="${strokeDashoffset}"
          stroke="${level.color}"
          transform="rotate(-90 60 60)" 
        />
        <!-- Inner level status text -->
        <text x="60" y="55" font-family="'Poppins', sans-serif" font-weight="700" font-size="14" fill="#1E293B" text-anchor="middle">
          ${Math.round(progressPercent)}%
        </text>
        <text x="60" y="75" font-family="'Inter', sans-serif" font-size="9" font-weight="500" fill="#64748B" text-anchor="middle">
          para ${nextLvlInfo.nextLevel ? nextLvlInfo.nextLevel.name : "Máximo"}
        </text>
      </svg>
    `;
  }

  // 4. Bind Action Button
  const regActionBtn = document.getElementById("btn-register-action-nav");
  if (regActionBtn) {
    // Rebind to avoid duplicate handlers
    const newBtn = regActionBtn.cloneNode(true);
    regActionBtn.parentNode.replaceChild(newBtn, regActionBtn);
    newBtn.addEventListener("click", () => {
      router.navigate("actions");
    });
  }

  // 5. Render Community Impact Stats
  // We trigger countups only on load or route changes to make it look alive
  animateCountUp("stat-users", 14820, 1500, "");
  animateCountUp("stat-actions", 142302, 1800, "");
  animateCountUp("stat-co2", 89250, 2000, " kg");

  // 6. Render Latest History Items (Last 3)
  const historyList = document.getElementById("home-recent-actions");
  if (historyList) {
    const recent = state.history.slice(0, 3);
    if (recent.length === 0) {
      historyList.innerHTML = `<div class="empty-state">Nenhuma ação registrada ainda.</div>`;
    } else {
      historyList.innerHTML = recent.map(item => {
        const isEarn = item.type === "earn";
        const valClass = isEarn ? "val-earn" : "val-redeem";
        const valSign = isEarn ? "+" : "";
        const iconName = isEarn 
          ? (ACTIONS.find(a => a.id === item.itemId)?.icon || "check-circle") 
          : "ticket";
        const colorStyle = isEarn ? "#10B981" : "#F59E0B";

        return `
          <div class="history-item">
            <div class="hist-icon-wrapper" style="background-color: ${colorStyle}15; color: ${colorStyle}">
              <i data-lucide="${iconName}"></i>
            </div>
            <div class="hist-details">
              <span class="hist-title">${item.title}</span>
              <span class="hist-date">${formatDate(item.date)}</span>
            </div>
            <div class="hist-points ${valClass}">
              ${valSign}${item.points}
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // Re-enable Lucide icons for fresh elements
  lucide.createIcons();
}
