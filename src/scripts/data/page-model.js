import Auth from "../pages/services/auth.js";
export default class StoryApiModel {
  constructor() {
    this._baseUrl = "https://story-api.dicoding.dev/v1";
  }

  /**
   * Submit a new story
   * @param {FormData} formData - Story data including photo, description, and location
   * @returns {Promise<Object>} Response data
   */
  async submitStory(formData) {
    try {
      const token = new Auth().getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch(`${this._baseUrl}/stories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit story");
      }

      return await response.json();
    } catch (error) {
      console.error("Story submission error:", error);
      throw error;
    }
  }

  /**
   * Get story detail by ID
   * @param {string} storyId - Story ID
   * @returns {Promise<Object>} Story detail
   */
  async getStoryById(storyId) {
    try {
      const token = new Auth().getToken();
      const response = await fetch(`${this._baseUrl}/stories/${storyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch story detail");
      }

      return await response.json();
    } catch (error) {
      console.error("Get story detail error:", error);
      throw error;
    }
  }

  /**
   * Fetch stories with pagination and location filter
   * @param {number} page - Page number
   * @param {number} size - Items per page
   * @param {boolean} includeLocation - Whether to include location data
   * @returns {Promise<{listStory: Array, total: number}>}
   */
  async getStories(page = 1, size = 10, includeLocation = false) {
    try {
      const token = new Auth().getToken();
      if (!token) throw new Error("Authentication required");

      const url = new URL(`${this._baseUrl}/stories`);
      url.searchParams.append("page", page);
      url.searchParams.append("size", size);
      url.searchParams.append("location", includeLocation ? "1" : "0");

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch stories");
      }

      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}
