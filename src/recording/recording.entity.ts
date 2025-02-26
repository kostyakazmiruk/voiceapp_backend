import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Generated,
} from 'typeorm';

@Entity()
export class Recording {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'text' })
  @Generated('uuid')
  publicId: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  duration: number;

  @Column()
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;
}
