import { Request } from "express";

export interface IAuthBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ISignInBody {
  email: string;
  password: string;
}

// Signup Request
export interface ISignUpRequest extends Request {
  body: IAuthBody;
}

// Signin Request
export interface ISignInRequest extends Request {
  body: ISignInBody;
}

export interface IRefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}