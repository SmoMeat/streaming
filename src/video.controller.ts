import { Controller, Get, Header, Headers, Param, Query, Res, StreamableFile } from '@nestjs/common';
import { VideoService } from './video.service';
import { createReadStream } from 'fs';
import { join } from 'path';
import { Response } from 'express';

@Controller()
export class AppController {
    constructor(private readonly videoService: VideoService) { }

    @Get('video')
    @Header('Accept-Ranges', 'bytes')
    @Header('Content-Type', 'application/octet-stream')
    async getVideo(@Headers('range') range: string, @Res({ passthrough: true }) res: Response, @Query('name') id): Promise<StreamableFile> {
        console.log(range)

        const {streamableFile, contentRange} = await this.videoService.getPartialVideoStream(id, range)

        res.status(206)
        res.set({
            'Content-Range': contentRange
        })
    
        return streamableFile
    }


    @Get('search')
    searchVideo() {
        return this.videoService.findVideos()
    }
}
