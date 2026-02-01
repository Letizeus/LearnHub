import { Body, Controller, Get, Post, BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

    @Post('login')
    async login(@Body() body: { email: string; password: string }) {
      return this.authService.login(body.email, body.password);
    }
}