import StoryArchivePresenter from "./story-archive-presenter.js";

export default class StoryListPage {
  constructor() {
    this.presenter = new StoryArchivePresenter(this);
  }

  async render() {
    try {
      return `
        <section class="container">
            <div class="filter-controls">
                <h1>Story Archive</h1>
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
    } catch (error) {
      console.error("Initialization error:", error);
      this.showError(`Initialization failed: ${error.message}`);
    }
  }

  renderStories(stories) {
    const container = document.getElementById("storiesContainer");
    container.innerHTML = stories
      .map(
        (story) => `
        <div class="story-card" data-id="${story.id}">
          <img src="${story.photoUrl}" alt="Story image" class="story-image" />
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
            <button class="delete-btn" data-id="${story.id}">Delete</button>
          </div>
        </div>
      `
      )
      .join("");

    // Re-attach event listeners after rendering
    this.setupDeleteButtonListeners();
  }

  setupEventListeners() {
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

  setupDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const storyId = e.target.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this story?")) {
          await this.presenter.deleteStory(storyId);
        }
      });
    });
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
}
