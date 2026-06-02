import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationNotFoundException } from './error/application-not-found.exception';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) {}

  findAll(): Promise<Application[]> {
    return this.applicationsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string, userId: string): Promise<Application> {
    const application = await this.applicationsRepository.findOneBy({ id, userId });
    if (!application) {
      throw new ApplicationNotFoundException(id);
    }
    return application;
  }

  create(createData: CreateApplicationDto, userId: string): Promise<Application> {
    const newApplication = this.applicationsRepository.create({ ...createData, userId });
    return this.applicationsRepository.save(newApplication);
  }

  async update(
    id: string,
    updateData: UpdateApplicationDto,
    userId: string
  ): Promise<Application> {
    await this.applicationsRepository.update({ id, userId }, updateData);
    return this.findOne(id, userId) as Promise<Application>;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.applicationsRepository.delete({ id, userId });
  }

  findByUser(userId: string): Promise<Application[]> {
    return this.applicationsRepository.findBy({ userId });
  }
}
