import { Schema, model, Model, Document, Date } from 'mongoose';

export interface IPost extends Document {
    _id: string;
    title: string;
    author: Schema.Types.ObjectId;
    body: string;
    date: DateConstructor | (() => number);
}

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  body: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const UserModel: Model<IPost> = model('user', PostSchema);
export default UserModel;
