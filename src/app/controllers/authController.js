import { User } from '@/app/models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';


// Helper function to return a Response object
const jsonResponse = (status, data) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });



  export const checkUsersHandler = async () => {
    try {
      const count = await User.countDocuments();
      return jsonResponse(200, { exists: count > 0 });
    } catch (error) {
      return jsonResponse(500, { message: 'Internal server error.', error: error.message });
    }
  };
// Sign-In Handler
export const signInHandler = async (req,res) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return jsonResponse(400, { message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return jsonResponse(404, { message: 'User not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return jsonResponse(401, { message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
   
   
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
      maxAge: 86400,  // 1 day
      path: '/',
      sameSite: 'Strict',
    });

    return jsonResponse(200, { message: 'Sign-in successful.', token });
  } catch (error) {
    return jsonResponse(500, { message: 'Internal server error.', error: error.message });
  }
};

// Sign-Up Handler
export const signUpHandler = async (req) => {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return jsonResponse(400, { message: 'Email and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return jsonResponse(409, { message: 'User already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ email, password: hashedPassword });

    return jsonResponse(201, { message: 'User created successfully.', user: newUser });
  } catch (error) {
    return jsonResponse(500, { message: 'Internal server error.', error: error.message });
  }
};
