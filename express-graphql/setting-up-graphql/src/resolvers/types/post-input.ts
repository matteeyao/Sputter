import { MaxLength, MinLength } from "class-validator";
import { InputType, Field } from "type-graphql";
import { ObjectId } from "mongodb";

import { User } from "../../entities/user";

@InputType()
export class CreatePostInput {
    @Field()
    title: string

    @Field()
    author: ObjectId;

    @Field(() => String)
    @MinLength(1, {
        message: "Description must be at least 50 characters"
    })
    @MaxLength(50, {
        message: "Description must not be more than 500 characters"
    })
    body: string
}
