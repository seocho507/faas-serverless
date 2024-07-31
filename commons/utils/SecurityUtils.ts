import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {Constants} from "../Constants";
import {EnvironmentVariableError, InvalidTokenError, TokenExpiredError} from "../error/CustomError";

/**
 * Password hashing functions
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};


/**
 * JWT functions
 */

interface JwtPayload {
  pk: string;
  sk: string;
}

export const generateAccessToken = (pk: string, sk: string): string => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new EnvironmentVariableError('JWT secret is not defined');
  }
  const payload: JwtPayload = {pk, sk};
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET,
      {expiresIn: Constants.ACCESS_TOKEN_EXPIRATION});
};

export const generateRefreshToken = (pk: string, sk: string): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new EnvironmentVariableError('JWT refresh secret is not defined');
  }
  const payload: JwtPayload = {pk, sk};
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET,
      {expiresIn: Constants.REFRESH_TOKEN_EXPIRATION});
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    } else {
      throw new InvalidTokenError();
    }
  }
};
export const refreshToken = (refreshToken: string): string => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT refresh secret is not defined');
  }
  try {
    const decoded: JwtPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET) as JwtPayload;
    return generateAccessToken(decoded.pk, decoded.sk);
  } catch (error) {
    throw new InvalidTokenError('Invalid refresh token');
  }
};