import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';

const mockCreate = jest.fn();
const mockStream = jest.fn();

jest.mock('@anthropic-ai/sdk', () => {
  const mock = jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate,
      stream: mockStream,
    },
  }));
  return { default: mock, __esModule: true };
});

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('analyzeCV', () => {
    const cvAnalysisResponse = {
      score: 8,
      strengths: ['s1', 's2', 's3'],
      weaknesses: ['w1', 'w2', 'w3'],
      recommendations: ['r1', 'r2', 'r3'],
    };

    it('should parse and return a valid JSON response', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(cvAnalysisResponse) }],
      });

      const result = await service.analyzeCV('my cv text here', 'job description here');

      expect(result).toEqual(cvAnalysisResponse);
    });

    it('should strip markdown code fences before parsing', async () => {
      mockCreate.mockResolvedValue({
        content: [{ type: 'text', text: '```json\n' + JSON.stringify(cvAnalysisResponse) + '\n```' }],
      });

      const result = await service.analyzeCV('my cv text here', 'job description here');

      expect(result).toEqual(cvAnalysisResponse);
    });
  });

  describe('generateCoverLetter', () => {
    it('should yield text chunks from the stream', async () => {
      async function* fakeStream() {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hello' } };
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' world' } };
      }
      mockStream.mockReturnValue(fakeStream());

      const iterable = service.generateCoverLetter('my cv text here', 'job description here');
      const chunks: string[] = [];
      for await (const chunk of iterable) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' world']);
    });
  });
});
