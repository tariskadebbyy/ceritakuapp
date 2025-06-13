import StoryApiModel from "../../data/page-model.js";
import { saveStoryToFavorites } from "../../data/database.js";

export default class StoryListPresenter {
  constructor(view) {
    this._view = view;
    this._apiModel = new StoryApiModel();
    this._currentPage = 1;
    this._pageSize = 10;
    this._includeLocation = false;
    this._stories = [];
    this._totalPages = 1;
  }

  // =====================
  // 1. PUBLIC INTERFACE
  // =====================
  async initialize() {
    await this._loadStories();
    this._setupEventListeners();
  }

  get currentPage() {
    return this._currentPage;
  }
  get pageSize() {
    return this._pageSize;
  }
  get includeLocation() {
    return this._includeLocation;
  }
  get stories() {
    return this._stories;
  }
  get totalPages() {
    return this._totalPages;
  }

  setPageSize(size) {
    this._pageSize = size;
    this._currentPage = 1;
    this._loadStories();
  }

  setIncludeLocation(include) {
    this._includeLocation = include;
    this._currentPage = 1;
    this._loadStories();
  }

  goToNextPage() {
    if (this._currentPage < this._totalPages) {
      this._currentPage++;
      this._loadStories();
    }
  }

  goToPrevPage() {
    if (this._currentPage > 1) {
      this._currentPage--;
      this._loadStories();
    }
  }

  getStoryById(id) {
    return this._stories.find((story) => story.id === id);
  }

  // =====================
  // 2. PRIVATE METHODS
  // =====================
  async _loadStories() {
    this._view.showLoading(true);
    this._view.clearError();

    try {
      const response = await this._apiModel.getStories(
        this._currentPage,
        this._pageSize,
        this._includeLocation
      );

      if (!response.listStory) throw new Error("Invalid response format");

      this._stories = this._transformStoryData(response.listStory);
      this._totalPages = Math.ceil(response.total / this._pageSize) || 1;

      this._view.renderStories(this._stories);
    } catch (error) {
      console.error("Error loading stories:", error);
      this._view.showError(error.message);
    } finally {
      this._view.showLoading(false);
    }
  }

  _transformStoryData(stories) {
    return stories.map((story) => ({
      id: story.id,
      name: story.name || "Anonymous",
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
      location: story.location || null,
      lat: story.lat || null,
      lon: story.lon || null,
    }));
  }

  _setupEventListeners() {
    document
      .getElementById("locationFilter")
      ?.addEventListener("change", (e) => {
        this._handleLocationFilterChange(e.target.checked);
      });
  }

  async _handleLocationFilterChange(includeLocation) {
    this._includeLocation = includeLocation;
    this._currentPage = 1;

    await this._loadStories();

    if (includeLocation) {
      this._view.scrollToMap();
    }
  }

  async _bindFavoriteButtons(stories) {
    const buttons = document.querySelectorAll(".btn-add-favorite");
    buttons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const storyId = e.target.dataset.id;
        const story = stories.find((s) => s.id === storyId);

        try {
          await saveStoryToFavorites(story);
          alert("📌 Cerita berhasil ditambahkan ke favorit!");
        } catch (error) {
          console.error("Failed to save favorite:", error);
          alert("❌ Gagal menyimpan cerita ke favorit.");
        }
      });
    });
  }
}
