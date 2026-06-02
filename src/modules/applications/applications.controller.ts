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
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from '../users/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) { }

  @ApiOperation({ summary: 'Get all applications' })
  @Get()
  findAll(@CurrentUser() user: { userId: string; email: string; role: UserRole }): Promise<Application[]> {
    return this.applicationsService.findByUser(user.userId);
  }

  // Admin only — tüm application'lar
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllAdmin() {
    return this.applicationsService.findAll();
  }

  @Get(':id')
  findOne(id: string, @CurrentUser() user: { userId: string },
  ): Promise<Application | null> {
  return this.applicationsService.findOne(id, user.userId);
  }

  @ApiOperation({ summary: 'Create application' })
  @ApiResponse({ status: 201, description: 'Application created' })
  @Post()
  create(@Body() createData: CreateApplicationDto, @CurrentUser() user: { userId: string; email: string; role: UserRole },): Promise<Application> {
    return this.applicationsService.create(createData, user.userId);
  }

  @ApiOperation({ summary: 'Update application' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: UpdateApplicationDto,
    @CurrentUser() user: { userId: string },

  ): Promise<Application> {
    return this.applicationsService.update(id, updateData, user.userId);
  }

  @ApiOperation({ summary: 'Delete application' })
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string },): Promise<void> {
    return this.applicationsService.remove(id, user.userId);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all applications — Admin only' })
  getAllAdmin() {
    return this.applicationsService.findAll();
  }
}
