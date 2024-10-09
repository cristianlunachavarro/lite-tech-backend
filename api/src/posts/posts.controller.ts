import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  HttpException,
  UseInterceptors,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostModel } from './schemas/post.schema';
import { Model, ObjectId, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { UploadedFile } from '@nestjs/common';

@Controller('api/posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    @InjectModel(PostModel.name) private postModel: Model<PostModel>,
  ) {}

  @Get()
  async getAllPosts(@Query('page') page = '1', @Query('limit') limit = '10') {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber < 1 ||
      limitNumber < 1
    ) {
      throw new BadRequestException(
        'Page and limit must be valid numbers greater than 0',
      );
    }

    const { posts, totalItems } = await this.postsService.findAll(
      pageNumber,
      limitNumber,
    );

    return { posts, totalItems };
  }

  @Get('related')
  async getRelatedPosts(@Query('excludeId') currentPostsIds: string) {
    try {
      const actualRelatePostsIds = currentPostsIds
        .split(',')
        .map((id) => new Types.ObjectId(id));
      const posts = await this.postsService.findRelated(actualRelatePostsIds);
      return posts;
    } catch (error) {
      console.log('Error,', error);
    }
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.postsService.findById(id);
    return post;
  }

  @Post('related')
  async createPost(
    @Body() body: { title: string; article: string; imageUrl: string },
  ) {
    const existingPost = await this.postsService.findByTitle(body.title);
    const { title, article, imageUrl } = body;

    if (existingPost) {
      throw new HttpException('Title already exists', 400);
    }

    await this.postsService.create(title, article, imageUrl);
    return this.getAllPosts();
  }

  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is not provided');
    }

    try {
      return { imageUrl: `${process.env.UPLOAD_URL}/${file.filename}` };
    } catch (error) {
      console.log('Error uploading file:', error);
      throw new InternalServerErrorException('File upload failed');
    }
  }
}
