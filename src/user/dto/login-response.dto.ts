import { User } from '../user.schema';

export class LoginResponseDto {
  access_token: string;
  user: User;
}
