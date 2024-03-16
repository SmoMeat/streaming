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
    async getVideo(@Headers('range') range: string, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
        console.log(range)

        const {streamableFile, contentRange} = await this.videoService.getPartialVideoStream(range)

        res.status(206)
        res.set({
            'Content-Range': contentRange
        })
    
        return streamableFile
    }

    @Get('video2')
    //@Header('Accept-Ranges', 'bytes')
    @Header('Content-Type', 'application/octet-stream')
    async getVideo2(@Res({ passthrough: true }) res: Response, @Query('start') rangeStart: string, @Query('end') rangeEnd : string): Promise<StreamableFile> {
        
        const fileSize = await this.videoService.getFileSize('Lady Gaga - Bad Romance (Official Music Video).mp4')
        console.log(fileSize)
        const range: string = `bytes=${rangeStart}-${rangeEnd}` ///${fileSize}`
        const {streamableFile, contentRange} = await this.videoService.getPartialVideoStream(range)

        res.status(206)
        res.set({
            'Content-Range': contentRange
        })

        return streamableFile
    }

    @Get('video3')
    @Header('Accept-Ranges', 'bytes')
    @Header('Content-Type', 'application/octet-stream')
    async getVideo3(@Headers('range') range: string, @Res({ passthrough: true }) res: Response) {
        if (!range) {
            console.log('Oh shit... :/')
            res.status(400).send("Requires Range header");
        }
        const {streamableFile, contentRange} = await this.videoService.getPartialVideoStream(range)

        console.log(contentRange)

        res.status(206)
        res.set({
            'Content-Range': contentRange
        })
    
        return
    }

    @Get('search')
    searchVideo() {
        return this.videoService.findVideos()
    }
}
