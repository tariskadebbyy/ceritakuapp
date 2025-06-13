class MapLoader {
  static async load() {
    if (typeof L !== "undefined") return true;

    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.7.1/dist/leaflet.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject(new Error("Gagal memuat Leaflet"));
      document.body.appendChild(script);
    });
  }
}

export default MapLoader;
