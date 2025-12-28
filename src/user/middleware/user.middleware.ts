import { AuthRequest } from '@/types/expressRouter.interface';
import { UserService } from '@/user/user.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { verify, JwtPayload } from 'jsonwebtoken';
import { NextFunction } from 'express';
import { UserEntity } from '@/user/user.entity';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] as string | undefined;

    if (!authHeader) {
      req.user = new UserEntity();
      next();
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      req.user = new UserEntity();
      next();
      return;
    }

    try {
      const decodedToken = verify(token, process.env.JWT_SECRET || '');
      const user = await this.userService.findUserById(decodedToken.id);
      req.user = user;
      next();
    } catch {
      req.user = new UserEntity();
      next();
    }
  }
}
