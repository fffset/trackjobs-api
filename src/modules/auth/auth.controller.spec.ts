import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockTokens = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  rememberMe: false,
};

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
};

const mockResponse = () => {
  const res: Record<string, jest.Mock> = {};
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register and return tokens', async () => {
      mockAuthService.register.mockResolvedValue(mockTokens);

      const result = await controller.register({ email: 'a@a.com', password: '123456' });

      expect(result).toEqual(mockTokens);
      expect(mockAuthService.register).toHaveBeenCalledWith({ email: 'a@a.com', password: '123456' });
    });
  });

  describe('login', () => {
    it('should set cookies and return success', async () => {
      mockAuthService.login.mockResolvedValue(mockTokens);
      const res = mockResponse();

      const result = await controller.login({ email: 'a@a.com', password: '123456' }, res as any);

      expect(res.cookie).toHaveBeenCalledWith('access_token', expect.any(String), expect.any(Object));
      expect(res.cookie).toHaveBeenCalledWith('refresh_token', expect.any(String), expect.any(Object));
      expect(result).toHaveProperty('success', true);
    });
  });

  describe('getMe', () => {
    it('should return the current user from JWT payload', () => {
      const user = { userId: 'user-123', email: 'a@a.com' };

      const result = controller.getMe(user);

      expect(result).toEqual(user);
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success', () => {
      const res = mockResponse();

      const result = controller.logout(res as any);

      expect(res.clearCookie).toHaveBeenCalledWith('access_token');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(result).toEqual({ success: true });
    });
  });
});
