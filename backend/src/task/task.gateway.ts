import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { TODO_STATUS } from '@prisma/client';

export interface TaskEvent {
  id: string;
  status: TODO_STATUS;
  timestamp: string;
}

export interface TaskFullEvent {
  id: string;
  title: string;
  description: string | null;
  status: TODO_STATUS;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TaskGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        this.logger.warn(`Client ${client.id} rejected: no token provided`);
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync<{ id: string }>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      client.data.userId = payload.id;
      await client.join(`user:${payload.id}`);

      this.logger.log(
        `Client connected: ${client.id} (user: ${payload.id})`,
      );
    } catch (error) {
      this.logger.warn(
        `Client ${client.id} rejected: invalid token — ${error.message}`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitTaskStatusUpdate(userId: string, taskId: string, newStatus: TODO_STATUS) {
    const event: TaskEvent = {
      id: taskId,
      status: newStatus,
      timestamp: new Date().toISOString(),
    };

    this.server.to(`user:${userId}`).emit('task:status-updated', event);
  }

  emitTaskCreated(userId: string, task: TaskFullEvent) {
    this.server.to(`user:${userId}`).emit('task:created', task);
  }

  emitTaskDeleted(userId: string, taskId: string) {
    this.server.to(`user:${userId}`).emit('task:deleted', {
      id: taskId,
      timestamp: new Date().toISOString(),
    });
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const tokenFromQuery = client.handshake.query?.token;
    if (typeof tokenFromQuery === 'string' && tokenFromQuery) {
      return tokenFromQuery;
    }

    const authHeader = client.handshake.headers?.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }

    return null;
  }
}
