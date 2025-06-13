import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import Auth from "./services/auth";
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from "../templates";
import {
  isServiceWorkerAvailable,
  setupSkipToContent,
  transitionHelper,
} from "../utils";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #auth = null;
  #skipLink = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#auth = new Auth();
    this.#skipLink = document.querySelector(".skip-to-content");

    this._setupDrawer();
    this._setupAuth();
    this._setupSkipToContent();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  _setupAuth() {
    this.#auth.onAuthStateChanged(() => this._updateNavigationUI());

    this._updateNavigationUI();
  }

  async _updateNavigationUI() {
    const navDrawer = this.#navigationDrawer;
    if (!navDrawer) return;

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    navDrawer.innerHTML = this.#auth.isAuthenticated
      ? generateAuthenticatedNavigationListTemplate(isSubscribed)
      : generateUnauthenticatedNavigationListTemplate();

    if (this.#auth.isAuthenticated) {
      const subBtn = document.getElementById("subscribe-button");
      const unsubBtn = document.getElementById("unsubscribe-button");

      if (subBtn) {
        subBtn.addEventListener("click", () => {
          subscribe().finally(() => this._updateNavigationUI());
        });
      }

      if (unsubBtn) {
        unsubBtn.addEventListener("click", () => {
          unsubscribe().finally(() => this._updateNavigationUI());
        });
      }
    }
  }

  _setupSkipToContent() {
    if (!this.#skipLink) return;

    const updateSkipLink = () => {
      const currentHash = window.location.hash || "#/";
      this.#skipLink.href = `${currentHash}#main-content`;
    };

    updateSkipLink();

    window.addEventListener("hashchange", updateSkipLink);

    this.#skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.#content.focus();
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];

    if (!route) {
      window.location.hash = "/";
      return;
    }

    if (route.needAuth && !this.#auth.checkAuth()) {
      window.location.hash = "/login";
      return;
    }

    if (route.needGuest && this.#auth.checkAuth()) {
      window.location.hash = "/";
      return;
    }

    if (!document.startViewTransition) {
      return this.#renderPageWithoutTransition(route);
    }

    document.startViewTransition(async () => {
      await this.#renderPageWithoutTransition(route);
      if (window.location.hash.endsWith("#main-content")) {
        this.#content.focus();
      }
    });

    if (isServiceWorkerAvailable()) {
      this.#setupPushNotification();
    }
  }

  async #renderPageWithoutTransition(route) {
    try {
      const page = route.page(this.#auth);
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this._updateNavigationUI();
    } catch (error) {
      console.error("Page rendering error:", error);
      window.location.hash = "/";
    }
  }

  async #setupPushNotification() {
    const isSubscribed = await isCurrentPushSubscriptionAvailable();
    if (isSubscribed) {
      this.#navigationDrawer.innerHTML = generateUnsubscribeButtonTemplate();
      document
        .getElementById("unsubscribe-button")
        .addEventListener("click", () => {
          unsubscribe().finally(() => {
            this.#setupPushNotification();
          });
        });
      return;
    }

    this.#navigationDrawer.innerHTML = generateSubscribeButtonTemplate();
    document
      .getElementById("subscribe-button")
      .addEventListener("click", () => {
        subscribe().finally(() => {
          this.#setupPushNotification();
        });
      });
  }
}

export default App;
