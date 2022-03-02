import { ObjectId } from "mongodb";
import { 
    Arg,
    Ctx,
    FieldResolver,
    Mutation,
    Query,
    Resolver,
    Root,
} from "type-graphql";

import { User } from "../entities/user";
import { PostModel, UserModel } from "../entities/central-processing";
import { ObjectIdScalar } from "../types/object-id.scalar";
import { RegisterInput } from "./types/user-input";
import { Context } from "../index";
import { Post } from "../entities/post";
import { Ref } from "@typegoose/typegoose";

@Resolver(of => User)
export class UserResolver {
    @Query(() => [User])
    async users(): Promise<User[]> {
        return (await UserModel.find({}))!;
    }

    @Query(returns => User, { nullable: true })
    user(@Arg("userId", type => ObjectIdScalar) userId: ObjectId) {
        return UserModel.findById(userId).lean();
    }
    
    @Mutation(returns => User)
    async register(
        @Arg("data") registerInput: RegisterInput,
        @Ctx() { user }: Context,
    ): Promise<User> {
        return UserModel.create(registerInput);
    }

    @FieldResolver()
    async posts(@Root() user: User): Promise<(Post | null)[]> {
        return await Promise.all(user.posts.map(async (post: Ref<Post>) => {
            return (PostModel.findById(post))!;
        }));
        // return (await PostModel.find({}))!;
    }
}
