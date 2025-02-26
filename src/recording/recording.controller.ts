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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { RecordingService } from './recording.service';
import { Response } from 'express';

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
          console.log('File received:', file);
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `recording-${uniqueSuffix}.webm`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max size
      },
    }),
  )
  async create(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    // console.log('File:', file);
    // console.log('Body:', body);
    // Create recording in database
    const recording = await this.recordingsService.create({
      name: body.name,
      description: body.description,
      duration: parseInt(body.duration, 10),
      filePath: file.path,
      publicId: body.publicId,
    });

    return {
      id: recording.publicId,
      name: recording.name,
      description: recording.description,
      duration: recording.duration,
      publicId: recording.publicId,
      playbackUrl: `/play/${recording.publicId}`,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const recording = await this.recordingsService.findByPublicId(id);

    return {
      id: recording.publicId,
      name: recording.name,
      description: recording.description,
      duration: recording.duration,
      playbackUrl: `/play/${recording.publicId}`,
      createdAt: recording.createdAt,
    };
  }

  @Get(':id/audio')
  async getAudio(@Param('id') id: string, @Res() res: Response) {
    const recording = await this.recordingsService.findByPublicId(id);

    if (!fs.existsSync(recording.filePath)) {
      throw new NotFoundException('Audio file not found');
    }

    const file = fs.createReadStream(recording.filePath);

    res.set('Content-Type', 'audio/webm');
    res.set('Content-Disposition', `inline; filename="${recording.name}.webm"`);

    return new StreamableFile(file);
  }
}
