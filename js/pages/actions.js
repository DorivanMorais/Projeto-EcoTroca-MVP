// js/pages/actions.js

function renderActionsPage() {
  const actionsList = document.getElementById("actions-list-container");
  if (!actionsList) return;

  actionsList.innerHTML = ACTIONS.map(action => {
    // Select styling and custom colors for categories
    let catColor = "#10B981"; // green
    if (action.category === "transport") catColor = "#3B82F6"; // blue
    if (action.category === "energy") catColor = "#F59E0B"; // amber
    if (action.category === "nature") catColor = "#059669"; // dark green

    return `
      <div class="action-card" data-action-id="${action.id}">
        <div class="action-card-left">
          <div class="action-icon-container" style="background-color: ${catColor}15; color: ${catColor}">
            <i data-lucide="${action.icon}"></i>
          </div>
          <div class="action-info">
            <h4 class="action-title">${action.title}</h4>
            <p class="action-desc">${action.description}</p>
          </div>
        </div>
        <div class="action-card-right">
          <span class="action-points-tag">+${action.points} pts</span>
          <span class="action-co2-tag">-${action.co2} kg CO₂</span>
        </div>
      </div>
    `;
  }).join("");

  // Attach event listeners to cards
  const cards = actionsList.querySelectorAll(".action-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const actionId = card.getAttribute("data-action-id");
      handleRegisterAction(actionId);
    });
  });

  lucide.createIcons();
}

let localStream = null; // Store reference to webcam stream

