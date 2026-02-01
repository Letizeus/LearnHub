import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { User } from '../schema/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      throw new UnauthorizedException('Wrong password');
    }

    const payload = {
      sub: user._id,
      email: user.email,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
    };
  }
}
