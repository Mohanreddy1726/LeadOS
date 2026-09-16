import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthUser {
  userId: string;
  role: string;
  memberId: string;
}

export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { error: 'No token, authorization denied', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
    return { user: decoded };
  } catch (err) {
    return { error: 'Token is not valid', status: 401 };
  }
}
