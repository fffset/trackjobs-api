import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ApplicationStatus {
  APPLIED = 'applied',
  INTERVIEW = 'interview',
  OFFER = 'offer',
  REJECTED = 'rejected',
}

@Entity()
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  company!: string;

  @Column()
  position!: string;

  @Column({ nullable: true })
  location!: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
  })
  status!: ApplicationStatus;

  @Column({ nullable: true })
  notes!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
