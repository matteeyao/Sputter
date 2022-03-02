import { getModelForClass } from "@typegoose/typegoose";

import { User, QueryHelpers } from "./user";
import { Post } from "./post";

export const UserModel = getModelForClass<typeof User, QueryHelpers>(User);
export const PostModel = getModelForClass<typeof Post>(Post);
