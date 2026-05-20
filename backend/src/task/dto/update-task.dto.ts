import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from './task-status.enum';

export class UpdateTaskDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
