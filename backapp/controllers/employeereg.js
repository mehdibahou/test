import BadRequestError from "@/errors/bad-request";
import UnauthenticatedError from "@/errors/unauthenticated";
import { NextResponse } from "next/server";
import User from "@/models/user";
import Token from "@/models/Token";
const { StatusCodes } = require("http-status-codes");
import { genSalt, hash } from "bcryptjs";
import createTokenUser from "@/utils/tokenUser";
import { createHash } from "crypto";
import isTokenValid from "@/utils/validateToken";
import Restaurant from "@/models/restaurant";
const crypto = require("crypto");


export const register = async (req) => {
    // 1. Get data from request
    const { 
      name, 
      email, 
      phone, 
      password,
      role
    } = await req.json();

    console.log(name, email, phone, password, role);
  
    // 2. Validate required fields
    if (!email || !name || !password || !phone || !role) {
      return BadRequestError("Please provide all required information");
    }
  
    // 3. Verify owner's token
    const accessToken = req.cookies.get("accessToken")?.value;
    if (!accessToken) {
      throw new UnauthenticatedError("Authentication invalid");
    }
  
    // 4. Validate and get owner's info
    const decodedToken = await isTokenValid(accessToken);
    const owner = await User.findById(decodedToken.userId);
  
    if (!owner || owner.role !== 'owner') {
      throw new UnauthenticatedError("Only owners can register employees");
    }
  
    // 5. Check if email exists
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      return BadRequestError("Email already exists");
    }
  
    // 6. Set permissions based on role
    let permissions = [];
    switch(role) {
      case 'caissier':
        permissions = [
          'access_pos',
          'manage_orders',
          'view_menu'
        ];
        break;
      case 'manager':
        permissions = [
          'access_pos',
          'manage_orders',
          'view_menu',
          'manage_inventory',
          'view_reports'
        ];
        break;
      case 'cuisinier':
        permissions = [
          'view_menu',
          'manage_orders'
        ];
        break;
      default:
        return BadRequestError("Invalid role");
    }
  
    // 7. Create the employee
    const salt = await genSalt(10);
    const user = await User.create({
      name,
      email,
      tel: phone,
      password: await hash(password, salt),
      role,
      permissions,
      status: 'active',
      isFirstLogin: true
    });
  

    console.log('Updating restaurant staff array...');
    const restaurant = await Restaurant.findOneAndUpdate(
        { _id: owner.restaurantId },
        { $push: { staff: user._id } },
        { new: true }
    );
    console.log('Restaurant staff updated:', {
        restaurantId: restaurant?._id,
        staffCount: restaurant?.staff?.length
    });

    if (!restaurant) {
        console.error('Failed to update restaurant staff array');
        // Clean up the created user if restaurant update fails
        await User.findByIdAndDelete(user._id);
        return BadRequestError("Failed to associate employee with restaurant");
    }
  
  
    return new Response(JSON.stringify( { message: "Employee registered successfully" }), 
    {
      status: StatusCodes.OK
    });
  };
  
  // Get employees for a restaurant
  export const getEmployees = async (req) => {
    try {
        console.log('Starting getEmployees process...');
        
        // 1. Get and validate token
        const accessToken = req.cookies.get("accessToken")?.value;
        console.log('Access token present:', !!accessToken);
        
        if (!accessToken) {
            throw new UnauthenticatedError("Authentication invalid");
        }

        // 2. Validate and get user's info
        console.log('Validating token...');
        const decodedToken = await isTokenValid(accessToken);
        console.log('Decoded token:', { userId: decodedToken?.userId });
        
        const user = await User.findById(decodedToken.userId);
        console.log('User found:', {
            found: !!user,
            role: user?.role,
            restaurantId: user?.restaurantId
        });

        if (!user || !['owner', 'manager'].includes(user.role)) {
            console.error('Authorization failed:', {
                userExists: !!user,
                userRole: user?.role
            });
            throw new UnauthenticatedError("Not authorized");
        }

        // 3. Get restaurant with populated staff
        console.log('Fetching restaurant data...');
        const restaurant = await Restaurant.findById(user.restaurantId)
            .populate({
                path: 'staff',
                select: '-password -permissions -__v',
                match: { role: { $ne: 'owner' } }
            });

        if (!restaurant) {
            console.error('Restaurant not found:', user.restaurantId);
            return NextResponse.json(
                { error: "Restaurant not found" },
                { status: StatusCodes.NOT_FOUND }
            );
        }

        console.log('Found employees:', {
            restaurantId: restaurant._id,
            employeeCount: restaurant.staff?.length || 0
        });

        return NextResponse.json({ 
            employees: restaurant.staff || [] 
        }, { 
            status: StatusCodes.OK 
        });

    } catch (error) {
        console.error('GetEmployees error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR }
        );
    }
};
  // Delete employee
  export const deleteEmployee = async (req) => {
    const { id } = await req.json();
  
    // 1. Validate token
    const accessToken = req.cookies.get("accessToken")?.value;
    if (!accessToken) {
      throw new UnauthenticatedError("Authentication invalid");
    }
  
    const decodedToken = await isTokenValid(accessToken);
    const owner = await User.findById(decodedToken.userId);
  
    if (!owner || owner.role !== 'owner') {
      throw new UnauthenticatedError("Only owners can delete employees");
    }
  
    // 2. Delete employee
    const employee = await User.findOneAndDelete({ 
      _id: id,
      restaurantId: owner.restaurantId 
    });
  
    if (!employee) {
      return BadRequestError("Employee not found");
    }
  
    return new Response(JSON.stringify({ message: "Employee deleted successfully" }), {
      status: StatusCodes.OK
    });
  };