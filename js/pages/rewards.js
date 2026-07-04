// js/pages/rewards.js

let activeCategoryFilter = "Todos";

function renderMarketplacePage() {
  const pointsBadge = document.getElementById("marketplace-points-badge");
  const state = store.getState();

  // 1. Update Points Indicator
  if (pointsBadge) {
    pointsBadge.innerHTML = `
      <span class="points-badge-label">Seu Saldo:</span>
      <strong class="points-badge-value">${state.points} EcoPontos</strong>
    `;
  }

  // 2. Setup Category Filters
  const filterContainer = document.getElementById("marketplace-filters");
  if (filterContainer) {
    const categories = ["Todos", "Alimentação", "Moda", "Serviços"];
    filterContainer.innerHTML = categories.map(cat => {
      const activeClass = cat === activeCategoryFilter ? "active" : "";
      return `
        <button class="filter-chip ${activeClass}" data-category="${cat}">
          ${cat}
        </button>
      `;
    }).join("");

    // Bind Filter Click
    const chips = filterContainer.querySelectorAll(".filter-chip");
    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        activeCategoryFilter = chip.getAttribute("data-category");
        renderMarketplacePage(); // Re-render lists
      });
    });
  }

  // 3. Render Rewards Grid
  const gridContainer = document.getElementById("rewards-grid");
  if (gridContainer) {
    const filteredRewards = activeCategoryFilter === "Todos" 
      ? REWARDS
      : REWARDS.filter(r => r.category === activeCategoryFilter);

    if (filteredRewards.length === 0) {
      gridContainer.innerHTML = `<div class="empty-state">Nenhuma recompensa disponível nesta categoria.</div>`;
    } else {
      gridContainer.innerHTML = filteredRewards.map(reward => {
        const canAfford = state.points >= reward.points;
        const buttonClass = canAfford ? "btn-reward-afford" : "btn-reward-locked";
        const lockIcon = canAfford ? "" : `<i data-lucide="lock" class="reward-lock-icon"></i>`;

        return `
          <div class="reward-card" data-reward-id="${reward.id}">
            <div class="reward-card-header" style="background-color: ${reward.themeColor}">
              <div class="reward-brand-circle" style="background-color: ${reward.logoColor}">
                <span>${reward.logoText}</span>
              </div>
              <span class="reward-esg-badge">
                <i data-lucide="leaf" class="esg-leaf-icon"></i>
                <span>${reward.esgBadge}</span>
              </span>
            </div>
            <div class="reward-card-body">
              <span class="reward-company">${reward.company}</span>
              <h4 class="reward-name">${reward.name}</h4>
              <div class="reward-price-row">
                <div class="reward-points-price">
                  <span class="price-val">${reward.points}</span>
                  <span class="price-lbl">pts</span>
                </div>
                <div class="reward-action-indicator ${buttonClass}">
                  ${lockIcon}
                  <span>Ver Detalhes</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join("");

      // Bind Clicks to Cards
      const cards = gridContainer.querySelectorAll(".reward-card");
      cards.forEach(card => {
        card.addEventListener("click", () => {
          const rewardId = card.getAttribute("data-reward-id");
          router.navigate("reward-detail", { id: rewardId });
        });
      });
    }
  }

  lucide.createIcons();
}
