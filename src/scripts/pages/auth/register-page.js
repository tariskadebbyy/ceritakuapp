import RegisterPresenter from "./register-presenter.js";

export default class RegisterPage {
  constructor(auth) {
    this.auth = auth;
    this.presenter = new RegisterPresenter(this, auth);
  }

  async render() {
    return `
      <section class="container">
        <div class="register-form">
          <h1>Register Here</h1>
          <form id="registerForm" class="form">
            <div class="form-group">
              <label for="name">Name:</label>
              <input type="text" id="name" name="name" required>
            </div>

            <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" name="email" required>
            </div>

            <div class="form-group">
              <label for="password">Password:</label>
              <input type="password" id="password" name="password" required>
            </div>

            <button type="submit" class="submit-btn">Register</button>
          </form>
          <div id="message" class="message"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      this.presenter.onSubmitRegister(name, email, password);
    });
  }

  showMessage(text, color) {
    const messageDiv = document.getElementById("message");
    messageDiv.textContent = text;
    messageDiv.style.color = color;
  }
}
