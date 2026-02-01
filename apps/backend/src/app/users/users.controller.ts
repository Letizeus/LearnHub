import { Body, Controller, Get, Post, BadRequestException, ConflictException, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('signup')
  async signup(
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('passwordrep') passwordrep: string,
  ) {
    if (!username || !email || !password || !passwordrep) {
      throw new BadRequestException('Missing required fields');
    }
    if (password !== passwordrep) {
      throw new BadRequestException('Passwords do not match');
    }

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    try {
      const user = await this.usersService.create(username, email, password);
      return { id: user._id, username: user.username, email: user.email };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException('Username or email already exists');
      }
      throw err;
    }
  }

  @Get()
  async getAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Request() req: any) {
    return { id: req.user.userId, email: req.user.email };
  }
}
