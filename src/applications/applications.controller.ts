import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Application } from './application.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Get()
  findAll(): Promise<Application[]> {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  findOne(id: string): Promise<Application | null> {
    return this.applicationsService.findOne(id);
  }

  @Post()
  create(@Body() createData: CreateApplicationDto): Promise<Application> {
    return this.applicationsService.create(createData);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.applicationsService.remove(id);
  }
}
