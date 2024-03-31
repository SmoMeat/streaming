import { Controller, Get, Header, Headers, Inject, Param, Post, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { IVideoService } from './video.interface';
import { InjectionToken } from 'src/injection-token.enum';
import { AuthGuard } from 'src/auth-service/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadDto } from './jwt-payload.interface';

@Controller()
export class AppController {
    constructor(
        @Inject(InjectionToken.VIDEOSERVICE)
        private videoService: IVideoService,

        private jwtService: JwtService,

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

    @Post('upload')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Headers('Authorization') auth: string) {
        const jwtPayload: JwtPayloadDto = await this.jwtService.decode(auth.split(' ')[1])
        return this.videoService.uploadVideo(file, jwtPayload)
    }

    @Get('test')
    testing() {
        this.videoService.insertVideoMetadata('Dune 2', 'Dune-part2.mp4', 'Le meilleur film de lannee', 'user37')
        return ':)'
    }
}
