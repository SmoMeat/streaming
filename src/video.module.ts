import { Module } from '@nestjs/common';
import { AppController } from './video.controller';
import { VideoService } from './video.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('COSMOS_CONNECTION_STRING'),
            }),
            inject: [ConfigService],
        })
    ],
    controllers: [AppController],
    providers: [VideoService],
})
export class AppModule { }
