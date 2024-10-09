import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from './posts/posts.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads/',
    }),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODBUSER}:${process.env.MONGODBPASSWORD}@lite-tech.q1tro.mongodb.net/?retryWrites=true&w=majority&appName=lite-tech`,
    ),
    PostModule,
  ],
})
export class AppModule {}
