import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskDto } from './dto/task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async getAllTasks(userId: string) {
    return this.prisma.todo.findMany({
      where: {
        userId,
      },
    });
  }

  async createTask(userId: string, dto: TaskDto) {
    return this.prisma.todo.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        status: dto.status,
      },
    });
  }

  async deleteTask(userId: string, taskId: string) {
    return this.prisma.todo.deleteMany({
      where: {
        id: taskId,
        userId,
      },
    });
  }
  async updateTask(userId: string, taskId: string, dto: Partial<TaskDto>) {
     const task = await this.prisma.todo.findFirst({
       where: {
         id: taskId,
         userId: userId,
       },
     });
 
     if (!task) {
       throw new NotFoundException('Task not found or access denied');
     }
 
     return this.prisma.todo.update({
       where: {
         id: taskId,
       },
       data: {
         title: dto.title,
         description: dto.description,
         status: dto.status,
       },
     });
   }
}
