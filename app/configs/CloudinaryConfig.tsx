import { Cloudinary } from "@cloudinary/url-gen";

// Debug: Log environment variables
console.log("CloudinaryConfig environment variables:", {
  EXPO_PUBLIC_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUD_NAME
    ? "***set***"
    : "undefined",
  EXPO_PUBLIC_CLOUD_API_KEY: process.env.EXPO_PUBLIC_CLOUD_API_KEY
    ? "***set***"
    : "undefined",
  EXPO_PUBLIC_CLOUD_API_SECRET: process.env.EXPO_PUBLIC_CLOUD_API_SECRET
    ? "***set***"
    : "undefined",
});

export const cld = new Cloudinary({
  cloud: {
    cloudName: process.env.EXPO_PUBLIC_CLOUD_NAME,
    apiKey: process.env.EXPO_PUBLIC_CLOUD_API_KEY,
    apiSecret: process.env.EXPO_PUBLIC_CLOUD_API_SECRET,
  },
  url: {
    secure: true,
  },
});

export const options = {
  upload_preset: "my-school-event",
  tags: ["school-event"],
  unsigned: true,
  folder: "profile-images",
};

export const postOptions = {
  upload_preset: "my-school-event",
  tags: ["school-event"],
  unsigned: true,
  folder: "posts",
};

export const clubOptions = {
  upload_preset: "my-school-event",
  tags: ["school-event"],
  unsigned: true,
  folder: "clubs",
};

export const eventOptions = {
  upload_preset: "my-school-event",
  tags: ["school-event"],
  unsigned: true,
  folder: "events",
};
