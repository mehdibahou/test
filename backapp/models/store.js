import mongoose from 'mongoose';

// Define the store schema
const storeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    website: {
        type: String,
        required: true,
        trim: true // Optional: remove leading/trailing whitespace
    },
    plan: {
        type: String,
        enum: ['basic', 'standard', 'premium'], // Define possible plans
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export the store model
const Store = mongoose.model('Store', storeSchema);

export default Store;
