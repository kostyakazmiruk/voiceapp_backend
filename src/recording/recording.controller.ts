import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
  Res,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { renameSync } from 'fs';
import { RecordingService } from './recording.service';
import { Response } from 'express';
import { join } from 'path';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Controller('recordings')
export class RecordingController {
  constructor(private recordingsService: RecordingService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          // Temporary filename, will be renamed later
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `temp-${uniqueSuffix}.webm`);
        },
      }),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max size
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!body.publicId) {
      throw new BadRequestException('publicId is required');
    }

    // Construct new filename
    const newFileName = `${body.publicId}.webm`;
    const newFilePath = join(uploadDir, newFileName);

    // Rename file using `fs.renameSync`
    renameSync(file.path, newFilePath);

    // Save recording details in database
    const recording = await this.recordingsService.create({
      name: body.name,
      description: body.description,
      duration: parseInt(body.duration, 10),
      filePath: newFilePath, // Store the correct file path
      publicId: body.publicId,
    });

    return {
      id: recording.publicId,
      name: recording.name,
      description: recording.description,
      duration: recording.duration,
      publicId: recording.publicId,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const recording = await this.recordingsService.findByPublicId(id);

    if (!recording) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }

    return {
      id: recording.publicId,
      name: recording.name,
      description: recording.description,
      duration: recording.duration,
      publicId: recording.publicId,
      audioUrl: `/api/recordings/${recording.publicId}/audio`, // Add the audio URL
      createdAt: recording.createdAt,
    };
  }

  @Get(':id/audio')
  async downloadAudioById(@Param('id') id: string, @Res() res: Response) {
    const recording = await this.recordingsService.findByPublicId(id);

    if (!recording) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }

    // Construct the file path based on your storage setup
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      'uploads',
      `${recording.publicId}.webm`,
    );

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException(`Audio file not found for ID ${id}`);
    }
    // Set the correct content type and send the file as a stream
    res.setHeader('Content-Type', 'audio/wav');
    res.sendFile(filePath);
  }

  @Get()
  async findAll() {
    const recordings = await this.recordingsService.findAll();

    return recordings.map((recording) => ({
      id: recording.publicId,
      name: recording.name,
      description: recording.description,
      duration: recording.duration,
      publicId: recording.publicId,
      createdAt: recording.createdAt,
    }));
  }

  @Post(':id')
  async update(
    @Param('id') id: string,
    @Body()
    updateData: {
      name?: string;
      description?: string;
    },
  ) {
    const recording = await this.recordingsService.findByPublicId(id);

    if (!recording) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }

    const updatedRecording = await this.recordingsService.update(
      id,
      updateData,
    );

    return {
      id: updatedRecording.publicId,
      name: updatedRecording.name,
      description: updatedRecording.description,
      duration: updatedRecording.duration,
      playbackUrl: `/play/${updatedRecording.publicId}`,
      createdAt: updatedRecording.createdAt,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const recording = await this.recordingsService.findByPublicId(id);

    if (!recording) {
      throw new NotFoundException(`Recording with ID ${id} not found`);
    }

    // Delete the file first
    if (fs.existsSync(recording.filePath)) {
      fs.unlinkSync(recording.filePath);
    }

    await this.recordingsService.remove(id);

    return { message: 'Recording deleted successfully' };
  }
}