function handleRegisterAction(actionId) {
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action) return;

  // Render modal content
  const modalContentHtml = `
    <div class="proof-modal-body">
      <p class="proof-instruction">Envie uma foto ou arquivo para comprovar a sua ação ecológica de <strong>${action.title}</strong>:</p>
      
      <!-- Proof selection buttons -->
      <div class="proof-options-row" id="proof-options-container">
        <button class="btn btn-proof-option" id="btn-camera-opt">
          <i data-lucide="camera"></i>
          <span>Tirar Foto</span>
        </button>
        <button class="btn btn-proof-option" id="btn-file-opt">
          <i data-lucide="upload"></i>
          <span>Enviar Mídia</span>
        </button>
      </div>

      <!-- Hidden file input -->
      <input type="file" id="action-file-input" accept="image/*" style="display:none">

      <!-- Simulated camera block -->
      <div class="camera-simulator" id="camera-sim-box" style="display:none;">
        <div class="camera-viewfinder" id="camera-vf">
          <div class="camera-overlay-brackets"></div>
          <video id="camera-video-elem" autoplay playsinline style="width:100%; height:100%; object-fit:cover; display:none;"></video>
          <div class="camera-mock-view" id="camera-mock-placeholder">
            <i data-lucide="aperture" class="spinning-aperture"></i>
            <span>Carregando visor da câmera...</span>
          </div>
        </div>
        <div class="camera-controls">
          <button class="btn btn-secondary" style="padding: 8px 16px; font-size: 12px;" id="btn-cancel-camera">Voltar</button>
          <button class="camera-capture-btn" id="btn-capture-shot" title="Capturar Foto"></button>
          <div style="width: 60px;"></div> <!-- Spacer to center the button -->
        </div>
      </div>

      <!-- Upload Preview container -->
      <div class="proof-preview-box" id="preview-container" style="display:none;">
        <span class="preview-title">Comprovante anexado:</span>
        <div class="preview-image-container">
          <img id="preview-img-element" src="" alt="Pré-visualização">
          <button class="btn-remove-proof" id="btn-delete-preview" title="Remover anexo">
            <i data-lucide="x"></i>
          </button>
        </div>
        <p class="proof-filename-label" id="preview-filename-lbl"></p>
      </div>
    </div>
  `;

  // Show modal
  showModal({
    title: "Comprovar Atividade 🌱",
    subtitle: action.title,
    content: modalContentHtml,
    primaryBtnText: "Enviar para Validação",
    primaryBtnAction: () => {
      stopCameraStream();
      triggerValidationQueue(actionId);
    },
    secondaryBtnText: "Cancelar",
    secondaryBtnAction: () => {
      stopCameraStream();
    }
  });

  // Now, grab elements and customize behavior
  const modalContainer = document.getElementById("modal-container");
  const btnOptionsContainer = modalContainer.querySelector("#proof-options-container");
  const btnCameraOpt = modalContainer.querySelector("#btn-camera-opt");
  const btnFileOpt = modalContainer.querySelector("#btn-file-opt");
  const fileInput = modalContainer.querySelector("#action-file-input");
  
  const cameraSimBox = modalContainer.querySelector("#camera-sim-box");
  const cameraVf = modalContainer.querySelector("#camera-vf");
  const videoElem = modalContainer.querySelector("#camera-video-elem");
  const mockPlaceholder = modalContainer.querySelector("#camera-mock-placeholder");
  const btnCancelCamera = modalContainer.querySelector("#btn-cancel-camera");
  const btnCaptureShot = modalContainer.querySelector("#btn-capture-shot");

  const previewContainer = modalContainer.querySelector("#preview-container");
  const previewImg = modalContainer.querySelector("#preview-img-element");
  const previewFilename = modalContainer.querySelector("#preview-filename-lbl");
  const btnDeletePreview = modalContainer.querySelector("#btn-delete-preview");

  const primaryBtn = modalContainer.querySelector("#modal-btn-pri");
  
  // Disable validation button until a file is selected or shot captured
  primaryBtn.disabled = true;
  primaryBtn.classList.add("btn-disabled");
  primaryBtn.classList.remove("btn-primary");

  // Mock photos for the simulation if user has no webcam or denies permission
  const MOCK_PHOTOS = {
    bike: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=400&q=80",
    bus: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80",
    recycle: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=400&q=80",
    ecobag: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
    tree: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80",
    energy: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=400&q=80"
  };

  const getMockPhoto = () => {
    return MOCK_PHOTOS[actionId] || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80";
  };

  // Helper to stop webcam stream
  function stopCameraStream() {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }
  }

  // Handle successful attachment (either via file upload or camera photo)
  function handleAttachSuccess(imgDataUrl, filename) {
    stopCameraStream();
    cameraSimBox.style.display = "none";
    btnOptionsContainer.style.display = "none";
    
    // Display preview
    previewImg.src = imgDataUrl;
    previewFilename.innerText = filename;
    previewContainer.style.display = "flex";

    // Enable validation button
    primaryBtn.disabled = false;
    primaryBtn.classList.remove("btn-disabled");
    primaryBtn.classList.add("btn-primary");
  }

  // Bind FILE UPLOAD click
  btnFileOpt.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      handleAttachSuccess(event.target.result, file.name);
    };
    reader.readAsDataURL(file);
  });

  // Bind CAMERA Option click
  btnCameraOpt.addEventListener("click", () => {
    btnOptionsContainer.style.display = "none";
    cameraSimBox.style.display = "flex";

    // Request real webcam stream if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          localStream = stream;
          videoElem.srcObject = stream;
          videoElem.style.display = "block";
          mockPlaceholder.style.display = "none";
        })
        .catch(err => {
          console.warn("Camera access denied or unavailable, using high-fidelity simulation.", err);
          // Fallback to simulated camera view after 600ms loader
          setTimeout(() => {
            mockPlaceholder.innerHTML = `
              <img src="${getMockPhoto()}" style="width:100%; height:100%; object-fit:cover; border-radius: var(--radius-lg);">
              <div style="position:absolute; bottom: 8px; background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 10px;">Simulador de Câmera</div>
            `;
          }, 600);
        });
    } else {
      // Fallback directly
      setTimeout(() => {
        mockPlaceholder.innerHTML = `
          <img src="${getMockPhoto()}" style="width:100%; height:100%; object-fit:cover; border-radius: var(--radius-lg);">
          <div style="position:absolute; bottom: 8px; background: rgba(0,0,0,0.6); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 10px;">Simulador de Câmera</div>
        `;
      }, 600);
    }
  });

  // Bind Camera Voltar
  btnCancelCamera.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    stopCameraStream();
    videoElem.style.display = "none";
    videoElem.srcObject = null;
    mockPlaceholder.style.display = "flex";
    mockPlaceholder.innerHTML = `
      <i data-lucide="aperture" class="spinning-aperture"></i>
      <span>Carregando visor da câmera...</span>
    `;
    cameraSimBox.style.display = "none";
    btnOptionsContainer.style.display = "flex";
    lucide.createIcons();
  });

  // Bind Capture photo click
  btnCaptureShot.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger flash animation
    cameraVf.classList.add("camera-flash-active");
    
    // Simulate haptic click
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    setTimeout(() => {
      cameraVf.classList.remove("camera-flash-active");

      // Capture logic
      if (localStream) {
        // Draw from real video element into canvas
        const canvas = document.createElement("canvas");
        canvas.width = videoElem.videoWidth || 640;
        canvas.height = videoElem.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoElem, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/jpeg");
        handleAttachSuccess(dataUrl, `foto_${action.id}_${Math.floor(Math.random()*1000)}.jpg`);
      } else {
        // Return simulated snapshot
        handleAttachSuccess(getMockPhoto(), `foto_${action.id}_${Math.floor(Math.random()*1000)}.jpg`);
      }
    }, 300); // 300ms flash duration
  });

  // Bind Remove proof click
  btnDeletePreview.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    previewContainer.style.display = "none";
    previewImg.src = "";
    previewFilename.innerText = "";
    fileInput.value = ""; // Clear input file

    btnOptionsContainer.style.display = "flex";
    primaryBtn.disabled = true;
    primaryBtn.classList.add("btn-disabled");
    primaryBtn.classList.remove("btn-primary");
  });

  lucide.createIcons();
}

