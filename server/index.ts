
import express from "express";
import type { Request, Response, NextFunction } from "express";

import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env);

const app = express();
// --- Environment Variable Validation ---
const { PORT = 3000, GOOGLE_CLIENT_ID, JWT_SECRET } = process.env;

if (!GOOGLE_CLIENT_ID || !JWT_SECRET) {
  console.error("FATAL ERROR: Missing required environment variables (GOOGLE_CLIENT_ID, JWT_SECRET).");
  process.exit(1);
}
// --- End Validation ---
// const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:5173' , credentials: true
}));
// const corsOptions: CorsOptions = {
//     origin: "http://localhost:5173",
//     credentials: true,   
//   };
  
// app.use(cors(corsOptions));
app.use(express.json());  
  



const client = new OAuth2Client(GOOGLE_CLIENT_ID);

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  picture: string;
}

// Use declaration merging to extend the Request interface
declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload;
    }
  }
}

// REMOVE unused Request, Response, NextFunction from destructuring
// and use `express` directly
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token or invalid format provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = decoded;
    console.log("Decoded JWT Payload:", decoded);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/auth/google', async (req: express.Request, res: express.Response) => {
  console.log("Incoming body:", req.body);
  const { id_token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log("Decoded payload:", payload);
    if (!payload) throw new Error('Invalid payload');

    const user: JwtPayload = {
      id: payload.sub,
      email: payload.email as string,
      name: payload.name as string,
      picture: payload.picture as string,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    console.log("Generated JWT:", token);
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(400).json({ message: 'Invalid token' });
  }
});

app.get('/auth/profile', verifyToken, (req: express.Request, res: express.Response) => {
    console.log("User from token:", req.user);
  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }
  res.status(200).json({ user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
