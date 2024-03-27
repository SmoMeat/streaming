import { BadRequestException, Injectable, OnModuleInit, StreamableFile } from '@nestjs/common';
import { readdirSync } from 'fs';
import { stat } from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { RangeDto } from 'src/video/range.interface';
import { IVideoService } from './video.interface';
import { JwtPayloadDto } from './jwt-payload.interface';

@Injectable()
export class VideoBlobService implements OnModuleInit, IVideoService {

    containerClient: ContainerClient;
    TRUTH_TABLE = { // TODO : add more extension
        "video/mp4": ".mp4",
        "video/mpeg": ".mpeg",
        "video/webm": ".webm"
    }
    
    constructor(
        private readonly configService: ConfigService
    ) {}

    onModuleInit() {
        const blobServiceClient = new BlobServiceClient(
            `https://${this.configService.get<string>('ACCOUNT_NAME')}.blob.core.windows.net/`,
            new DefaultAzureCredential()
        )
        this.containerClient = blobServiceClient.getContainerClient('videos');
    }

    async getVideoStream2(id: string) { //: Promise<NodeJS.ReadableStream>
        const blobClient = this.containerClient.getBlobClient(id)
        const response = await blobClient.download(0)
        return response
    }

    streamToUint8Array(stream): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        stream.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const uint8Array = new Uint8Array(buffer);
            resolve(uint8Array);
        });
        stream.on('error', reject);
    });
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
        const blobClient = this.containerClient.getBlobClient(id)
        const fileSize = (await blobClient.getProperties()).contentLength

        const { start, end } = this.parseRange(range, fileSize)

        console.log(start, end)
        const response = await blobClient.download(start, 100_000)
        console.log('response ' + response.contentLength)
        

        //const stream = createReadStream(path, { start, end })
        const stream = await this.streamToUint8Array(response.readableStreamBody)
        console.log('ByteLenght'+ stream.byteLength)
        
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
        if (this.TRUTH_TABLE[file.mimetype] === undefined) {
            return `${file.mimetype} is not supported`
        }

        file.filename = Date.now().toString() + this.mimeTypeToExtension(file.mimetype)
        const blobClient = this.containerClient.getBlockBlobClient(file.filename)
        await blobClient.uploadData(file.buffer)
        await blobClient.setMetadata({
            originalName: file.originalname,
            mimetype: file.mimetype,
            user: jwtPayload.username,
        })
        
    }

    mimeTypeToExtension(mimetype: string): string {
        return this.TRUTH_TABLE[mimetype]
    }


}
