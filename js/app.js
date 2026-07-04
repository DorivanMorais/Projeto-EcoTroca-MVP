// js/app.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Setup Bottom Navigation Clicks
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const targetRoute = item.getAttribute("data-route");
      if (targetRoute) {
        router.navigate(targetRoute);
      }
    });
  });

  // 2. Listen to route changes to trigger specific page renders
  window.addEventListener("routeChanged", (e) => {
    const { route, params } = e.detail;

    // Reset window scroll to top of viewport
    const container = document.getElementById("phone-screen-container") || window;
    container.scrollTo({ top: 0, behavior: "smooth" });

    switch (route) {
      case "login":
        if (typeof initLoginPage === "function") initLoginPage();
        break;
      case "home":
        if (typeof renderHomePage === "function") renderHomePage();
        break;
      case "actions":
        if (typeof renderActionsPage === "function") renderActionsPage();
        break;
      case "marketplace":
        if (typeof renderMarketplacePage === "function") renderMarketplacePage();
        break;
      case "reward-detail":
        if (typeof renderRewardDetailPage === "function") renderRewardDetailPage();
        break;
      case "profile":
        if (typeof renderProfilePage === "function") renderProfilePage();
        break;
    }
  });

  // 3. Listen to state changes to dynamically update active parts of the DOM
  store.subscribe((state) => {
    // If we are currently on home, update stats, balance, and recent list
    if (router.currentRoute === "home" && typeof renderHomePage === "function") {
      renderHomePage();
    }
    // If we are currently on the marketplace, we should update the points balance indicator
    if (router.currentRoute === "marketplace" && typeof renderMarketplacePage === "function") {
      renderMarketplacePage();
    }
    // If we are on profile, we update levels and logs
    if (router.currentRoute === "profile" && typeof renderProfilePage === "function") {
      renderProfilePage();
    }
  });

  // 4. Listen to global achievement unlocks to fire premium toast celebrations
  window.addEventListener("achievementUnlocked", (e) => {
    const achievement = e.detail;
    showToast(
      `Conquista Desbloqueada! 🏆`,
      `Você liberou a medalha "${achievement.title}".`,
      achievement.icon,
      achievement.color
    );
    
    // Play a dual vibrating pattern for achievements
    if (navigator.vibrate) {
      navigator.vibrate([100, 100, 200]);
    }
  });

  // 5. Initialize routing
  router.init();

  // Initial load of Lucide icons
  lucide.createIcons();
});
