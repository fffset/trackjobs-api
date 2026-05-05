import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

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

  async register(email: string, password: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }
    const user = await this.usersService.create(email, password);
    return this.generateTokens(user.id, user.email);
  }

  async login(email: string, password: string, rememberMe: boolean = false) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user.id, user.email, rememberMe);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret',
      });

      return this.generateTokens(payload.sub, payload.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
