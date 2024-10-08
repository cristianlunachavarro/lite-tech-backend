import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from './posts/posts.module'; 
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', 'uploads'),
        serveRoot: '/uploads/',
      },
    ),
    MongooseModule.forRoot('mongodb://localhost:27017/litebox_db'), 
    PostModule,
  ],
})
export class AppModule {}