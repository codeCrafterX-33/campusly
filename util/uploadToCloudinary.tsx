import axios from "axios";
import { postOptions } from "../configs/CloudinaryConfig";

// Uploads an image to Cloudinary
const uploadImageToCloudinary = async (uri: string) => {
  const filename = uri.split("/").pop() || `photo.jpg`; // fallback name
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`; // fallback to jpeg

  console.log("Uploading file:", { uri, filename, type });

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: filename,
    type,
  } as any);
  formData.append("upload_preset", postOptions.upload_preset);
  formData.append("folder", postOptions.folder);

  // Use the environment variable instead of hardcoded cloud name
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUD_NAME}/image/upload`;
  console.log("Uploading to Cloudinary URL:", cloudinaryUrl);

  try {
    const response = await axios.post(cloudinaryUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Cloudinary upload success:", response.data);
    return response.data.secure_url;
  } catch (error: any) {
    console.error(
      "Cloudinary upload error:",
      error.response?.data || error.message
    );
    throw new Error("Image upload failed");
  }
};

export default uploadImageToCloudinary;
