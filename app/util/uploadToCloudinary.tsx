import * as ImageManipulator from "expo-image-manipulator";
import * as VideoThumbnails from "expo-video-thumbnails";

// Get file size for logging
const getFileSize = async (fileUri: string): Promise<string> => {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
    return `${sizeInMB}MB`;
  } catch (error) {
    return "Unknown size";
  }
};

// Generate video thumbnail for faster preview
const generateVideoThumbnail = async (
  fileUri: string
): Promise<string | null> => {
  try {
    console.log("Generating video thumbnail...");
    const { uri } = await VideoThumbnails.getThumbnailAsync(fileUri, {
      time: 1000, // 1 second into the video
      quality: 0.7,
    });
    console.log("Video thumbnail generated successfully");
    return uri;
  } catch (error) {
    console.error("Video thumbnail generation failed:", error);
    return null;
  }
};

// Process video for upload (generate thumbnail, no client-side compression)
const compressVideo = async (
  fileUri: string
): Promise<{ videoUri: string; thumbnailUri?: string }> => {
  try {
    console.log("Starting video processing...");
    const fileSize = await getFileSize(fileUri);
    console.log(`Original video size: ${fileSize}`);

    // Generate thumbnail for faster preview
    const thumbnailUri = await generateVideoThumbnail(fileUri);

    // Note: Client-side video compression is complex and not easily achievable with current Expo setup
    // We rely on Cloudinary's server-side compression for videos
    console.log("Video processing completed (using server-side compression)");
    return { videoUri: fileUri, thumbnailUri };
  } catch (error) {
    console.error("Video processing failed:", error);
    return { videoUri: fileUri }; // Return original if processing fails
  }
};

// Upload video with thumbnail for better performance
const uploadVideoWithThumbnail = async (fileUri: string) => {
  try {
    console.log("Starting video with thumbnail upload...");
    const fileSize = await getFileSize(fileUri);
    console.log(`Original video size: ${fileSize}`);

    // Generate thumbnail first
    const thumbnailUri = await generateVideoThumbnail(fileUri);

    // Upload thumbnail first (smaller, faster) - compress it
    let thumbnailUrl = null;
    if (thumbnailUri) {
      console.log("Uploading video thumbnail...");
      thumbnailUrl = await uploadToCloudinary(thumbnailUri, "image");
      console.log("Video thumbnail uploaded successfully");
    }

    // Upload video (larger, slower) - this will apply compression
    console.log("Uploading video file...");
    const videoUrl = await uploadToCloudinary(fileUri, "video");

    return {
      videoUrl,
      thumbnailUrl,
      success: true,
    };
  } catch (error) {
    console.error("Video with thumbnail upload failed:", error);
    throw error;
  }
};

