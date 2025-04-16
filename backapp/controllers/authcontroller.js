import BadRequestError from "@/errors/bad-request";
import UnauthenticatedError from "@/errors/unauthenticated";
import { NextResponse } from "next/server";
import User from "@/models/user";
import Token from "@/models/Token";
const { StatusCodes } = require("http-status-codes");
import { genSalt, hash } from "bcryptjs";
import createTokenUser from "@/utils/tokenUser";
import isTokenValid from "@/utils/validateToken";
import Restaurant from "@/models/restaurant";
const crypto = require("crypto");

export const logout = async (req) => {
  const accessToken = req.cookies.get('accessToken')?.value;
  console.log(accessToken);
  if (!accessToken) {
    return BadRequestError("Please provide token");
  }

  const isValid = await isTokenValid(accessToken);
  if (!isValid) {
    return BadRequestError("Invalid token");
  }

  await Token.deleteOne({ sessionToken: accessToken });

  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: StatusCodes.OK,
    headers: {
      "Set-Cookie": "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure; HttpOnly",
    },
  });
};

export const me = async (req) => {
  const user = await User.findOne({ _id: req.userId });
  console.log(user);
  if (!user) {
    return BadRequestError("User not found");
  }
  return new Response(JSON.stringify({ user }), {
    status: StatusCodes.OK,
  });
};



export const register = async (req) => {
  // Get user and restaurant data from request
  const { 
    // User Info
    name, 
    email, 
    phone, 
    password,
    // Restaurant Info
    restaurantName,
    address,
    city,
    cuisine
  } = await req.json();

  // Validate required user fields
  if (!email || !name || !password || !phone) {
    return BadRequestError("Please provide all required user information");
  }

  // Validate required restaurant fields
  if (!restaurantName  || !address || !city) {
    return BadRequestError("Please provide all required restaurant information");
  }

  // Check if email already exists
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    if (emailAlreadyExists.isVerified) {
      return BadRequestError("Email already exists, please log in");
    } else {
      await User.deleteOne({ email });
    }
  }

 

  // Create user with reference to restaurant
  const salt = await genSalt(10);
  const user = await User.create({
    name,
    email,
     tel: phone, // Changed from tel to phone to match our form
    password: await hash(password, salt),
    role: 'owner', // Default role for registration
    permissions: [
      'access_pos',
      'manage_orders',
      'view_menu',
      'manage_menu',
      'manage_inventory',
      'view_reports',
      'manage_staff',
      'manage_settings'
    ],
    status: 'active'
  });


  const restaurant = await Restaurant.create({
    name: restaurantName,
    owner: user._id,
    address,
    city,
    cuisine,
    status: 'active',
    seatingCapacity: 10, // Default value, can be updated later
    openingHours: '', // Default value, can be updated later
  });

  // Update the restaurant ID in the user document
  user.restaurantId = restaurant._id;
  await user.save();
 

  // Generate session token
  const sessionToken = crypto.randomBytes(40).toString("hex");
  const token = {
    sessionToken,
    userId: user._id,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiration
  };
  await Token.create(token);

  return new Response(JSON.stringify({ user, restaurant }), {
    status: StatusCodes.CREATED,
    headers: { 
      "Set-Cookie": `accessToken=${token.sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800` 
    },
  });
};

