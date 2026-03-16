import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
    cloud_name: 'dzk7jkdqn',
    api_key: '343557332646761',
    api_secret: 'O0aOdUCbn_Z4cmaN5r1_dAt64qI'
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
