import StoryPresenter from "./story-presenter.js";
import MapLoader from "../../utils/map-loader.js";

export default class StoryPage {
  constructor() {
    this._presenter = new StoryPresenter(this);
    this._isInitialized = false;
  }

  async render() {
    try {
      await MapLoader.load();

      return `
        <section class="container">
          <h1>Share Your Story Now!</h1>
          <div class="form-container">
              <form id="storyForm">
                  <div class="input-group">
                      <label for="photoSource">Photo Source:</label>
                      <select id="photoSource" name="photoSource">
                          <option value="upload">Upload from device</option>
                          <option value="camera">Use camera</option>
                      </select>
                  </div>
                  
                  <div id="uploadSection">
                      <label for="photo">Photo:</label>
                      <input type="file" id="photo" name="photo" accept="image/*">
                  </div>
                  
                  <div id="cameraSection" style="display: none;">
                      <video id="cameraPreview" autoplay playsinline></video>
                      <button type="button" id="captureBtn" class="btn-capture">
                        Capture Photo
                      </button>
                      <canvas id="photoCanvas" style="display: none;"></canvas>
                      <div id="photoPreview" class="photo-preview" style="display: none;"></div>
                  </div>
                  
                  <label for="description">Description:</label>
                  <textarea id="description" name="description" required></textarea>
                  
                  <div class="map-container">
                      <label>Location:</label>
                      <div id="map" style="height: 300px;"></div>
                      <p>Click on the map to select your location</p>
                      <input type="hidden" id="latitude" name="latitude">
                      <input type="hidden" id="longitude" name="longitude">
                  </div>
                  
                  <button type="submit" id="submitBtn" class="btn-submit">Submit & Save to Local</button>
              </form>
              <div id="message" class="message"></div>
          </div>
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
    if (this._isInitialized) return;

    try {
      const retryButton = document.getElementById("retryButton");
      if (retryButton) {
        retryButton.addEventListener("click", () => window.location.reload());
        return;
      }

      await this._presenter.init();

      const form = document.getElementById("storyForm");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        await this._handleFormSubmit();
      });

      const photoSource = document.getElementById("photoSource");
      photoSource.addEventListener("change", async (e) => {
        await this._handlePhotoSourceChange(e.target.value);
      });

      const captureBtn = document.getElementById("captureBtn");
      captureBtn.addEventListener("click", async () => {
        await this._handleCapturePhoto();
      });

      this._isInitialized = true;
    } catch (error) {
      console.error("Initialization error:", error);
      this.showMessage(`Initialization failed: ${error.message}`, "red");
    }
  }

  async _handlePhotoSourceChange(source) {
    try {
      const uploadSection = document.getElementById("uploadSection");
      const cameraSection = document.getElementById("cameraSection");
      const videoElement = document.getElementById("cameraPreview");

      if (source === "camera") {
        uploadSection.style.display = "none";
        cameraSection.style.display = "block";

        const stream = await this._presenter.startCamera();
        videoElement.srcObject = stream;
        videoElement.style.display = "block";
      } else {
        uploadSection.style.display = "block";
        cameraSection.style.display = "none";
        this._presenter.stopCamera();
        videoElement.style.display = "none";
      }
    } catch (error) {
      console.error("Camera source change error:", error);
      this.showMessage(error.message, "red");

      document.getElementById("photoSource").value = "upload";
      document.getElementById("uploadSection").style.display = "block";
      document.getElementById("cameraSection").style.display = "none";
    }
  }

  async _handleCapturePhoto() {
    const captureBtn = document.getElementById("captureBtn");
    const originalText = captureBtn.textContent;

    try {
      captureBtn.disabled = true;
      captureBtn.textContent = "Capturing...";

      const blob = await this._presenter.capturePhoto();

      this._presenter.stopCamera();

      const photoPreview = document.getElementById("photoPreview");
      photoPreview.innerHTML = "";

      const img = document.createElement("img");
      img.src = URL.createObjectURL(blob);
      img.style.maxWidth = "100%";
      photoPreview.appendChild(img);

      document.getElementById("cameraPreview").style.display = "none";
      photoPreview.style.display = "block";

      this.showMessage("Foto berhasil diambil!", "green");
    } catch (error) {
      console.error("Capture failed:", error);
      this.showMessage(`Error: ${error.message}`, "red");
    } finally {
      captureBtn.disabled = false;
      captureBtn.textContent = originalText;
    }
  }

  async _handleFormSubmit() {
    const submitBtn = document.getElementById("submitBtn");
    const originalText = submitBtn.textContent;

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      await this._presenter.handleSubmit();

      this.showMessage("Story submitted successfully!", "green");

      document.getElementById("storyForm").reset();
      this._resetCameraUI();

      if (document.getElementById("photoSource").value === "camera") {
        document.getElementById("photoSource").value = "upload";
        document.getElementById("uploadSection").style.display = "block";
        document.getElementById("cameraSection").style.display = "none";
      }
    } catch (error) {
      console.error("Submission error:", error);
      this.showMessage(`Submission failed: ${error.message}`, "red");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }

  _resetCameraUI() {
    const photoPreview = document.getElementById("photoPreview");
    const cameraPreview = document.getElementById("cameraPreview");

    photoPreview.style.display = "none";
    photoPreview.innerHTML = "";
    cameraPreview.style.display = "block";
  }

  showMessage(text, color) {
    const messageDiv = document.getElementById("message");
    if (!messageDiv) return;

    messageDiv.textContent = text;
    messageDiv.style.color = color;
    messageDiv.className = `message ${color}`;

    if (color === "green") {
      setTimeout(() => {
        messageDiv.textContent = "";
        messageDiv.className = "message";
      }, 5000);
    }
  }
}
