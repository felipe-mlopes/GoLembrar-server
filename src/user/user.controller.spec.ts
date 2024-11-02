import { MAILER_OPTIONS, MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { vi } from 'vitest';
import { RequestWithUser } from '../common/utils/types/RequestWithUser';
import { EmailService } from '../email/email.service';
import { MailtrapService } from '../email/mailtrap/mailtrap.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findOne: vi.fn().mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'user1@email.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    create: vi.fn().mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000002',
      email: 'user2@email.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    update: vi.fn().mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      email: 'user123@email.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    remove: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        ConfigService,
        PrismaService,
        EmailService,
        JwtService,
        MailtrapService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        { provide: MAILER_OPTIONS, useValue: {} },
        {
          provide: MailerService,
          useValue: { sendMail: vi.fn() },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user in current session', async () => {
      const userExpected = await mockUserService.findOne();

      const user = await controller.findOne({
        user: { sub: userExpected.id },
      } as RequestWithUser);

      expect(user).toEqual(userExpected);
      expect(user).not.toHaveProperty('password');
    });

    it('should return a 404 error', async () => {
      mockUserService.findOne.mockRejectedValueOnce(
        new Error('User not found'),
      );

      await expect(
        controller.findOne({
          user: { sub: 'nonexistent-id' },
        } as RequestWithUser),
      ).rejects.toThrow('User not found');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const userExpected = mockUserService[1];

      const userToCreate: CreateUserDto = {
        name: 'any_name',
        email: 'email@example.com',
        password: '123456AAA',
      };

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      await controller.create(userToCreate, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'user created',
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userExpected = await mockUserService.update();

      const userToUpdate: UpdateUserDto = {
        email: 'user123@email.com',
        password: '1234',
      };

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const user = await controller.update(
        { user: { sub: userExpected.id } } as RequestWithUser,
        userToUpdate,
        mockResponse as Response,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(204);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const idExpected = mockUserService.findOne().id;

      const user = await controller.remove({
        user: { sub: idExpected },
      } as RequestWithUser);
      expect(user).toBeUndefined();
      expect(mockUserService.remove).toHaveBeenCalledWith(idExpected);
    });
  });
});
