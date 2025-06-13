import StoryApiModel from "../../data/page-model.js";
import { sendReportToAllUserViaNotification } from "../../data/push-model.js";
import { dbPromise } from "../../data/database.js";

export default class StoryPresenter {
  constructor(view, story_id) {
    this._view = view;
    this._storyId = story_id;
    this._apiModel = new StoryApiModel();
    this._map = null;
    this._initCameraState();
  }

  // =====================
  // 1. STATE MANAGEMENT
  // =====================
  _initCameraState() {
    this._camera = {
      stream: null,
      photoBlob: null,
      isCaptured: false,
      isActive: false,
    };
  }

  getCameraState() {
    if (!this._camera) {
      console.warn("Camera state not initialized");
      this._initCameraState();
    }
    return {
      isCaptured: this._camera.isCaptured,
      hasPhoto: !!this._camera.photoBlob,
      isActive: this._camera.isActive,
    };
  }

  // =====================
  // 2. CAMERA OPERATIONS
  // =====================
  async startCamera() {
    try {
      this.stopCamera();

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        },
      };

      this._camera.stream = await navigator.mediaDevices.getUserMedia(
        constraints
      );
      this._camera.isActive = true;
      return this._camera.stream;
    } catch (error) {
      console.error("Camera start error:", error);
      throw new Error(`Camera access denied: ${error.message}`);
    }
  }

  stopCamera() {
    if (this._camera?.stream) {
      this._camera.stream.getTracks().forEach((track) => track.stop());
      this._camera.stream = null;
      this._camera.isActive = false;
    }
  }

  async capturePhoto() {
    try {
      if (!this._camera?.isActive) {
        throw new Error("Camera is not active");
      }

      const video = document.getElementById("cameraPreview");
      const canvas =
        document.getElementById("photoCanvas") ||
        document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create photo blob"));
              return;
            }

            this._camera.photoBlob = blob;
            this._camera.isCaptured = true;
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      });
    } catch (error) {
      console.error("Capture error:", error);
      throw new Error(`Photo capture failed: ${error.message}`);
    }
  }

  resetCamera() {
    this.stopCamera();
    this._camera.photoBlob = null;
    this._camera.isCaptured = false;
  }

  // =================
  // 3. MAP OPERATIONS
  // =================
  _initMap() {
    try {
      this._map = L.map("map").setView([-2.5489, 118.0149], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(this._map);

      const latInput = document.getElementById("latitude");
      const lngInput = document.getElementById("longitude");
      let marker = null;

      this._map.on("click", (e) => {
        const { lat, lng } = e.latlng;

        if (marker) {
          this._map.removeLayer(marker);
        }

        marker = L.marker([lat, lng])
          .addTo(this._map)
          .bindPopup(`Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
          .openPopup();

        latInput.value = lat;
        lngInput.value = lng;
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            this._map.setView([latitude, longitude], 13);

            if (marker) this._map.removeLayer(marker);

            marker = L.marker([latitude, longitude])
              .addTo(this._map)
              .bindPopup("Your location")
              .openPopup();

            latInput.value = latitude;
            lngInput.value = longitude;
          },
          (err) => {
            console.warn("Geolocation error:", err);
          },
          { timeout: 5000 }
        );
      }
    } catch (error) {
      console.error("Map init error:", error);
      throw new Error("Failed to initialize map");
    }
  }

  // ======================
  // 4. STORY SUBMISSION
  // ======================
  async handleSubmit() {
    try {
      const description = document.getElementById("description").value.trim();
      const latitude = document.getElementById("latitude").value;
      const longitude = document.getElementById("longitude").value;
      const photoSource = document.getElementById("photoSource").value;

      if (!description) throw new Error("Description is required");
      if (!latitude || !longitude) throw new Error("Please select a location");

      const formData = new FormData();
      formData.append("description", description);
      formData.append("lat", latitude);
      formData.append("lon", longitude);

      let photoBlob;

      if (photoSource === "camera") {
        if (!this._camera.isCaptured || !this._camera.photoBlob) {
          throw new Error("Please capture a photo first");
        }
        photoBlob = this._camera.photoBlob;
        formData.append(
          "photo",
          new File([photoBlob], "story.jpg", { type: "image/jpeg" })
        );
      } else {
        const fileInput = document.getElementById("photo");
        if (!fileInput.files[0]) {
          throw new Error("Please select a photo");
        }
        photoBlob = fileInput.files[0];
        formData.append("photo", photoBlob);
      }

      const db = await dbPromise;
      const story = {
        id: `story-${Date.now()}`,
        description,
        lat: parseFloat(latitude),
        lon: parseFloat(longitude),
        photoBlob,
        createdAt: new Date().toISOString(),
      };
      await db.add("stories", story);

      if (!navigator.onLine) {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("📷 Cerita berhasil ditambahkan secara offline", {
            body: "Cerita akan dikirim saat koneksi tersedia.",
            icon: "./images/logo.png",
          });
        } else {
          alert(
            "Cerita berhasil disimpan secara offline. Akan dikirim saat online."
          );
        }

        this.resetCamera();
        return;
      }

      const response = await this._apiModel.submitStory(formData);

      this.#notifyToAllUser();
      this.resetCamera();
      return response;
    } catch (error) {
      console.error("Submit error:", error);
      throw error;
    }
  }

  // =====================
  // 5. INITIALIZATION
  // =====================
  async init() {
    try {
      if (typeof L !== "undefined" && !this._map) {
        this._initMap();
      }
    } catch (error) {
      console.error("Presenter init error:", error);
      throw error;
    }
  }

  async #notifyToAllUser() {
    try {
      const response = await sendReportToAllUserViaNotification();
      if (!response.ok) {
        console.error("#notifyToAllUser: response:", response);
        return false;
      }
      return true;
    } catch (error) {
      console.error("#notifyToAllUser: error:", error);
      return false;
    }
  }
}
