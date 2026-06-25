import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AdvertisementCampaign,
  AdvertisementCampaignSchema,
} from '../../advertisements/advertisement.entity';
import { User, UserSchema } from '../../user/user.entity';
import { WallPost, WallPostSchema } from '../../wall/wall.entity';
import { AdvertisementPlacementService } from './advertisement-placement.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdvertisementCampaign.name, schema: AdvertisementCampaignSchema },
      { name: User.name, schema: UserSchema },
      { name: WallPost.name, schema: WallPostSchema },
    ]),
  ],
  providers: [AdvertisementPlacementService],
  exports: [AdvertisementPlacementService],
})
export class SharedAdvertisementPlacementModule {}
