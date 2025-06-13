import HomePage from "../pages/home/home-page";
import AboutPage from "../pages/about/about-page";
import StoryPage from "../pages/story/story-page";
import StoryListPage from "../pages/story/story-list-page";
import StoryArchivePage from "../pages/story/story-archive-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import LogoutPage from "../pages/auth/logout";
import Auth from "../pages/services/auth.js";

const auth = new Auth();

const routes = {
  "/": {
    page: () => new HomePage(),
    needAuth: true,
  },
  "/about": {
    page: () => new AboutPage(),
    needAuth: true,
  },
  "/story": {
    page: () => new StoryPage(),
    needAuth: true,
  },
  "/list-story": {
    page: () => new StoryListPage(),
    needAuth: true,
  },
  "/story-favorite": {
    page: () => new StoryArchivePage(),
    needAuth: true,
  },
  "/register": {
    page: () => new RegisterPage(auth),
    needGuest: true,
  },
  "/login": {
    page: () => new LoginPage(auth),
    needGuest: true,
  },
  "/logout": {
    page: () => new LogoutPage(auth),
    needAuth: true,
  },
};

export default routes;
