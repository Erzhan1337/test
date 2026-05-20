import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskDto } from './dto/task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskGateway } from './task.gateway';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private taskGateway: TaskGateway,
  ) {}

  async getAllTasks(userId: string) {
    return this.prisma.todo.findMany({
      where: {
        userId,
      },
    });
  }

  async createTask(userId: string, dto: TaskDto) {
    const task = await this.prisma.todo.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
      },
    });

    this.taskGateway.emitTaskCreated(userId, task);
    return task;
  }

  async deleteTask(userId: string, taskId: string) {
    const result = await this.prisma.todo.deleteMany({
      where: {
        id: taskId,
        userId,
      },
    });

    if (result.count > 0) {
      this.taskGateway.emitTaskDeleted(userId, taskId);
    }
    return result;
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.todo.findFirst({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found or access denied');
    }

    const updatedTask = await this.prisma.todo.update({
      where: {
        id: taskId,
      },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
      },
    });

    if (dto.status && dto.status !== task.status) {
      this.taskGateway.emitTaskStatusUpdate(userId, taskId, dto.status);
    }

    return updatedTask;
  }
}
