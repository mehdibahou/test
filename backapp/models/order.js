import mongoose from 'mongoose';

// Define the order item schema
const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodProduct', // Reference to the FoodProduct model
        required: true
    },
   
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }

}, { _id: false }); // Disable automatic creation of _id for subdocuments

// Define the order schema
const orderSchema = new mongoose.Schema({
    orderItems: {
        type: [orderItemSchema], // Array of orderItemSchema objects
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['emporte','surplace', 'delivery'], // Define possible types
        required: true,
        default:'surplace',
    },
    status: {
        type: String,
        enum: ['RECEIVED', 'IN_PREPARATION', 'READY_TO_SERVE', 'READY_FOR_PICKUP', 
               'OUT_FOR_DELIVERY', 'SERVED', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'FAILED_DELIVERY'],
        default: 'RECEIVED'
    },
    tableNumber: {
        type: String,
        validate: {
            validator: function(v) {
                return this.type === 'surplace' ? v != null : true;
            },
            message: 'Table number is required for dine-in orders'
        }
    },
    
    location: {
        type: String,
        // Required only if type is 'delivery'
        validate: {
            validator: function(v) {
                // Validate location if the type is 'delivery'
                return this.type === 'delivery' ? v != null && v.length > 0 : true;
            },
            message: 'Location is required for delivery orders'
        }
    },
    off: {
        type: Number,
        default: 0 // Discount or offer percentage
    },
    customer: {
        type: String,
        ref: 'User', // Assuming you have a User model
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant', // Assuming you have a Store model
        required: true
    },
    
    productNames:{
        type: [String],
        required: true
    }

}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Create and export the order model
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
