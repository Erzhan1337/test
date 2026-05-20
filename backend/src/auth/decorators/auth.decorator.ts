import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/auth.guard';

export const Auth = () => UseGuards(JwtAuthGuard);
