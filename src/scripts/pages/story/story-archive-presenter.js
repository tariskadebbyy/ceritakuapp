import { getAllStoriesFromDB, deleteStoryFromDB } from "../../data/database.js";

export default class StoryArchivePresenter {
  constructor(view) {
    this._view = view;
    this._currentPage = 1;
    this._pageSize = 10;
    this._stories = [];
    this._totalPages = 1;
  }

  async initialize() {
    await this._loadStories();
  }

  get currentPage() {
    return this._currentPage;
  }
  get pageSize() {
    return this._pageSize;
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

  async _loadStories() {
    this._view.showLoading(true);
    this._view.clearError();

    try {
      const allStories = await getAllStoriesFromDB();

      // Hitung total halaman
      this._totalPages = Math.ceil(allStories.length / this._pageSize) || 1;

      const start = (this._currentPage - 1) * this._pageSize;
      const end = start + this._pageSize;
      this._stories = allStories.slice(start, end);

      this._view.renderStories(this._stories);
    } catch (error) {
      console.error("Failed to load stories from IndexedDB:", error);
      this._view.showError("Failed to load local stories.");
    } finally {
      this._view.showLoading(false);
    }
  }

  async deleteStory(storyId) {
    try {
      // Menghapus story dari IndexedDB
      await deleteStoryFromDB(storyId);

      // Perbarui tampilan setelah menghapus
      await this._loadStories();
    } catch (error) {
      console.error("Error deleting story:", error);
      this._view.showError("Failed to delete the story.");
    }
  }
}
