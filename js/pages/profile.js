// js/pages/profile.js

function renderProfilePage() {
  const state = store.getState();
  const level = store.getCurrentLevel();
  const nextLvlInfo = store.getNextLevelInfo();

  // 1. Render User Meta Profile details
  const profileDetails = document.getElementById("profile-details-wrapper");
  if (profileDetails) {
    profileDetails.innerHTML = `
      <div class="profile-avatar-container">
        <img src="${state.user.avatar}" alt="${state.user.name}" class="profile-avatar-img">
        <div class="profile-avatar-ring" style="border-color: ${level.color}"></div>
      </div>
      <h3 class="profile-user-name">${state.user.name}</h3>
      <p class="profile-user-email">${state.user.email}</p>
    `;
  }

  // 2. Render Gamification Level Progress Card
  const progressCard = document.getElementById("profile-level-card");
  if (progressCard) {
    const nextLevelName = nextLvlInfo.nextLevel ? nextLvlInfo.nextLevel.name : null;
    
    let progressSubtitle = "";
    if (nextLevelName) {
      progressSubtitle = `Faltam <strong>${nextLvlInfo.pointsNeeded} EcoPontos</strong> para alcançar o nível <strong>${nextLevelName}</strong>.`;
    } else {
      progressSubtitle = `Você atingiu o nível máximo! É um protetor supremo da floresta.`;
    }

    progressCard.innerHTML = `
      <div class="level-card-header">
        <div class="level-info-left">
          <span class="level-card-lbl">NÍVEL ATUAL</span>
          <h4 class="level-card-name" style="color: ${level.color}">
            <i data-lucide="${level.icon}" class="level-badge-main-icon"></i>
            <span>${level.name}</span>
          </h4>
        </div>
        <span class="profile-pts-indicator">${state.points} pts</span>
      </div>
      
      <!-- Progress Bar component -->
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: ${nextLvlInfo.percentProgress}%; background: linear-gradient(90deg, ${level.color}, #22C55E)"></div>
      </div>
      
      <p class="level-progress-subtext">${progressSubtitle}</p>
    `;
  }

  // 3. Render Achievements Grid (Medalhas)
  const achievementsGrid = document.getElementById("profile-achievements-grid");
  if (achievementsGrid) {
    achievementsGrid.innerHTML = ACHIEVEMENTS.map(ach => {
      const isUnlocked = state.unlockedAchievements.includes(ach.id);
      const cardClass = isUnlocked ? "badge-unlocked" : "badge-locked";
      const iconColor = isUnlocked ? ach.color : "#94A3B8";

      return `
        <div class="achievement-badge-card ${cardClass}">
          <div class="badge-icon-wrapper" style="background-color: ${iconColor}15; color: ${iconColor}">
            <i data-lucide="${isUnlocked ? ach.icon : 'lock'}"></i>
          </div>
          <h5 class="badge-title">${ach.title}</h5>
          <p class="badge-desc">${ach.description}</p>
          ${isUnlocked 
            ? `<span class="badge-status-tag tag-unlocked">Conquistado</span>` 
            : `<span class="badge-status-tag tag-locked">Bloqueado</span>`
          }
        </div>
      `;
    }).join("");
  }

  // 4. Render Complete Transaction History list
  const fullHistoryList = document.getElementById("profile-history-list");
  if (fullHistoryList) {
    if (state.history.length === 0) {
      fullHistoryList.innerHTML = `<div class="empty-state">Nenhum histórico disponível.</div>`;
    } else {
      fullHistoryList.innerHTML = state.history.map(item => {
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
              ${item.code ? `<span class="hist-code-lbl">Código: ${item.code}</span>` : ""}
            </div>
            <div class="hist-points ${valClass}">
              ${valSign}${item.points}
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // 5. Bind Reset State
  const resetBtn = document.getElementById("btn-reset-simulation");
  if (resetBtn) {
    // Clone to prevent double bind
    const newResetBtn = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
    
    newResetBtn.addEventListener("click", () => {
      showModal({
        title: "Resetar Simulação? 🔄",
        subtitle: "Esta ação restaurará os valores de pontos iniciais.",
        content: `
          <p class="modal-reset-desc">Isso irá redefinir o saldo para <strong>1250 EcoPontos</strong>, limpar os resgates recentes e redefinir o nível de João para <strong>Semente</strong>. Útil para demonstrações!</p>
        `,
        primaryBtnText: "Confirmar Reset",
        primaryBtnAction: () => {
          store.resetState();
          showToast("Simulação Reiniciada", "Os dados iniciais foram restaurados.", "rotate-ccw", "#F59E0B");
          router.navigate("login"); // Go back to splash onboarding
        },
        secondaryBtnText: "Cancelar"
      });
    });
  }

  lucide.createIcons();
}
