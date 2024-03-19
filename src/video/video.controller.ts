import { Controller, Get, Header, Headers, Inject, Param, Post, Query, Res, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { VideoBlobService } from './video-blob.service';
import { ConfigService } from '@nestjs/config';
import { IVideoService } from './video.interface';
import { InjectionToken } from 'src/injection-token.enum';

@Controller()
export class AppController {
    constructor(
        @Inject(InjectionToken.VIDEOSERVICE)
        private videoService: IVideoService,

    ) {}

    @Get('videos/:id')
    @Header('Accept-Ranges', 'bytes')
    @Header('Content-Type', 'application/octet-stream')
    async getVideo(@Headers('range') range: string, @Res({ passthrough: true }) res: Response, @Param('id') id): Promise<StreamableFile> {
        
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

    @Post('video')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './videos/',
                filename: (req, file, callback) => {
                    // TODO: gerer le cas ou on upload un fichier avec le meme nom qu'un deja existant
                    callback(null, file.originalname)
                }
            })
        })
    )
    uploadVideo(@UploadedFile() file: Express.Multer.File) {
        // TODO: Vérifier que c'est bien une video et non un autre fichier
        return this.videoService.uploadVideo(file)
    }
}
