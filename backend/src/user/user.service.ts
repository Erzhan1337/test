import { Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { AuthDto } from 'src/auth/dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        tasks: true,
      },
    });
    return user;
  }

  async getByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tasks: true,
      },
    });
    return user;
  }

  async createUser(dto: AuthDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: await hash(dto.password),
      },
    });
  }
}
