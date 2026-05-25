import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../application.entity';

export class UpdateApplicationDto {
  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(ApplicationStatus)
  @IsOptional()
  status?: ApplicationStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
