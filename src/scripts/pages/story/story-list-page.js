import StoryListPresenter from "./story-list-presenter.js";
import MapLoader from "../../utils/map-loader.js";

export default class StoryListPage {
  constructor() {
    this.presenter = new StoryListPresenter(this);
    this._map = null;
  }

  async render() {
    try {
      await MapLoader.load();

      return `
        <section class="container">
          <h1>Story Feed</h1>
          
          <div class="filter-controls">
            <label class="checkbox-container">
              <input 
                type="checkbox" 
                id="locationFilter" 
                class="checkbox-input"
              >
              <span class="checkbox-custom"></span>
              <span class="checkbox-label">Show Locations</span>
            </label>

            <select id="pageSizeSelect">
              <option value="5" ${
                this.presenter.pageSize === 5 ? "selected" : ""
              }>5 per page</option>
              <option value="10" ${
                this.presenter.pageSize === 10 ? "selected" : ""
              }>10 per page</option>
              <option value="20" ${
                this.presenter.pageSize === 20 ? "selected" : ""
              }>20 per page</option>
            </select>
          </div>
          
          <div id="storiesContainer" class="stories-container"></div>
          
          <!-- Map Container -->
          <div class="map-section">
            <h2>Story Locations</h2>
            <div id="storyMap" style="height: 400px;"></div>
          </div>
          
          <div id="loadingIndicator" class="loading-indicator">Loading...</div>
          <div id="errorMessage" class="error-message"></div>
        </section>
      `;
    } catch (error) {
      console.error("Render error:", error);
      return `
        <section class="container">
          <div class="error-message">
            <h2>Failed to load page</h2>
            <p>${error.message}</p>
            <button id="retryButton" class="btn-retry">Try Again</button>
          </div>
        </section>
      `;
    }
  }

  async afterRender() {
    try {
      await this.presenter.initialize();
      this.setupEventListeners();

      if (typeof L !== "undefined") {
        this._initMap();
      }
    } catch (error) {
      console.error("Initialization error:", error);
      this.showError(`Initialization failed: ${error.message}`);
    }
  }

  _initMap() {
    this._map = L.map("storyMap").setView([-2.5489, 118.0149], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);
  }

  renderStories(stories) {
    const container = document.getElementById("storiesContainer");
    container.innerHTML = stories
      .map(
        (story) => `
      <div class="story-card" data-id="${story.id}">
        <img src="${story.photoUrl}" alt="Story image" class="story-image">
        <div class="story-content">
          <h3>${story.name || "Anonymous"}</h3>
          <p class="story-description">${story.description}</p>
          <div class="story-meta">
            <small class="story-date">📅 ${new Date(
              story.createdAt
            ).toLocaleString()}</small>
            ${
              story.location
                ? `<small class="story-location">📍 ${story.location}</small>`
                : ""
            }
          </div>
          <button class="btn-add-favorite" data-id="${
            story.id
          }">💾 Add to Favorite</button>
        </div>
      </div>
    `
      )
      .join("");

    this.presenter._bindFavoriteButtons(stories); // Bind event after DOM rendered
    this._updateStoryMap(stories);
  }

  _updateStoryMap(stories) {
    if (!this._map) return;

    this._map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this._map.removeLayer(layer);
      }
    });

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(this._map);

        const popupContent = `
          <div class="map-popup">
            <img src="${
              story.photoUrl
            }" alt="Story image" style="max-width: 100px; border-radius: 4px;">
            <h4>${story.name || "Anonymous"}</h4>
            <p>${story.description.substring(0, 100)}${
          story.description.length > 100 ? "..." : ""
        }</p>
            <small>${new Date(story.createdAt).toLocaleString()}</small>
          </div>
        `;

        marker.bindPopup(popupContent);

        if (stories.length === 1) {
          this._map.setView([story.lat, story.lon], 13);
        } else if (stories.length > 1) {
          const markerGroup = new L.FeatureGroup(
            stories
              .filter((s) => s.lat && s.lon)
              .map((s) => L.marker([s.lat, s.lon]))
          );
          this._map.fitBounds(markerGroup.getBounds().pad(0.2));
        }
      }
    });
  }

  setupEventListeners() {
    document
      .getElementById("locationFilter")
      .addEventListener("change", (e) => {
        this.presenter.setIncludeLocation(e.target.checked);
      });

    document
      .getElementById("pageSizeSelect")
      .addEventListener("change", (e) => {
        this.presenter.setPageSize(parseInt(e.target.value));
      });

    const retryButton = document.getElementById("retryButton");
    if (retryButton) {
      retryButton.addEventListener("click", () => window.location.reload());
    }
  }

  showLoading(show) {
    document.getElementById("loadingIndicator").style.display = show
      ? "block"
      : "none";
  }

  showError(message) {
    const errorElement = document.getElementById("errorMessage");
    errorElement.textContent = message;
    errorElement.style.display = message ? "block" : "none";
  }

  clearError() {
    this.showError("");
  }

  scrollToMap() {
    const mapElement = document.getElementById("storyMap");
    if (mapElement) {
      mapElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      mapElement.classList.add("map-highlight");
      setTimeout(() => {
        mapElement.classList.remove("map-highlight");
      }, 2000);
    }
  }
}
