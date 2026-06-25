import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../user/user.entity';
import { SharedEventsModule } from '../events/shared-events.module';
import { UserAccountService } from './user-account.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    SharedEventsModule,
  ],
  providers: [UserAccountService],
  exports: [UserAccountService],
})
export class SharedUserAccountModule {}
