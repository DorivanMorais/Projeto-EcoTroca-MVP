// js/router.js

class Router {
  constructor() {
    this.routes = {
      login: "page-login",
      home: "page-home",
      actions: "page-actions",
      marketplace: "page-marketplace",
      "reward-detail": "page-reward-detail",
      profile: "page-profile"
    };
    this.currentRoute = null;
    this.params = {};
    
    // Bind hashchange event
    window.addEventListener("hashchange", () => this.handleRoute());
  }

  init() {
    // If there is no hash, go to login (splash). If already logged in, we could redirect,
    // but a splash/login screen is nice for validation/presentation.
    if (!window.location.hash) {
      window.location.hash = "#/login";
    } else {
      this.handleRoute();
    }
  }

  navigate(route, params = {}) {
    this.params = params;
    let hash = `#/${route}`;
    if (params && Object.keys(params).length > 0) {
      const query = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
      hash += `?${query}`;
    }
    window.location.hash = hash;
  }

  handleRoute() {
    const hash = window.location.hash || "#/login";
    const pathAndQuery = hash.substring(2).split("?");
    const path = pathAndQuery[0] || "login";
    
    // Parse query params
    const queryParams = {};
    if (pathAndQuery[1]) {
      const pairs = pathAndQuery[1].split("&");
      for (const pair of pairs) {
        const [key, val] = pair.split("=");
        queryParams[decodeURIComponent(key)] = decodeURIComponent(val || "");
      }
    }
    this.params = queryParams;

    const pageId = this.routes[path];
    if (pageId) {
      this.switchToPage(path, pageId);
    } else {
      // Fallback
      this.navigate("home");
    }
  }

  switchToPage(route, pageId) {
    const oldRoute = this.currentRoute;
    this.currentRoute = route;

    // Dispatch global route change event
    const routeEvent = new CustomEvent("routeChanged", { 
      detail: { route: route, oldRoute: oldRoute, params: this.params } 
    });
    window.dispatchEvent(routeEvent);

    const pages = document.querySelectorAll(".app-page");
    const targetPage = document.getElementById(pageId);
    const appShell = document.getElementById("app-shell");
    const bottomNav = document.getElementById("bottom-nav");
    const loginWrapper = document.getElementById("login-wrapper");

    if (!targetPage) return;

    // Handle App Shell Visibility
    if (route === "login") {
      appShell.style.display = "none";
      loginWrapper.style.display = "flex";
      
      // Reset active page classes
      pages.forEach(p => p.classList.remove("active", "enter-active"));
      targetPage.classList.add("active");
      // Trigger reflow for transition
      void targetPage.offsetWidth;
      targetPage.classList.add("enter-active");
    } else {
      loginWrapper.style.display = "none";
      appShell.style.display = "flex";

      // Smooth transition
      pages.forEach(p => {
        if (p.id !== pageId) {
          p.classList.remove("active", "enter-active");
        }
      });

      targetPage.classList.add("active");
      // Trigger reflow for transition
      void targetPage.offsetWidth;
      targetPage.classList.add("enter-active");

      // Update active state in bottom navigation
      this.updateBottomNav(route);
    }
  }

  updateBottomNav(route) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      item.classList.remove("active");
      const targetRoute = item.getAttribute("data-route");
      
      // Match active states
      // Home page & Actions page both keep "Início" active or highlighting
      if (route === "home" && targetRoute === "home") {
        item.classList.add("active");
      } else if (route === "actions" && targetRoute === "home") {
        // Actions can highlight inicio or be neutral, user said: "Bottom Navigation fixa: Início, Recompensas, Perfil"
        item.classList.add("active");
      } else if (route === "marketplace" && targetRoute === "marketplace") {
        item.classList.add("active");
      } else if (route === "reward-detail" && targetRoute === "marketplace") {
        item.classList.add("active");
      } else if (route === "profile" && targetRoute === "profile") {
        item.classList.add("active");
      }
    });
  }
}

const router = new Router();
window.router = router;
