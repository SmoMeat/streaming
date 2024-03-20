import { Controller, Get, Header, Headers, Inject, Param, Post, Query, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { VideoBlobService } from './video-blob.service';
import { ConfigService } from '@nestjs/config';
import { IVideoService } from './video.interface';
import { InjectionToken } from 'src/injection-token.enum';
import { AuthGuard } from 'src/auth-service/auth.guard';
import { Readable} from 'stream';
import * as FormData from "form-data";

@Controller()
export class AppController {
    constructor(
        @Inject(InjectionToken.VIDEOSERVICE)
        private videoService: IVideoService,

    ) {}

    @UseGuards(AuthGuard)
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

    @UseGuards(AuthGuard)
    @Get('search')
    searchVideo() {
        return this.videoService.findVideos()
    }

    @Post('videos')
    @UseInterceptors(
        FileInterceptor('file')
        // FileInterceptor('file', {
        //     storage: diskStorage({
        //         destination: './videos/',
        //         filename: (req, file, callback) => {
        //             // TODO: gerer le cas ou on upload un fichier avec le meme nom qu'un deja existant
        //             callback(null, file.originalname)
        //         }
        //     })
        // })
    )
    async uploadVideo(@UploadedFile() file: Express.Multer.File) {
        // TODO: Vérifier que c'est bien une video et non un autre fichier
        
        await this.videoService.save(
            "./videos",
            file.mimetype,
            file.buffer
            //[{ mediaId: mediaId }]
        );
        
        
        //return this.videoService.uploadVideo(file)
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File) {

        const formData = new FormData();
        const stream = Readable.from(file.buffer);

        formData.append("anyKeyValue", stream, {
            filename: file.originalname,
            contentType: file.mimetype
        })


        console.log(typeof file.stream)
        console.log(file);
    }
}
