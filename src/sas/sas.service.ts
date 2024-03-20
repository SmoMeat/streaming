import { DefaultAzureCredential } from '@azure/identity';
import { BlobServiceClient, ContainerClient, ContainerSASPermissions, SASProtocol, SASQueryParameters, generateBlobSASQueryParameters } from '@azure/storage-blob';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SasService implements OnModuleInit {

    containerClient: ContainerClient
    blobServiceClient: BlobServiceClient
    userDelegationKey: any
    currentSas: SASQueryParameters

    constructor(
        private readonly configService: ConfigService,
    ) {}

    onModuleInit() {
        this.blobServiceClient = new BlobServiceClient(
            `https://${this.configService.get<string>('ACCOUNT_NAME')}.blob.core.windows.net/`,
            new DefaultAzureCredential()
        )
        this.containerClient = this.blobServiceClient.getContainerClient('videos');
        this.updateSas()
    }

    async getCurrentSas() {
        return this.isSasActive() ? this.currentSas.toString() : (await this.updateSas()).toString()
    }

    isSasActive(): boolean {
        // La date est dans le sas connard
        return true
    }

    async updateSas() {
        this.userDelegationKey = await this.blobServiceClient.getUserDelegationKey(
            new Date(new Date().valueOf() - 86400000),
            new Date(new Date().valueOf() + 86400000), 
        )
        
        const containerPermissionsForAnonymousUser = 'r'
        
        const sasOptions = {
            containerName: 'videos',
            permissions: ContainerSASPermissions.parse(containerPermissionsForAnonymousUser), 
            protocol: SASProtocol.HttpsAndHttp,
            startsOn: new Date(new Date().valueOf() - 86400000),
            expiresOn: new Date(new Date().valueOf() + 86400000)
        }
        
        this.currentSas = generateBlobSASQueryParameters(
            sasOptions, 
            this.userDelegationKey, 
            this.configService.get('ACCOUNT_NAME')
        )

        return this.currentSas
    }
}
