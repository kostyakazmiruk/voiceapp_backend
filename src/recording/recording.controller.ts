import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { RecordingService } from './recording.service';

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
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      name: string;
      description?: string;
      duration: string;
      publicId: string;
    },
  ) {
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
}
