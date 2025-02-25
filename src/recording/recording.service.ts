import { Injectable } from '@nestjs/common';
import { Recording } from './recording.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RecordingService {
  constructor(
    @InjectRepository(Recording)
    private recordingsRepository: Repository<Recording>,
  ) {}

  async create(data: {
    name: string;
    description?: string;
    duration: number;
    filePath: string;
    publicId: string;
  }): Promise<Recording> {
    const recording = this.recordingsRepository.create({
      ...data,
    });

    return this.recordingsRepository.save(recording);
  }
}
