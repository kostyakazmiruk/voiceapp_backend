import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Recording {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  publicId: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column()
  duration: number;

  @Column()
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;
}
