import { BadRequestException, Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream, readdir, readdirSync } from 'fs';
import { stat } from 'fs/promises';
import { join } from 'path';
import { RangeDto } from './range.interface';

@Injectable()
export class VideoService {

    getVideoStream(path: string): StreamableFile {
        const video = createReadStream(join(process.cwd(), path))
        return new StreamableFile(video)
    }

    async getFileSize(path: string): Promise<number> {
        const status = await stat(path)
        return status.size
    }

    // parseRange(range: string, fileSize: number) {
    //     const parseResult = rangeParser(fileSize, range);
    //     console.log(parseResult)
    //     if (parseResult === -1 || parseResult === -2 || parseResult.length !== 1) {
    //       throw new BadRequestException();
    //     }
    //     return parseResult[0];
    // }

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
        console.log(path)
        const videoMetadata = await this.getVideoStream(path)
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
}
