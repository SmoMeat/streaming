import { JwtPayloadDto } from './jwt-payload.interface';
import { RangeDto } from './range.interface';
import { VideoInfoDto } from './video-info.interface';


export interface IVideoService {

    getFileSize(path: string): Promise<number>

    parseRange(range: string, fileSize: number): RangeDto

    getContentRange(rangeStart: number, rangeEnd: number, fileSize: number): string

    getPartialVideoStream(id: string, range: string): any

    findVideos(): any

    uploadVideo(file: Express.Multer.File, videoInfo: VideoInfoDto): void

    saveVideoMetadata(title: string, filename: string, description: string, author: string, length: number, thumbnail: string)

}
