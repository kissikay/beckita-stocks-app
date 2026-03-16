import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dzk7jkdqn',
    api_key: process.env.CLOUDINARY_API_KEY || '343557332646761',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'O0aOdUCbn_Z4cmaN5r1_dAt64qI'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'stockpro_profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

export { cloudinary, upload };
