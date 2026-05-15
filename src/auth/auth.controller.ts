import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import type { Response } from 'express';
import { JwtAuthGuard } from './jwt.guard';

const isProduction = process.env.NODE_ENV === 'production';

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
      secure: isProduction,
      sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
    };

    res.cookie('access_token', access_token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', refresh_token, {
      ...cookieOptions,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });

    // development'ta token'ı da dön
    if (!isProduction) {
      return { success: true, access_token };
    }

    return { success: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: { userId: string; email: string } }) {
    return req.user;
  }
}
