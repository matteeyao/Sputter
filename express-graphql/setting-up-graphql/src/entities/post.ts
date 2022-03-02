import { index, prop, Ref } from "@typegoose/typegoose";
import { Field, ObjectType } from "type-graphql";
import { User } from "./user";

@ObjectType()
@index({ postId: 1 })
export class Post {
    @Field(() => String)
    _id: string

    @Field(() => String)
    @prop({ required: true })
    title: string

    @Field(() => User)
    @prop({ required: true, ref: () => User })
    author: Ref<User>;

    @Field(() => String)
    @prop({ required: true })
    body: string

    @Field(() => Date)
    @prop({ default: () => Date.now() })
    date: Date;
}
