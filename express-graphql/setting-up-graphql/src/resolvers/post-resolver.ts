import { ObjectId } from "mongodb";
import { Resolver, Query, Arg, Mutation, Ctx, FieldResolver, Root } from "type-graphql";

import { Post } from "../entities/post";
import { User } from "../entities/user";
import { UserModel, PostModel } from "../entities/central-processing";
import { CreatePostInput } from "./types/post-input";
import { Context } from "../index";
import { ObjectIdScalar } from "../types/object-id.scalar";
import { Ref } from "@typegoose/typegoose";

@Resolver(of => Post)
export class PostResolver {
    @Query(returns => [Post])
    async posts(): Promise<Post[]> {
        return await PostModel.find({}).lean();
    }

    @Query(returns => Post, { nullable: true })
    post(@Arg("postId", type => ObjectIdScalar) postId: ObjectId) {
        return PostModel.findById(postId);
    }

    @Mutation(returns => Post)
    async createPost(
        @Arg("data") createPostInput: CreatePostInput,
        @Ctx() { user }: Context,
    ): Promise<Post> {
        let newPost: Post = await PostModel.create(createPostInput);
        let author: User = (await UserModel.findById(createPostInput.author))!;
        let posts: Ref<Post>[] = author.posts;
        await UserModel.findByIdAndUpdate(
            createPostInput.author,
            { posts: [...posts, newPost] },
            { new: true }
        );
        return newPost;
    }

    @FieldResolver()
    async author(@Root() post: Post): Promise<User> {
        return (await UserModel.findById(post.author))!;
    }
}