export const login = async (req, ctx) => {
  const { email, password } = await req.json();

  if (!email) {
    return BadRequestError("Please provide an email");
  }
  
  if (!password) {
    return BadRequestError("Please provide a password");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  // console.log(user);
  const isPasswordMatch = await user.comparePassword(password);
  // console.log(isPasswordMatch);
  if (!isPasswordMatch) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  // At this point, user is authenticated, proceed with token generation
  let token = await Token.findOne({ userId: user._id });
  if (!token) {
    const sessionToken = crypto.randomBytes(40).toString("hex");
    token = {
      sessionToken,
      userId: user._id,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    await Token.create(token);
  }

  const tokenUser = createTokenUser(user);

  return new Response(JSON.stringify({ token: tokenUser }), {
    status: StatusCodes.OK,
    headers: {
      "Set-Cookie": `accessToken=${token.sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`,
    },
  });
};

// export const fetchRole = async (req) => {
    
//   if (!userId) {
//     return null;
//   }
//   const user = await User.findOne({
//     _id: userId,
//   });
//   return new Response(JSON.stringify({ role: user.role }), {
//     status: StatusCodes.OK,
//   });
// };





// export const logout = async () => {
//   return new Response(JSON.stringify({ message: "logged out" }), {
//     status: StatusCodes.OK,
//     headers: {
//       "Set-Cookie":
//         "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict; Secure; HttpOnly",
//     },
//   });
// };

// export const forgotPassword = async (req) => {
//   const { email } = await req.json();

//   if (!email) {
//     return BadRequestError("Please provide valid email");
//   }
//   const user = await User.findOne({ email });
//   if (user && user.isVerified) {
//     const passwordToken = crypto.randomBytes(70).toString("hex");
//     const tenMinutes = 1000 * 60 * 10;
//     user.passwordToken = createHash(passwordToken);
//     user.passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
//     await user.save();

//     // Send the password reset email here
//   } else {
//     return BadRequestError("An error has occurred");
//   }

//   return new Response(JSON.stringify({ msg: "Please check your email for reset password link" }), {
//     status: StatusCodes.OK,
//   });
// };

// export const resetPassword = async (req) => {
//   const { token, email, password, cpassword } = await req.json();

//   if (password !== cpassword) {
//     return BadRequestError("Password and confirm password must be the same");
//   }

//   if (!token || !email || !password) {
//     return BadRequestError("Please provide all values");
//   }

//   const user = await User.findOne({ email });

//   if (user) {
//     const currentDate = new Date();

//     if (user.passwordToken === createHash(token) && user.passwordTokenExpirationDate > currentDate) {
//       user.password = await hash(password, await genSalt(10));
//       user.passwordToken = null;
//       user.passwordTokenExpirationDate = null;
//       await user.save();

//       return new Response(JSON.stringify({ msg: "Password changed successfully" }), {
//         status: StatusCodes.OK,
//       });
//     }
//   }

//   return BadRequestError("Invalid token");
// };

// export const verifyAdmin = async (req) => {
//   const accessToken = req.nextUrl.searchParams.get("accessToken");
//   if (!accessToken) {
//     return BadRequestError("Please provide token");
//   }

//   const isValid = await isTokenValid(accessToken);
//   if (!isValid) {
//     return BadRequestError("Invalid token");
//   }

//   const user = await User.findOne({ _id: isValid.userId });
//   if (!user || user.role !== "admin") {
//     return BadRequestError("Invalid token");
//   }

//   return new Response(JSON.stringify({ message: "Logged in" }), {
//     status: StatusCodes.OK,
//   });
// };

// export const verifyFormateur = async (req) => {
//   const accessToken = req.nextUrl.searchParams.get("accessToken");
//   if (!accessToken) {
//     return BadRequestError("Please provide token");
//   }

//   const isValid = await isTokenValid(accessToken);
//   if (!isValid) {
//     return BadRequestError("Invalid token");
//   }

//   const user = await User.findOne({ _id: isValid.userId });
//   if (!user || user.role !== "Formateur") {
//     return BadRequestError("Invalid token");
//   }

//   return new Response(JSON.stringify({ message: "Logged in" }), {
//     status: StatusCodes.OK,
//   });
// };

// export const verifyFournisseur = async (req) => {
//   const accessToken = req.nextUrl.searchParams.get("accessToken");
//   if (!accessToken) {
//     return BadRequestError("Please provide token");
//   }

//   const isValid = await isTokenValid(accessToken);
//   if (!isValid) {
//     return BadRequestError("Invalid token");
//   }

//   const user = await User.findOne({ _id: isValid.userId });
//   if (!user || user.role !== "Fournisseur") {
//     return BadRequestError("Invalid token");
//   }

//   return new Response(JSON.stringify({ message: "Logged in" }), {
//     status: StatusCodes.OK,
//   });
// };

export const verifyToken = async (req) => {
  const accessToken = req.nextUrl.searchParams.get("accessToken");
  if (!accessToken) {
    return BadRequestError("Please provide token");
  }

  const isValid = await isTokenValid(accessToken);
  if (!isValid) {
    return BadRequestError("Invalid token");
  }

  return new Response(JSON.stringify({ message: "Logged in" }), {
    status: StatusCodes.OK,
  });
};
