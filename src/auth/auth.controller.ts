import { Body, Controller, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string; rememberMe?: boolean },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token, refresh_token, rememberMe } =
      await this.authService.login(body.email, body.password, body.rememberMe);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    res.cookie('access_token', access_token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 dakika
    });

    res.cookie('refresh_token', refresh_token, {
      ...cookieOptions,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined, // 30 gün veya session
    });

    return { success: true };
  }
}
