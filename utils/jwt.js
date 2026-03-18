import jwt from "jsonwebtoken";
export const RefreshToken = async (uid, role, time = "7d") => {
   const token = jwt.sign({ uid, role }, process.env.R_SECRET_KEY, { expiresIn: time });
   return token;
}