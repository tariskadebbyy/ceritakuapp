import { ACCESS_TOKEN_KEY } from '../../config.js';

export default class Auth {
  constructor() {
    this.isAuthenticated = this.checkAuth();
    this.listeners = [];
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
  }

  _notifyListeners() {
    this.listeners.forEach((callback) => callback());
  }

  login(token, remember = true) {
    if (remember) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
    this.isAuthenticated = true;
    this._notifyListeners();
  }

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    this.isAuthenticated = false;
    this._notifyListeners();
    return Promise.resolve();
  }

  checkAuth() {
    this.isAuthenticated = !!(
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(ACCESS_TOKEN_KEY)
    );
    return this.isAuthenticated;
  }

  getToken() {
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(ACCESS_TOKEN_KEY)
    );
  }
}
