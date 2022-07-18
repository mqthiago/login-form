import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default async (request:Request, response:Response, next:NextFunction) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return response.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {userId:number};
    request.userId = decoded.userId;

    return next();
  } catch (err) {
    return response.status(401).json({ error: 'Invalid Token' });
  }
};
