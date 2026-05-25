import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class AiService {
  private client: Anthropic;
  private model: string;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  }

  async analyzeCV(cv: string, jobDescription: string) {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      temperature: 0.3, // düşük = tutarlı analiz
      messages: [
        {
          role: 'user',
          content: `You are an expert career advisor and recruiter with 10+ years of experience.

Analyze the following CV against the job description and provide:
1. A compatibility score (1-10)
2. Top 3 strengths that match the role
3. Top 3 gaps or weaknesses
4. Specific recommendations to improve the CV for this role

CV:
${cv}

Job Description:
${jobDescription}

Respond in the following JSON format:
{
  "score": number,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}

Respond with JSON only, no additional text.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      const cleaned = content.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleaned) as {
        score: number;
        strengths: string[];
        weaknesses: string[];
        recommendations: string[];
      };
    }

    throw new Error('Unexpected response from Claude');
  }

  generateCoverLetter(
    cv: string,
    jobDescription: string,
  ): AsyncIterable<string> {
    const stream = this.client.messages.stream({
      model: this.model,
      max_tokens: 1024,
      temperature: 0.7, // yüksek = daha yaratıcı cover letter
      messages: [
        {
          role: 'user',
          content: `You are an expert career advisor. Write a professional and compelling cover letter based on the CV and job description below.

CV:
${cv}

Job Description:
${jobDescription}

Write a cover letter that:
- Is professional and engaging
- Highlights relevant experience
- Shows enthusiasm for the role
- Is 3-4 paragraphs long
- Does not include placeholders like [Your Name]

Respond with the cover letter text only.`,
        },
      ],
    });

    return this.streamToAsyncIterable(stream);
  }

  private async *streamToAsyncIterable(
    stream: ReturnType<typeof this.client.messages.stream>,
  ): AsyncIterable<string> {
    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield event.delta.text;
      }
    }
  }
}
