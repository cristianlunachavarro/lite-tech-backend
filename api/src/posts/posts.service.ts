import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { Post } from './schemas/post.schema';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<Post>) {}

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ posts: Post[]; totalItems: number }> {
    const skip = (page - 1) * limit;
    const posts = await this.postModel.find().skip(skip).limit(limit).exec();
    const totalItems = await this.postModel.countDocuments();
    return { posts, totalItems };
  }

  async findById(_id: string): Promise<Post> {
    return this.postModel.findById(_id).exec();
  }

  async findRelated(actualRelatePostsIds: Types.ObjectId[]): Promise<Post[]> {
    return this.postModel
      .find({ _id: { $nin: actualRelatePostsIds } })
      .limit(3)
      .exec();
  }
  

  async create(
    title: string,
    article: string,
    imageUrl: string,
  ): Promise<Post> {
    const newPost = new this.postModel({ title, article, imageUrl });
    return newPost.save();
  }

  async findByTitle(title: string): Promise<Post | null> {
    return this.postModel.findOne({ title }).exec();
  }
}
