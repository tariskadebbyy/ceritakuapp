import LoginPresenter from "./login-presenter.js";

export default class LoginPage {
  constructor(auth) {
    this.auth = auth;
    this.presenter = new LoginPresenter(this, auth);
  }

  async render() {
    return `
      <section class="container">
        <div class="login-form">
          <h1>Login Here</h1>
          <form id="loginForm" class="form">
            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="submit-btn">Login</button>
          </form>
          <div id="message" class="message"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      this.presenter.onSubmitLogin(email, password);
    });
  }

  showMessage(text, color) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = text;
    messageDiv.style.color = color;
  }
}
