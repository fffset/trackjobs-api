import { IsOptional, IsString } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  company!: string;

  @IsString()
  position!: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
