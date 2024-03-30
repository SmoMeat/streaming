import { BadRequestException, Injectable, OnModuleInit, StreamableFile } from '@nestjs/common';
import { createReadStream, createWriteStream, readdir, readdirSync, write, writeFile } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import { RangeDto } from './range.interface';
import { ConfigService } from '@nestjs/config';
import { IVideoService } from './video.interface';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtPayloadDto } from './jwt-payload.interface';
import { pipeline } from 'stream';

@Injectable()
export class VideoFileService implements OnModuleInit, IVideoService {

    constructor(
        //private readonly configService: ConfigService,
    ) {}

    onModuleInit() {
        // const url = this.configService.get('COSMOS_CONNECTION_STRING')
        // const client = new Mongo
    }

    getVideoStream(path: string): StreamableFile {
        const video = createReadStream(join(process.cwd(), path))
        return new StreamableFile(video)
    }

    async getFileSize(path: string): Promise<number> {
        const status = await stat(path)
        return status.size
    }

    parseRange(range: string, fileSize: number): RangeDto {
        try {
            const packetSize = 100_000
            const start = Number(range.split('=')[1].split('-')[0])
            const end = Math.min(start + packetSize, fileSize - 1)
            return {start, end}
        } catch {
            throw new BadRequestException()
        }  
    }

    getContentRange(rangeStart: number, rangeEnd: number, fileSize: number): string {
        return `bytes ${rangeStart}-${rangeEnd}/${fileSize}`;
    }

    async getPartialVideoStream(id: string, range: string) {
        const path: string = 'videos\\' + id
        //const videoMetadata = await this.getVideoStream(path)
        const fileSize = await this.getFileSize(path)

        const { start, end } = this.parseRange(range, fileSize)

        const stream = createReadStream(path, { start, end })
        
        const streamableFile = new StreamableFile(stream, {
            disposition: `inline; filename="video.mp4"`,
            type: 'video/mp4'
        });
       
        const contentRange = this.getContentRange(start, end, fileSize);
       
        return {
            streamableFile,
            contentRange,
        }
    }

    async findVideos() {
        return readdirSync('./videos/')
    }

    async uploadVideo(file: Express.Multer.File, jwtPayload: JwtPayloadDto) {

        const stream = createWriteStream('./videos')
        await pipeline(
            file.buffer,
            stream,
        )
    }
}
