import { Document, Types } from 'mongoose';

// User Methods Interface
export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Main User Interface
export interface IUser extends Document, IUserMethods {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  fcmToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request Interfaces
export interface ISignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

// Response Interfaces
export interface IAuthResponse {
  user: {
    userId: string;
    email: string;
    username: string;
    createdAt: Date;
  };
  token: string;
  expiresIn: string;
}

// JWT Payload — contains only userId per spec
export interface IJwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}
