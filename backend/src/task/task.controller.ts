import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { TaskDto } from './dto/task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('tasks')
@Auth()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getAllTasks(@CurrentUser('id') userId: string) {
    return this.taskService.getAllTasks(userId);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  async createTask(@CurrentUser('id') userId: string, @Body() dto: TaskDto) {
    return this.taskService.createTask(userId, dto);
  }

  @UsePipes(new ValidationPipe())
  @Patch(':id')
  async updateTask(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTaskDto,
    @Param('id') taskId: string,
  ) {
    return this.taskService.updateTask(userId, taskId, dto);
  }

  @Delete(':id')
  async deleteTask(
    @CurrentUser('id') userId: string,
    @Param('id') taskId: string,
  ) {
    return this.taskService.deleteTask(userId, taskId);
  }
}


