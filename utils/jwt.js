import jwt from "jsonwebtoken";
export const RefreshToken = async (uid,role,time) => {
   const token = jwt.sign(uid,process.env.R_SECRET_KEY,{expires:"7d"});
   
}