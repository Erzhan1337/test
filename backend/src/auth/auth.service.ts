import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { verify } from 'argon2';

@Injectable()
export class AuthService {
  EXPIRE_DAY_REFRESH_TOKEN = 1;
  REFRESH_TOKEN_NAME = 'refreshToken';
  constructor(
    private jwt: JwtService,
    private userService: UserService,
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    const tokens = this.issueTokens(user.id);
    return { ...tokens, user };
  }

  async register(dto: AuthDto) {
    const oldUser = await this.userService.getByEmail(dto.email);

    if (oldUser) {
      throw new BadRequestException('User already exists');
    }
    const user = await this.userService.createUser(dto);
    const tokens = this.issueTokens(user.id);
    return { ...tokens, user };
  }

  issueTokens(userId: string) {
    const payload = { id: userId };
    const accessToken = this.jwt.sign(payload, {
      expiresIn: '1h',
    });
    const refreshToken = this.jwt.sign(payload, {
      expiresIn: '1d',
    });
    return { accessToken, refreshToken };
  }

  private async validateUser(dto: AuthDto) {
    const user = await this.userService.getByEmail(dto.email);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await verify(user.password, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getNewTokens(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const user = await this.userService.getById(result.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const tokens = this.issueTokens(user.id);
    return { ...tokens, user };
  }

  addRefreshTokenToResponse(res: Response, refreshToken: string) {
    const expiresIn = new Date();
    expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);
    res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      expires: expiresIn,
      secure: false,
      sameSite: 'lax',
    });
  }

  removeRefreshTokenFromResponse(res: Response) {
    res.cookie(this.REFRESH_TOKEN_NAME, '', {
      httpOnly: true,
      domain: this.configService.get('SERVER_DOMAIN'),
      secure: false,
      sameSite: 'lax',
      expires: new Date(0),
    });
  }
}
