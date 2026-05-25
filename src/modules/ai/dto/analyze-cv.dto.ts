import { IsString, MinLength } from 'class-validator';

export class AnalyzeCvDto {
  @IsString()
  @MinLength(10)
  cv!: string;

  @IsString()
  @MinLength(10)
  jobDescription!: string;
}
