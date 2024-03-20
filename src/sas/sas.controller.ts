import { Controller, Get, UseGuards } from '@nestjs/common';
import { SasService } from './sas.service';
import { AuthGuard } from 'src/auth-service/auth.guard';

@Controller('sas')
export class SasController {

    constructor(
        private sasService: SasService,
    ) {}

    @Get()
    @UseGuards(AuthGuard)
    async getSas() {
        return {sasToken: await this.sasService.getCurrentSas()}
    }
}
