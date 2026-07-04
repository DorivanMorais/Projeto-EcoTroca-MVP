// js/components.js

// Dynamic Toast Notifications
function showToast(title, description, iconName = "award", color = "#10B981") {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = "eco-toast";
  toast.innerHTML = `
    <div class="toast-icon-wrapper" style="background-color: ${color}20; color: ${color};">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-body">
      <h4 class="toast-title">${title}</h4>
      <p class="toast-desc">${description}</p>
    </div>
  `;

  toastContainer.appendChild(toast);
  lucide.createIcons();

  // Trigger animations
  setTimeout(() => toast.classList.add("show"), 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Global modal template manager
function showModal({ title, subtitle, content, primaryBtnText, primaryBtnAction, secondaryBtnText, secondaryBtnAction }) {
  const modalOverlay = document.getElementById("modal-overlay");
  const modalContainer = document.getElementById("modal-container");
  
  if (!modalOverlay || !modalContainer) return;

  modalContainer.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${title}</h3>
      ${subtitle ? `<p class="modal-subtitle">${subtitle}</p>` : ""}
    </div>
    <div class="modal-body">
      ${content}
    </div>
    <div class="modal-footer">
      ${secondaryBtnText ? `<button class="btn btn-secondary" id="modal-btn-sec">${secondaryBtnText}</button>` : ""}
      <button class="btn btn-primary" id="modal-btn-pri">${primaryBtnText || "Entendido"}</button>
    </div>
  `;

  // Bind Buttons
  const btnPri = modalContainer.querySelector("#modal-btn-pri");
  btnPri.addEventListener("click", () => {
    if (primaryBtnAction) primaryBtnAction();
    hideModal();
  });

  if (secondaryBtnText) {
    const btnSec = modalContainer.querySelector("#modal-btn-sec");
    btnSec.addEventListener("click", () => {
      if (secondaryBtnAction) secondaryBtnAction();
      hideModal();
    });
  }

  // Show
  modalOverlay.classList.add("active");
  lucide.createIcons();
}

function hideModal() {
  const modalOverlay = document.getElementById("modal-overlay");
  if (modalOverlay) {
    modalOverlay.classList.remove("active");
  }
}

// Generate an elegant SVG QR Code mock with logo in center
function generateMockQRCode(payload, companyName, color = "#10B981") {
  // Let's create an SVG grid simulating a real QR code with a logo overlay
  const size = 180;
  const dotSize = 6;
  const cols = size / dotSize;
  
  let qrDots = "";
  // Seeded random dots to look like a real QR code
  let seed = 12345;
  function random() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      // Finder patterns (the big squares in the corners)
      const isFinder = 
        (r < 7 && c < 7) || // Top Left
        (r < 7 && c >= cols - 7) || // Top Right
        (r >= cols - 7 && c < 7); // Bottom Left

      // Logo clearing (center area)
      const isCenter = r > cols/2 - 4 && r < cols/2 + 4 && c > cols/2 - 4 && c < cols/2 + 4;

      if (isFinder) {
        // Render finder squares
        const isBorder = 
          (r === 0 || r === 6 || c === 0 || c === 6) && (r < 7 && c < 7) ||
          (r === 0 || r === 6 || c === cols - 7 || c === cols - 1) && (r < 7 && c >= cols - 7) ||
          (r === cols - 7 || r === cols - 1 || c === 0 || c === 6) && (r >= cols - 7 && c < 7);
        
        const isCenterFinder = 
          (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
          (r >= 2 && r <= 4 && c >= cols - 5 && c <= cols - 3) ||
          (r >= cols - 5 && r <= cols - 3 && c >= 2 && c <= 4);

        if (isBorder || isCenterFinder) {
          qrDots += `<rect x="${c * dotSize}" y="${r * dotSize}" width="${dotSize}" height="${dotSize}" fill="#1E293B" rx="1.5" />`;
        }
      } else if (isCenter) {
        // Empty center for logo
      } else {
        // Random dots with a threshold
        if (random() > 0.45) {
          qrDots += `<rect x="${c * dotSize}" y="${r * dotSize}" width="${dotSize}" height="${dotSize}" fill="#1E293B" rx="1" />`;
        }
      }
    }
  }

  // Draw SVG
  return `
    <div class="qr-code-wrapper" style="border-color: ${color}">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${qrDots}
        <!-- Logo Badge Overlay in the Center -->
        <rect x="${size/2 - 18}" y="${size/2 - 18}" width="36" height="36" rx="8" fill="${color}" />
        <text x="${size/2}" y="${size/2 + 5}" font-family="'Poppins', sans-serif" font-weight="700" font-size="14" fill="#FFFFFF" text-anchor="middle">
          ${companyName.substring(0, 2).toUpperCase()}
        </text>
      </svg>
      <div class="qr-payload-text">${payload}</div>
    </div>
  `;
}

// Utility: Format Iso Dates nicely
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (now.toDateString() === date.toDateString()) {
    // Check hours
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMins = Math.floor(diffTime / (1000 * 60));
      return diffMins <= 1 ? "Agora mesmo" : `Há ${diffMins} min`;
    }
    return `Hoje às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays === 1) {
    return `Ontem às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
}

// Community Counter Animation helper
function animateCountUp(elementId, targetValue, duration = 1500, suffix = "") {
  const obj = document.getElementById(elementId);
  if (!obj) return;
  
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const currentValue = Math.floor(progress * targetValue);
    
    // Format nicely with dots for thousands
    obj.innerText = currentValue.toLocaleString("pt-BR") + suffix;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerText = targetValue.toLocaleString("pt-BR") + suffix;
    }
  };
  window.requestAnimationFrame(step);
}
