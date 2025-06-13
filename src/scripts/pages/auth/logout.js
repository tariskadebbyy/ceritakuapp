export default class LogoutPage{
  constructor(auth) {
    this.auth = auth;
  }

  async render() {
    return `
        <div class="logout-container">
          <h2>Logging out...</h2>
          <div class="spinner"></div>
        </div>
      `;
  }

  async afterRender() {
    try {
      await this.auth.logout();
      setTimeout(() => {
        window.location.hash = "#/login";
      }, 1500);
    } catch (error) {
      console.error("Logout error:", error);
      window.location.hash = "#/";
    }
  }
}
