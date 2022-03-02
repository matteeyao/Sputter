import {
    prop,
    pre,
    ReturnModelType,
    queryMethod,
    index,
    Ref
} from "@typegoose/typegoose";
import { AsQueryMethod } from "@typegoose/typegoose/lib/types";
import bcrypt from 'bcrypt';
import { Field, ObjectType } from "type-graphql";

import { Post } from "./post";

function findByEmail(
    this: ReturnModelType<typeof User, QueryHelpers>, email: User["email"]
) {
    return this.findOne({ email });
}

export interface QueryHelpers {
    findByEmail: AsQueryMethod<typeof findByEmail>
}

@pre<User>('save', async function (){
    // check that the password is being modified
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);

    const hash = await bcrypt.hashSync(this.password, salt);

    this.password = hash;
})
@index({ email: 1 })
@queryMethod(findByEmail)
@ObjectType()
export class User {
    @Field(() => String)
    readonly _id: string;

    @Field(() => String)
    @prop({ required: true })
    name: string;

    @Field(() => String)
    @prop({ required: true })
    email: string;

    @prop({ required: true })
    password: string;

    @Field(() => Date)
    @prop({ default: () => Date.now() })
    date: Date;

    @Field(() => [Post])
    @prop({ ref: () => Post, default: [] })
    posts: Ref<Post>[];
}
