export function generateSubscribeButtonTemplate() {
  return `
    <div class="push-notification-tools">
        <button id="subscribe-button" class="push-notification-btn subscribe" aria-label="Enable notifications">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
        </svg>
        <span>Enable Notifications</span>
        </button>
    </div>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <div class="push-notification-tools">
      <button id="unsubscribe-button" class="push-notification-btn unsubscribe" aria-label="Disable notifications">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14 22.5c0 .523-.43.934-.944.826a23.32 23.32 0 0 1-9.112 0A.939.939 0 0 1 3 22.5v-1.132c.655.44 1.423.774 2.25.958 1.055.24 2.096.386 3.125.442 1.027-.056 2.068-.202 3.124-.442.826-.184 1.594-.519 2.25-.958V22.5z"/>
          <path d="M3.5 0a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5zm0 3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0v-1a.5.5 0 0 1 .5-.5z"/>
        </svg>
        <span>Disable Notifications</span>
      </button>
    </div>
  `;
}

export function pushNotificationContainerTemplate() {
  return `
    <div id="push-notification-tools" class="push-notification-container"></div>
  `;
}

export function generateAuthenticatedNavigationListTemplate(isSubscribed) {
  return `
    <ul id="nav-list" class="nav-list">
      <li><a href="#/" class="nav-link">Beranda</a></li>
      <li><a href="#/story" class="nav-link">Create Story</a></li>
      <li><a href="#/list-story" class="nav-link">List Story</a></li>
      <li><a href="#/story-favorite" class="nav-link">Story Favorite</a></li>
      <li><a href="#/about" class="nav-link">About</a></li>
      <li><a href="#/logout" class="nav-link">Logout</a></li>
      <li>
        ${
          isSubscribed
            ? `<button id="unsubscribe-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <!-- Bell icon with slash -->
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
                  <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
                  <path d="M18 8a6 6 0 0 0-9.33-5"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <span>Disable Notification</span>
              </button>`
            : `<button id="subscribe-button" class="btn btn-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
                </svg>
                <span>Enable Notification</span>
              </button>`
        }
      </li>
    </ul>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <ul id="nav-list" class="nav-list">
      <li><a href="#/" class="nav-link" data-route="/">Beranda</a></li>
      <li><a href="#/story" class="nav-link" data-route="/story">Create Story</a></li>
      <li><a href="#/list-story" class="nav-link" data-route="/list-story">List Story</a></li>
      <li><a href="#/story-favorite" class="nav-link" data-route="/story-favorite">Story Favorite</a></li>
      <li><a href="#/about" class="nav-link" data-route="/about">About</a></li>
      <li><a href="#/login" class="nav-link" id="loginLink" data-route="/login">Login</a></li>
      <li><a href="#/register" class="nav-link" id="registerLink" data-route="/register">Register</a></li>
    </ul>
  `;
}
