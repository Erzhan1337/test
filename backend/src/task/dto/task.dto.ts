import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { TaskStatus } from './task-status.enum';

export class TaskDto {
  @IsNotEmpty({
    message: 'Title is required',
  })
  title: string;
  @IsOptional()
  description: string;
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
