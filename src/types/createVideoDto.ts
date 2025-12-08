import type { PublishStatus } from './index.ts';

export interface CreateVideoDto {
    videoFile: File;
    idLink: string;
    publishStatus: PublishStatus;
    showLinkAt: number;
    qrCodeX: number;
    qrCodeY: number;
    qrCodeSize: number;
}
