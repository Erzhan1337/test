import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

const mockUserService = {
  getByEmail: jest.fn(),
  getById: jest.fn(),
  createUser: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
  verifyAsync: jest.fn(),
};

const mockPrisma = {};

const mockConfigService = {
  get: jest.fn().mockReturnValue('localhost'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      const createdUser = { id: 'user-1', email: dto.email };

      mockUserService.getByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(createdUser);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.register(dto);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: createdUser,
      });
      expect(mockUserService.getByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockUserService.createUser).toHaveBeenCalledWith(dto);
    });

    it('should throw BadRequestException if user already exists', async () => {
      const dto = { email: 'existing@test.com', password: 'password123' };
      mockUserService.getByEmail.mockResolvedValue({ id: 'user-1', email: dto.email });

      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login and return tokens with user (without password)', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      const hashedPassword = await argon2.hash(dto.password);
      const userFromDb = {
        id: 'user-1',
        email: dto.email,
        password: hashedPassword,
      };

      mockUserService.getByEmail.mockResolvedValue(userFromDb);
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = await service.login(dto);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.user).not.toHaveProperty('password');
      expect(result.user.id).toBe('user-1');
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const dto = { email: 'noone@test.com', password: 'password123' };
      mockUserService.getByEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const dto = { email: 'test@test.com', password: 'wrong' };
      const hashedPassword = await argon2.hash('correct-password');
      mockUserService.getByEmail.mockResolvedValue({
        id: 'user-1',
        email: dto.email,
        password: hashedPassword,
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('issueTokens', () => {
    it('should return access and refresh tokens', () => {
      mockJwtService.sign
        .mockReturnValueOnce('access-token')
        .mockReturnValueOnce('refresh-token');

      const result = service.issueTokens('user-1');

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
      expect(mockJwtService.sign).toHaveBeenCalledTimes(2);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: 'user-1' },
        { expiresIn: '1h' },
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: 'user-1' },
        { expiresIn: '1d' },
      );
    });
  });

  describe('getNewTokens', () => {
    it('should return new tokens for a valid refresh token', async () => {
      const user = { id: 'user-1', email: 'test@test.com' };
      mockJwtService.verifyAsync.mockResolvedValue({ id: 'user-1' });
      mockUserService.getById.mockResolvedValue(user);
      mockJwtService.sign
        .mockReturnValueOnce('new-access')
        .mockReturnValueOnce('new-refresh');

      const result = await service.getNewTokens('valid-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
        user,
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.getNewTokens('bad-token')).rejects.toThrow();
    });

    it('should throw UnauthorizedException if user no longer exists', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ id: 'deleted-user' });
      mockUserService.getById.mockResolvedValue(null);

      await expect(service.getNewTokens('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
