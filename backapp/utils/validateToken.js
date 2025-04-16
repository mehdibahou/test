import Token from "@/models/Token";

const isTokenValid = async (accessToken) => {
 console.log('myaaaaoi')
  const token = await Token.findOne({ sessionToken: accessToken });
  if (!token) {
    return null;
  }
  return { userId: token.userId };
};

export default isTokenValid;
