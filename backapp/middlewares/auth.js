import isTokenValid from "@/utils/validateToken";
// import {fetchRole} from "@/controllers/authcontroller";
import { getCookies } from "cookies-next";
import { NextResponse } from "next/server";



const set = new Set();


export async function authenticateUser(req,res,next) {
  try {
    // Get the token from the Authorization header
    const token = req.headers.get("cookie")?.split("=")[1];
    console.log(req.headers.get("cookie"));
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token
    const payload = await isTokenValid(token);
    console.log(payload.userId,'payload');
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Add the user ID to the request object
    req.userId = payload.userId;
    return await next();

  }
  catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

}



// const authorizePermissions = (...roles) => {
//   return async (req, res, next) => {
//     const role = await fetchRole(req.user.userId);

//     if (!roles[0].includes(role.role)) {
//       return NextResponse.json( { message: "Unauthorized" }, { status: 401 });
//     }
//     req.user = { ...req.user, role: role.role };
//     return next();
//   };
// };



// const getDAU = async (req, res, next) => {
//   try {
//     await addDAU(set.size);
//     set.clear();
//     return next();
//   } catch {
//     return NextResponse.json( { message: "Unauthorized" }, { status: 401 });
//   }
// };
// module.exports = {
//   authenticateUser,
//   authorizePermissions,
// };
// export { authenticateUser, authorizePermissions };
