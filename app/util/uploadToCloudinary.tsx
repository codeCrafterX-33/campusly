import axios from "axios";

const uploadImageToCloudinary = async (
  uri: string,
  folder: string,
  preset: string,
  type: "image" | "video"
) => {
  const filename = uri.split("/").pop() || `photo.jpg`; // fallback name
  const match = /\.(\w+)$/.exec(filename);
  const mediaType = match ? `image/${match[1]}` : `image/jpeg`; // fallback to jpeg

  console.log("Uploading file:", { uri, filename, type });

  const formData = new FormData();
  formData.append("file", {
    uri,
    name: filename,
    type: mediaType,
  } as any);
  formData.append("upload_preset", preset);
  formData.append("folder", folder);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUD_NAME}/${type}/upload`;
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
    throw new Error("Media upload failed");
  }
};

export default uploadImageToCloudinary;
