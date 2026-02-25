import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config/jwt.config";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== "string") {
      return res.status(401).json({ message: "No token provided" });
    }

    const tokenParts = authHeader.split(" ");

    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const token = tokenParts[1];
    const decoded = jwt.verify(token, jwtConfig.accessSecret);

    // Add userId to the request
    (req as any).user = decoded; // remove any

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
