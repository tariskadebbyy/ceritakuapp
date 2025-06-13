export default class AuthModel {
  constructor() {
    this._baseUrl = "https://story-api.dicoding.dev/v1";
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - Full name
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @returns {Promise<Object>} Response data
   */
  async register({ name, email, password }) {
    try {
      const response = await fetch(`${this._baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - Email address
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Response data containing token
   */
  async login(email, password) {
    const response = await fetch(`${this._baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data; 
  }

  // /**
  //  * Validate email format
  //  * @param {string} email
  //  * @returns {boolean}
  //  */
  // validateEmail(email) {
  //   const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return re.test(email);
  // }

  // /**
  //  * Validate password strength
  //  * @param {string} password
  //  * @returns {boolean}
  //  */
  // validatePassword(password) {
  //   const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  //   return re.test(password);
  // }
}
