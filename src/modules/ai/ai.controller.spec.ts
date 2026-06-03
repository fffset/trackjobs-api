import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

const mockAiService = {
  analyzeCV: jest.fn(),
  generateCoverLetter: jest.fn(),
};

const mockResponse = () => {
  const res: Record<string, jest.Mock> = {};
  res.setHeader = jest.fn().mockReturnValue(res);
  res.write = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

describe('AiController', () => {
  let controller: AiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [{ provide: AiService, useValue: mockAiService }],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeCV', () => {
    it('should call aiService.analyzeCV and return the result', async () => {
      const analysis = { score: 8, strengths: [], weaknesses: [], recommendations: [] };
      mockAiService.analyzeCV.mockResolvedValue(analysis);

      const result = await controller.analyzeCV({ cv: 'my cv', jobDescription: 'job desc' });

      expect(result).toEqual(analysis);
      expect(mockAiService.analyzeCV).toHaveBeenCalledWith('my cv', 'job desc');
    });
  });

  describe('generateCoverLetter', () => {
    it('should stream chunks and end with [DONE]', async () => {
      async function* fakeStream() {
        yield 'Hello';
        yield ' world';
      }
      mockAiService.generateCoverLetter.mockReturnValue(fakeStream());
      const res = mockResponse();

      await controller.generateCoverLetter({ cv: 'my cv', jobDescription: 'job desc' }, res as any);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(res.write).toHaveBeenCalledWith('data: Hello\n\n');
      expect(res.write).toHaveBeenCalledWith('data:  world\n\n');
      expect(res.write).toHaveBeenCalledWith('data: [DONE]\n\n');
      expect(res.end).toHaveBeenCalled();
    });
  });
});
