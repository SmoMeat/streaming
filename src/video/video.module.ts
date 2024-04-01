import { Module } from '@nestjs/common';
import { AppController } from './video.controller';
import { VideoFileService } from './video-file.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VideoBlobService } from './video-blob.service';
import { InjectionToken } from 'src/injection-token.enum';
import { AuthModule } from 'src/auth-service/auth.module';
import { SasController } from 'src/sas/sas.controller';
import { SasService } from 'src/sas/sas.service';
import { VideoSchema } from './video.model';

@Module({
    imports: [
        AuthModule,
        ConfigModule.forRoot({
            isGlobal: true
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_CONNECTION_STRING'),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([{ name: 'videos', schema: VideoSchema }])
    ],
    controllers: [AppController, SasController],
    providers: [
        {
            provide: InjectionToken.VIDEOSERVICE,
            useClass: process.env.VIDEO_DATASOURCE === "blob"
                ? VideoBlobService
                : VideoFileService,
        }, 
        SasService
    ],
})
export class AppModule { }
