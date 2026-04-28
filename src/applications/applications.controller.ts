import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { Application } from './application.entity';

@Controller('applications')
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
  create(@Body() application: Partial<Application>): Promise<Application> {
    return this.applicationsService.create(application);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<Application>,
  ): Promise<Application> {
    return this.applicationsService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.applicationsService.remove(id);
  }
}
