import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByPublicId(publicId: string): Promise<Recording> {
    const recording = await this.recordingsRepository.findOne({
      where: { publicId },
    });

    if (!recording) {
      throw new NotFoundException(`Recording with ID ${publicId} not found`);
    }

    return recording;
  }
}
