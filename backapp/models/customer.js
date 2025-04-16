


import mongoose from 'mongoose';

// Define the customer schema
const customerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true // Optional: remove leading/trailing whitespace
    },
    tel: {
        type: String,
        required: true,
        trim: true // Optional: remove leading/trailing whitespace
    },
    location: {
        type: String,
        required: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export the customer model
const Customer =mongoose.models.Customer || mongoose.model('Customer', customerSchema);

export default Customer;
