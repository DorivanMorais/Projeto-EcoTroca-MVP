// js/pages/reward-detail.js

function renderRewardDetailPage() {
  const detailContainer = document.getElementById("reward-detail-container");
  if (!detailContainer) return;

  const rewardId = router.params.id;
  const reward = REWARDS.find(r => r.id === rewardId);
  const state = store.getState();

  if (!reward) {
    detailContainer.innerHTML = `
      <div class="empty-state">
        <p>Recompensa não encontrada.</p>
        <button class="btn btn-primary" onclick="router.navigate('marketplace')">Voltar ao Marketplace</button>
      </div>
    `;
    return;
  }

  const pointsNeeded = reward.points;
  const userPoints = state.points;
  const canRedeem = userPoints >= pointsNeeded;
  const pointsShort = pointsNeeded - userPoints;

  detailContainer.innerHTML = `
    <!-- Top Card / Header Visual -->
    <div class="detail-hero" style="background-color: ${reward.themeColor}">
      <button class="detail-back-btn" id="detail-back-btn">
        <i data-lucide="arrow-left"></i>
      </button>
      <div class="detail-brand-circle" style="background-color: ${reward.logoColor}">
        <span>${reward.logoText}</span>
      </div>
    </div>

    <!-- Info Section -->
    <div class="detail-body-content">
      <div class="detail-meta">
        <span class="detail-company">${reward.company}</span>
        <span class="detail-category-tag">${reward.category}</span>
      </div>
      <h2 class="detail-title">${reward.name}</h2>
      
      <!-- Cost tag -->
      <div class="detail-cost-tag-box">
        <div class="detail-cost-pts">
          <strong>${reward.points}</strong>
          <span>EcoPontos</span>
        </div>
        <div class="detail-user-balance">
          <span>Seu saldo atual:</span>
          <strong>${state.points} pts</strong>
        </div>
      </div>

      <div class="detail-divider"></div>

      <!-- Description -->
      <h4 class="detail-section-title">Sobre esta Recompensa</h4>
      <p class="detail-description">${reward.description}</p>

      <!-- ESG Pledge -->
      <div class="detail-esg-pledge-card">
        <div class="esg-pledge-header">
          <i data-lucide="shield-check" class="esg-pledge-icon"></i>
          <span>Compromisso Ambiental (ESG)</span>
          <span class="esg-verified-badge">Verificado</span>
        </div>
        <p class="esg-pledge-text">"${reward.esgCommitment}"</p>
      </div>

      <!-- Action Button Area -->
      <div class="detail-action-footer">
        ${canRedeem 
          ? `<button class="btn btn-primary btn-large btn-redeem-action" id="btn-execute-redeem">
               Resgatar Recompensa
             </button>`
          : `<div class="locked-redeem-msg">
               <i data-lucide="lock" class="lock-inline"></i>
               <span>Faltam <strong>${pointsShort} EcoPontos</strong> para este resgate.</span>
             </div>
             <button class="btn btn-disabled btn-large" disabled>
               Saldo Insuficiente
             </button>`
        }
      </div>
    </div>
  `;

  // Bind Back Button
  document.getElementById("detail-back-btn")?.addEventListener("click", () => {
    router.navigate("marketplace");
  });

  // Bind Redeem Execution
  if (canRedeem) {
    document.getElementById("btn-execute-redeem")?.addEventListener("click", () => {
      executeRedeemReward(reward);
    });
  }

  lucide.createIcons();
}

function executeRedeemReward(reward) {
  // Execute in State manager
  const result = store.redeemReward(reward.id);
  if (!result.success) {
    showToast("Erro no resgate", result.error, "alert-circle", "#EF4444");
    return;
  }

  // Play haptic
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }

  // Open modal showing QR Code and confirmation
  const qrCodeSvg = generateMockQRCode(result.code, reward.company, reward.logoColor);

  showModal({
    title: "Resgate Realizado! 🎉",
    subtitle: "Apresente o QR Code no estabelecimento para resgatar.",
    content: `
      <div class="success-redeem-modal-body">
        <h3 class="success-redeem-coupon-title">${reward.name}</h3>
        <p class="success-redeem-company">${reward.company}</p>
        
        <!-- QR Code container -->
        ${qrCodeSvg}
        
        <p class="qr-instructions-text">
          <i data-lucide="info" class="inline-info-icon"></i>
          Mostre este QR Code no caixa física ou digite o código em compras online.
        </p>

        <div class="new-totals-bar">
          <div>
            <span>Pontos Utilizados:</span>
            <strong class="color-redeem-pts">-${result.pointsDeducted} pts</strong>
          </div>
          <div class="vertical-divider"></div>
          <div>
            <span>Novo Saldo:</span>
            <strong>${result.newTotalPoints} pts</strong>
          </div>
        </div>
      </div>
    `,
    primaryBtnText: "Concluir",
    primaryBtnAction: () => {
      router.navigate("home");
    }
  });

  // Welcome back toast
  showToast("Recompensa resgatada", `Código ${result.code} gerado.`, "ticket", "#10B981");
}
