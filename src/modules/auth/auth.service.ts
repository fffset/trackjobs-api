import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { EmailAlreadyExistsException } from './error/email-already-exists.exception';
import { InvalidCredentialsException } from './error/invalid-credentials.exception';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  private generateTokens(
    userId: string,
    email: string,
    rememberMe: boolean = false,
  ) {
    const access_token = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.JWT_SECRET || 'trackjobs_secret',
        expiresIn: '15m',
      },
    );
    const refresh_token = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
        expiresIn: rememberMe ? '30d' : '1d',
      },
    );
    return { access_token, refresh_token, rememberMe };
  }

  async register(body: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(body.email);
    if (existingUser) {
      throw new EmailAlreadyExistsException()
    }
    const user = await this.usersService.create(body.email, body.password);
    return this.generateTokens(user.id, user.email);
  }

  async login(data: LoginDto) {
    const user = await this.usersService.findByEmail(data.email);
    if (!user) {
      throw new InvalidCredentialsException()
    }
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsException()
    }
    return this.generateTokens(user.id, user.email, data.rememberMe);
  }

  refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      });

      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
