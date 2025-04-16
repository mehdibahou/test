import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // commercialRegistration: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //     trim: true
    // },
    // taxNumber: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //     trim: true
    // },
    
    // Contact & Location
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    postalCode: {
        type: String,
        required: false,
        trim: true
    },
    phone: {
        type: String,
        required: false,
        trim: true
    },

    // Basic Details
    cuisine: {
        type: String,
        required: true,
        trim: true
    },
    seatingCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    openingHours: {
        type: String,
        required: false,
        trim: true
    },

    // Status
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },

    // Staff Reference
    staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

// Basic indexes
restaurantSchema.index({ name: 1 });
restaurantSchema.index({ owner: 1 });

// Prevent model overwrite error
const Restaurant = mongoose.models.Restaurant || mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;