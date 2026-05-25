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
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @ApiOperation({ summary: 'Get all applications' })
  @Get()
  findAll(): Promise<Application[]> {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  findOne(id: string): Promise<Application | null> {
    return this.applicationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create application' })
  @ApiResponse({ status: 201, description: 'Application created' })
  @Post()
  create(@Body() createData: CreateApplicationDto): Promise<Application> {
    return this.applicationsService.create(createData);
  }

  @ApiOperation({ summary: 'Update application' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: UpdateApplicationDto,
  ): Promise<Application> {
    return this.applicationsService.update(id, updateData);
  }

  @ApiOperation({ summary: 'Delete application' })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.applicationsService.remove(id);
  }
}
