import mongoose from 'mongoose';
import { compare } from "bcryptjs";

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    tel: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['owner', 'manager', 'caissier', 'cuisinier'],
        required: true
    },
    // Reference to the restaurant they belong to
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: false
    },
    // Permissions array for flexible access control
    permissions: [{
        type: String,
        enum: [
            'access_pos',           // Can access the POS system
            'manage_orders',        // Can manage orders
            'view_menu',           // Can view the menu
            'manage_menu',         // Can modify menu items
            'manage_inventory',    // Can manage inventory
            'view_reports',        // Can view reports
            'manage_staff',        // Can manage staff members
            'manage_settings'      // Can modify restaurant settings
        ]
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'pending'
    },
    // For first-time login password change
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    // For password reset functionality
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Track last login
    lastLogin: Date
}, {
    timestamps: true
});

// Method to compare passwords
userSchema.methods.comparePassword = function (password) {
    return compare(password, this.password);
};

// Method to check if user has specific permission
userSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

// Method to set default permissions based on role
userSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('role')) {
        switch (this.role) {
            case 'owner':
                this.permissions = [
                    'access_pos',
                    'manage_orders',
                    'view_menu',
                    'manage_menu',
                    'manage_inventory',
                    'view_reports',
                    'manage_staff',
                    'manage_settings'
                ];
                break;
            case 'manager':
                this.permissions = [
                    'access_pos',
                    'manage_orders',
                    'view_menu',
                    'manage_menu',
                    'manage_inventory',
                    'view_reports'
                ];
                break;
            case 'caissier':
                this.permissions = [
                    'access_pos',
                    'manage_orders',
                    'view_menu'
                ];
                break;
            case 'cuisinier':
                this.permissions = [
                    'view_menu',
                    'manage_orders'
                ];
                break;
        }
    }
    next();
});

// Prevent model overwrite error
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;