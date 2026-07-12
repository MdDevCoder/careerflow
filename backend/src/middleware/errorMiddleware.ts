import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.status || err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    logger.debug(err.stack);
  }

  res.status(statusCode).json({
    message: err.message,
    stack: env.NODE_ENV === 'production' ? null : err.stack,
  });
};
