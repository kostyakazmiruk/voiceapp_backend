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
  }): Promise<Recording> {
    const recording = this.recordingsRepository.create({
      ...data,
    });

    return this.recordingsRepository.save(recording);
  }

  async findAll(): Promise<Recording[]> {
    return this.recordingsRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
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

  async update(
    publicId: string,
    data: {
      name?: string;
      description?: string;
    },
  ): Promise<Recording> {
    const recording = await this.findByPublicId(publicId);

    // Update properties
    const obj = Object.assign(recording, data);

    // Save the updated recording
    return this.recordingsRepository.save(obj);
  }

  async remove(publicId: string): Promise<void> {
    const recording = await this.findByPublicId(publicId);

    await this.recordingsRepository.remove(recording);
  }
}
