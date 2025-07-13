import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your credentials
cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper to extract public_id from secure_url
function extractPublicId(secureUrl) {
          // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image_name.jpg
          const matches = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
          return matches ? matches[1] : null;
}

async function deleteFromCloudinaryByUrl(secureUrl) {
          const publicId = extractPublicId(secureUrl);
          if (!publicId) {
                    throw new Error("Could not extract public_id from secure_url");
          }
          try {
                    const result = await cloudinary.uploader.destroy(publicId);
                    return result;
          } catch (error) {
                    throw new Error(`Failed to delete image: ${error.message}`);
          }
}

export { deleteFromCloudinaryByUrl };
