// js/pages/login.js

function initLoginPage() {
  const loginBtn = document.getElementById("google-login-btn");
  if (!loginBtn) return;

  // Clone to remove previous listeners
  const newLoginBtn = loginBtn.cloneNode(true);
  loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

  newLoginBtn.addEventListener("click", () => {
    // Add premium loading feedback
    newLoginBtn.disabled = true;
    const originalText = newLoginBtn.innerHTML;
    newLoginBtn.innerHTML = `
      <div class="spinner"></div>
      <span>Conectando...</span>
    `;

    // Simulate authenticating for 900ms
    setTimeout(() => {
      newLoginBtn.innerHTML = originalText;
      newLoginBtn.disabled = false;
      
      // Navigate to home
      router.navigate("home");
      
      // Welcome toast
      const user = store.getState().user;
      showToast(
        `Olá, ${user.name.split(" ")[0]}!`,
        "Seja bem-vindo de volta ao EcoTroca.",
        "log-in",
        "#10B981"
      );
    }, 900);
  });
}
