import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400);
        return next(new Error(`Validation Error: ${(error as any).errors.map((e: any) => e.message).join(', ')}`));
      }
      next(error);
    }
  };
};
