import { Module } from '@nestjs/common';
import { AppController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [VideoService],
})
export class AppModule {}
