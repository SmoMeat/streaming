import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        // JwtModule.register({
        //     global: true,
        //     secret: process.env['JWT_PRIVATE_KEY'],
        //     signOptions: {expiresIn: '120s'}
        // })
        
        JwtModule.registerAsync({
            global: true,
            useFactory: (config: ConfigService) => {
                return {
                    secret: config.get<string>('JWT_PRIVATE_KEY'),
                    signOptions: {
                        expiresIn: '120m' //config.get<string | number>(''),
                    },
                };
            }, inject: [ConfigService],
        })
    ],
    providers: [AuthService],
    exports: [AuthService],
    controllers: [AuthController],
})
export class AuthModule {}
