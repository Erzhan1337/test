import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TaskGateway } from './task.gateway';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  todo: {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

const mockGateway = {
  emitTaskCreated: jest.fn(),
  emitTaskDeleted: jest.fn(),
  emitTaskStatusUpdate: jest.fn(),
};

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: TaskGateway, useValue: mockGateway },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    it('should return all tasks for a user', async () => {
      const userId = 'user-1';
      const tasks = [
        { id: 'task-1', title: 'Test', status: 'TODO', userId },
        { id: 'task-2', title: 'Test 2', status: 'DONE', userId },
      ];
      mockPrisma.todo.findMany.mockResolvedValue(tasks);

      const result = await service.getAllTasks(userId);

      expect(result).toEqual(tasks);
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it('should return empty array when user has no tasks', async () => {
      mockPrisma.todo.findMany.mockResolvedValue([]);

      const result = await service.getAllTasks('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('createTask', () => {
    it('should create a task and emit websocket event', async () => {
      const userId = 'user-1';
      const dto = { title: 'New Task', description: 'Desc', status: 'TODO' as any };
      const createdTask = { id: 'task-1', ...dto, userId, createdAt: new Date(), updatedAt: new Date() };
      mockPrisma.todo.create.mockResolvedValue(createdTask);

      const result = await service.createTask(userId, dto);

      expect(result).toEqual(createdTask);
      expect(mockPrisma.todo.create).toHaveBeenCalledWith({
        data: {
          userId,
          title: dto.title,
          description: dto.description,
          status: dto.status,
        },
      });
      expect(mockGateway.emitTaskCreated).toHaveBeenCalledWith(userId, createdTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task and emit websocket event', async () => {
      const userId = 'user-1';
      const taskId = 'task-1';
      mockPrisma.todo.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.deleteTask(userId, taskId);

      expect(result).toEqual({ count: 1 });
      expect(mockPrisma.todo.deleteMany).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
      expect(mockGateway.emitTaskDeleted).toHaveBeenCalledWith(userId, taskId);
    });

    it('should not emit event when task not found', async () => {
      mockPrisma.todo.deleteMany.mockResolvedValue({ count: 0 });

      await service.deleteTask('user-1', 'nonexistent');

      expect(mockGateway.emitTaskDeleted).not.toHaveBeenCalled();
    });
  });

  describe('updateTask', () => {
    const userId = 'user-1';
    const taskId = 'task-1';
    const existingTask = {
      id: taskId,
      title: 'Old Title',
      description: 'Old Desc',
      status: 'TODO',
      userId,
    };

    it('should update a task successfully', async () => {
      const dto = { title: 'Updated Title' };
      const updatedTask = { ...existingTask, ...dto };
      mockPrisma.todo.findFirst.mockResolvedValue(existingTask);
      mockPrisma.todo.update.mockResolvedValue(updatedTask);

      const result = await service.updateTask(userId, taskId, dto);

      expect(result).toEqual(updatedTask);
      expect(mockPrisma.todo.findFirst).toHaveBeenCalledWith({
        where: { id: taskId, userId },
      });
    });

    it('should emit websocket event when status changes', async () => {
      const dto = { status: 'IN_PROGRESS' as any };
      const updatedTask = { ...existingTask, status: 'IN_PROGRESS' };
      mockPrisma.todo.findFirst.mockResolvedValue(existingTask);
      mockPrisma.todo.update.mockResolvedValue(updatedTask);

      await service.updateTask(userId, taskId, dto);

      expect(mockGateway.emitTaskStatusUpdate).toHaveBeenCalledWith(
        userId,
        taskId,
        'IN_PROGRESS',
      );
    });

    it('should not emit websocket event when status does not change', async () => {
      const dto = { title: 'New Title' };
      mockPrisma.todo.findFirst.mockResolvedValue(existingTask);
      mockPrisma.todo.update.mockResolvedValue({ ...existingTask, ...dto });

      await service.updateTask(userId, taskId, dto);

      expect(mockGateway.emitTaskStatusUpdate).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when task not found', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(null);

      await expect(
        service.updateTask(userId, taskId, { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when task belongs to another user', async () => {
      mockPrisma.todo.findFirst.mockResolvedValue(null);

      await expect(
        service.updateTask('other-user', taskId, { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
