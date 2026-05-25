import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { AnalyzeCvDto } from './dto/analyze-cv.dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-cv')
  async analyzeCV(@Body() body: AnalyzeCvDto) {
    return this.aiService.analyzeCV(body.cv, body.jobDescription);
  }

  @Post('cover-letter')
  async generateCoverLetter(
    @Body() body: { cv: string; jobDescription: string },
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = this.aiService.generateCoverLetter(
      body.cv,
      body.jobDescription,
    );

    for await (const chunk of stream) {
      res.write(`data: ${chunk}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  }
}