function triggerValidationQueue(actionId) {
  const action = ACTIONS.find(a => a.id === actionId);
  if (!action) return;

  // Show immediate notification
  showToast(
    "Comprovante Enviado 🔎",
    "Nossa equipe ESG está validando seu comprovante. Aguarde...",
    "clock",
    "#F59E0B"
  );

  // Navigate back to home so the user can see the notification arrive dynamically while they browse!
  router.navigate("home");

  // Wait 3 seconds
  setTimeout(() => {
    const result = store.registerAction(actionId);
    if (!result) return;

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // Toast Notification
    showToast(
      "Ação Aprovada! 🏆",
      `Seu comprovante de "${action.title}" foi validado. +${action.points} EcoPontos!`,
      "check-circle",
      "#16A34A"
    );

    // Show Success celebration modal
    showModal({
      title: "EcoAção Concluída! 🌱",
      subtitle: "A sua contribuição foi aprovada e validada.",
      content: `
        <div class="success-action-modal-body">
          <div class="success-gift-anim">
            <div class="leaf-glow"></div>
            <i data-lucide="${action.icon}" class="action-modal-large-icon"></i>
          </div>
          <h2 class="points-gain-indicator">+${result.pointsEarned} <span class="points-label">EcoPontos</span></h2>
          <div class="impact-comparison-card">
            <i data-lucide="cloud-rain" class="co2-modal-icon"></i>
            <div>
              <p class="co2-gain-desc">Você evitou a emissão de <strong>${result.co2Avoided} kg de CO₂</strong>.</p>
              <p class="co2-equivalent-comparison">Equivale a economizar energia elétrica residencial por 3 horas!</p>
            </div>
          </div>
          <div class="new-totals-bar">
            <div>
              <span>Novo Saldo:</span>
              <strong>${result.newTotalPoints} pts</strong>
            </div>
            <div class="vertical-divider"></div>
            <div>
              <span>Total CO₂ Evitado:</span>
              <strong>${result.newTotalCo2} kg</strong>
            </div>
          </div>
        </div>
      `,
      primaryBtnText: "Entendido",
      primaryBtnAction: () => {
        // Redraw/ensure active page reflects change (e.g. Home counts or Profile lists)
        if (router.currentRoute === "home" && typeof renderHomePage === "function") {
          renderHomePage();
        }
      }
    });
  }, 3000);
}