// Upload a single file to Cloudinary
const uploadToCloudinary = async (
  fileUri: string,
  type: "image" | "video" = "image"
) => {
  try {
    console.log(`Starting upload: ${type} to folder: posts`);

    // Resize & compress only images
    let uri = fileUri;
    if (type === "image") {
      console.log("Compressing image...");
      const manipResult = await ImageManipulator.manipulateAsync(
        fileUri,
        [{ resize: { width: 1080 } }], // resize to max width
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG } // More aggressive compression
      );
      uri = manipResult.uri;
      console.log("Image compressed successfully");
    } else if (type === "video") {
      console.log("Processing video...");
      const fileSize = await getFileSize(fileUri);
      console.log(`Video file size: ${fileSize}`);
      const { videoUri, thumbnailUri } = await compressVideo(fileUri);
      uri = videoUri;

      // If we have a thumbnail, we could upload it separately for faster preview
      if (thumbnailUri) {
        console.log("Video thumbnail available for faster preview");
      }
    }

    const formData = new FormData();
    formData.append("file", {
      uri,
      type: type === "image" ? "image/jpeg" : "video/mp4",
      name: `upload.${type === "image" ? "jpg" : "mp4"}`,
    } as any);
    formData.append(
      "upload_preset",
      process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "my-school-event"
    );
    formData.append("folder", "posts");

    // Add video compression parameters for Cloudinary
    if (type === "video") {
      formData.append("resource_type", "video");
      formData.append("chunk_size", "5000000"); // 5MB chunks for better upload
      formData.append("quality", "auto:low"); // More aggressive quality optimization
      formData.append("fetch_format", "auto"); // Auto format optimization
      // Note: transformation parameter not allowed with unsigned uploads
      // Video compression will be handled by Cloudinary's auto-optimization
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.EXPO_PUBLIC_CLOUD_NAME}/${type}/upload`;
    console.log(`Uploading to: ${cloudinaryUrl}`);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => {
        controller.abort();
      },
      type === "video" ? 300000 : 60000
    ); // 5 minutes for video, 1 minute for image

    const res = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Upload failed with status:", res.status, errorText);
      throw new Error(`Upload failed: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    console.log("Upload successful:", data.secure_url);

    return data.secure_url; // Cloudinary URL
  } catch (err) {
    if (err.name === "AbortError") {
      console.error(
        "Upload timeout:",
        type === "video"
          ? "Video upload timed out after 5 minutes"
          : "Image upload timed out after 1 minute"
      );
      throw new Error(`Upload timeout: ${type} upload took too long`);
    }
    console.error("Upload failed:", err);
    throw err;
  }
};

// Upload multiple files in parallel with progress tracking
export const uploadMultipleMedia = async (
  files: Array<{ uri: string; type: "image" | "video" }>
) => {
  console.log(`Starting parallel upload of ${files.length} files`);

  try {
    // Separate videos and images for different handling
    const videoFiles = files.filter((file) => file.type === "video");
    const imageFiles = files.filter((file) => file.type === "image");

    console.log(
      `Uploading ${imageFiles.length} images and ${videoFiles.length} videos`
    );

    const uploadPromises = files.map(async (file, index) => {
      console.log(`Uploading file ${index + 1}/${files.length}: ${file.type}`);

      // Add extra logging for videos
      if (file.type === "video") {
        console.log(
          `Video upload started - this may take several minutes for large files`
        );
      }

      try {
        let result;
        if (file.type === "video") {
          // Use special video upload with thumbnail
          result = await uploadVideoWithThumbnail(file.uri);
          console.log(
            `Video ${index + 1} uploaded successfully with thumbnail`
          );
          return {
            success: true,
            url: result.videoUrl,
            thumbnailUrl: result.thumbnailUrl,
            type: file.type,
            index,
          };
        } else {
          // Regular image upload with compression
          const url = await uploadToCloudinary(file.uri, file.type);
          console.log(`File ${index + 1} uploaded successfully`);
          return { success: true, url, type: file.type, index };
        }
      } catch (error) {
        console.error(`File ${index + 1} upload failed:`, error);
        return { success: false, error, type: file.type, index };
      }
    });

    const results = await Promise.all(uploadPromises);

    // Separate successful and failed uploads
    const successful = results.filter((result) => result.success);
    const failed = results.filter((result) => !result.success);

    if (failed.length > 0) {
      console.warn(`${failed.length} files failed to upload:`, failed);
    }

    console.log(
      `${successful.length}/${files.length} files uploaded successfully`
    );

    // Return successful uploads with thumbnails in the same order as input
    const uploadResults = results
      .filter((result) => result.success)
      .sort((a, b) => a.index - b.index)
      .map((result) => ({
        url: result.url,
        thumbnailUrl: result.thumbnailUrl || null,
        type: files[result.index].type,
      }));

    return uploadResults;
  } catch (err) {
    console.error("Multiple upload failed:", err);
    return [];
  }
};

// Legacy function for backward compatibility
const uploadImageToCloudinary = async (
  uri: string,
  folder: string,
  preset: string,
  type: "image" | "video"
) => {
  return uploadToCloudinary(uri, type);
};

export default uploadImageToCloudinary;
export { uploadToCloudinary, uploadMultipleMedia };
