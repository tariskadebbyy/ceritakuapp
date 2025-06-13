import { openDB } from "idb";

const DB_NAME = "StoryArchiveDB";
const DB_VERSION = 1;
const STORE_NAME = "stories";

export const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  },
});

export async function saveStoryToFavorites(story) {
  const db = await dbPromise;

  let photoBlob = story.photoBlob;

  if (!photoBlob && story.photoUrl) {
    try {
      const response = await fetch(story.photoUrl);
      photoBlob = await response.blob();
    } catch (error) {
      console.error("❌ Gagal fetch gambar:", error);
      throw new Error("Gagal mengambil gambar untuk disimpan offline");
    }
  }

  const storyToSave = {
    id: story.id,
    name: story.name || "Anonymous",
    description: story.description || "",
    location: story.location || null,
    lat: story.lat || null,
    lon: story.lon || null,
    createdAt: story.createdAt || new Date().toISOString(),
    photoBlob,
  };

  await db.put(STORE_NAME, storyToSave);
}

export async function getFavoriteStories() {
  const db = await dbPromise;
  const allStories = await db.getAll(STORE_NAME);

  return allStories
    .filter((story) => story.isFavorite)
    .map((story) => ({
      ...story,
      photoUrl: story.photoBlob
        ? URL.createObjectURL(story.photoBlob)
        : story.photoUrl || "",
    }));
}

export async function deleteStoryFromDB(storyId) {
  const db = await dbPromise;
  await db.delete(STORE_NAME, storyId);
}

export async function getAllStoriesFromDB() {
  const db = await dbPromise;
  const stories = await db.getAll(STORE_NAME);

  return stories.map((story) => ({
    ...story,
    photoUrl: story.photoBlob
      ? URL.createObjectURL(story.photoBlob)
      : story.photoUrl || "",
  }));
}

export async function getStoryById(id) {
  const db = await dbPromise;
  const story = await db.get(STORE_NAME, id);

  if (!story) return null;

  return {
    ...story,
    photoUrl: story.photoBlob
      ? URL.createObjectURL(story.photoBlob)
      : story.photoUrl || "",
  };
}

async function urlToBlob(url) {
  if (!url) throw new Error("Photo URL is missing");

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch image");

  return await response.blob();
}
