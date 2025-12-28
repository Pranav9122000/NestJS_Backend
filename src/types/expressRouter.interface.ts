import { UserEntity } from '@/user/user.entity';

export interface AuthRequest extends Request {
  user: UserEntity;
}
