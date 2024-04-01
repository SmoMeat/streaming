import { JwtPayloadDto } from './jwt-payload.interface';
import { RangeDto } from './range.interface';


export interface IVideoService {

    getFileSize(path: string): Promise<number>

    parseRange(range: string, fileSize: number): RangeDto

    getContentRange(rangeStart: number, rangeEnd: number, fileSize: number): string

    getPartialVideoStream(id: string, range: string): any

    findVideos(): any

    uploadVideo(file: Express.Multer.File, jwtPayload: JwtPayloadDto): void

    insertVideoMetadata(title: string, filename: string, description: string, author: string, length: number, thumbnail: string)

}
