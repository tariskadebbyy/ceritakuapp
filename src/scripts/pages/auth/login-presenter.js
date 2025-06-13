import AuthModel from "../../data/auth-model.js";

export default class LoginPresenter {
  constructor(view, auth) {
    this.view = view;
    this.auth = auth;
    this.model = new AuthModel();
  }

  async onSubmitLogin(email, password) {
    if (!email || !password) {
      this.view.showMessage("Please fill in all fields", "red");  
      return;
    }

    try {
      const data = await this.model.login(email, password);

      console.log("API Response:", data);

      if (data && data.loginResult && data.loginResult.token) {
        this.view.showMessage("Login successful!", "green");

        console.log("Token yang diterima:", data.loginResult.token);
        this.auth.login(data.loginResult.token);

        setTimeout(() => {
          window.location.hash = "#/";
        }, 500);
      } else {
        this.view.showMessage("Login failed: Invalid response", "red");
      }
    } catch (error) {
      console.error("Login error:", error);
      this.view.showMessage(error.message, "red");
    }
  }
}
