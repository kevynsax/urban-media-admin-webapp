import type { PublishStatus } from './index.ts';

export interface CreateVideoDto {
    videoFile: File;
    linkToAction: string;
    publishStatus: PublishStatus;
}
