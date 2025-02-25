import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recording } from './recording.entity';
import { RecordingService } from './recording.service';
import { RecordingController } from './recording.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Recording])],
  controllers: [RecordingController], // Correctly reference the controller here
  providers: [RecordingService], // Correctly reference the service here
})
export class RecordingModule {}
