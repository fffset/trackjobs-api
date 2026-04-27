import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from './application.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application)
    private applicationsRepository: Repository<Application>,
  ) { }

  findAll(): Promise<Application[]> {
    return this.applicationsRepository.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string): Promise<Application | null> {
    return this.applicationsRepository.findOneBy({ id });
  }

  create(application: Partial<Application>): Promise<Application> {
    const newApplication = this.applicationsRepository.create(application);
    return this.applicationsRepository.save(newApplication);
  }

  async update(
    id: string,
    updateData: Partial<Application>,
  ): Promise<Application> {
    await this.applicationsRepository.update({ id }, updateData);
    return this.findOne(id) as Promise<Application>;
  }

  async remove(id: string): Promise<void> {
    await this.applicationsRepository.delete(id);
  }
}
