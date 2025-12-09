// src/services/cloudinaryService.js
// Al inicio del archivo cloudinaryService.js
import { CLOUDINARY_CONFIG } from '../config/cloudinary';

const CLOUDINARY_CLOUD_NAME = CLOUDINARY_CONFIG.CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = CLOUDINARY_CONFIG.UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const cloudinaryService = {
  /**
   * Sube una imagen a Cloudinary
   * @param {string} imageUri - URI de la imagen desde el dispositivo
   * @param {string} folder - Carpeta donde guardar (ej: 'providers/abc123')
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async uploadImage(imageUri, folder = 'nutriandina') {
    try {
      console.log('📤 Iniciando subida a Cloudinary...');
      console.log('📤 URI:', imageUri);
      console.log('📤 Folder:', folder);

      const formData = new FormData();
      
      // Extraer información del archivo
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      // Agregar la imagen al FormData
      formData.append('file', {
        uri: imageUri,
        type: type,
        name: filename || 'upload.jpg',
      });
      
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', folder);
      formData.append('resource_type', 'image');

      console.log('📤 Enviando a Cloudinary...');

      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      console.log('📤 Respuesta de Cloudinary:', data);

      if (data.secure_url) {
        console.log('✅ Imagen subida exitosamente');
        console.log('✅ URL:', data.secure_url);
        
        return { 
          success: true, 
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
        };
      } else {
        throw new Error(data.error?.message || 'No se obtuvo URL de la imagen');
      }
    } catch (error) {
      console.error('❌ Error subiendo a Cloudinary:', error);
      return { 
        success: false, 
        error: error.message || 'Error al subir imagen' 
      };
    }
  },

  /**
   * Sube múltiples imágenes a Cloudinary
   * @param {string[]} imageUris - Array de URIs de imágenes
   * @param {string} folder - Carpeta donde guardar
   * @returns {Promise<{success: boolean, urls?: string[], error?: string}>}
   */
  async uploadMultipleImages(imageUris, folder = 'nutriandina') {
    try {
      console.log(`📤 Subiendo ${imageUris.length} imágenes...`);

      const uploadPromises = imageUris.map((uri, index) => {
        console.log(`📤 Subiendo imagen ${index + 1}/${imageUris.length}`);
        return this.uploadImage(uri, folder);
      });
      
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(result => result.success);
      const urls = successfulUploads.map(result => result.url);

      if (successfulUploads.length === imageUris.length) {
        console.log(`✅ Todas las imágenes subidas exitosamente`);
        return { success: true, urls };
      } else {
        console.warn(`⚠️ Solo ${successfulUploads.length}/${imageUris.length} imágenes subidas`);
        return { 
          success: true, 
          urls,
          partial: true,
          message: `${successfulUploads.length} de ${imageUris.length} imágenes subidas`
        };
      }
    } catch (error) {
      console.error('❌ Error subiendo múltiples imágenes:', error);
      return { 
        success: false, 
        error: error.message || 'Error al subir imágenes' 
      };
    }
  },

  /**
   * Genera URL optimizada de Cloudinary
   * @param {string} url - URL original de Cloudinary
   * @param {number} width - Ancho deseado
   * @param {string} quality - Calidad (auto, best, good, eco, low)
   * @returns {string} URL optimizada
   */
  getOptimizedUrl(url, width = 800, quality = 'auto') {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }
    
    // Cloudinary permite transformaciones en la URL
    return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
  },

  /**
   * Genera URL de thumbnail
   * @param {string} url - URL original
   * @param {number} size - Tamaño del thumbnail (cuadrado)
   * @returns {string} URL del thumbnail
   */
  getThumbnailUrl(url, size = 200) {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }
    
    return url.replace('/upload/', `/upload/w_${size},h_${size},c_fill,q_auto,f_auto/`);
  },

  /**
   * Genera URL para imagen de producto (optimizada para e-commerce)
   * @param {string} url - URL original
   * @param {string} size - 'small' | 'medium' | 'large'
   * @returns {string} URL optimizada
   */
  getProductImageUrl(url, size = 'medium') {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }

    const sizes = {
      small: 'w_400,h_400',
      medium: 'w_800,h_800',
      large: 'w_1200,h_1200',
    };

    const transformation = sizes[size] || sizes.medium;
    
    return url.replace('/upload/', `/upload/${transformation},c_pad,b_white,q_auto,f_auto/`);
  },
};