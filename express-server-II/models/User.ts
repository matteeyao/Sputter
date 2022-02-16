import { Schema, model, Model, Document, Date } from 'mongoose';

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    password: string;
    date: DateConstructor | (() => number);
    posts: Schema.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  posts: [{
      type: Schema.Types.ObjectId,
      ref: 'post'
  }]
});

const UserModel: Model<IUser> = model('user', UserSchema);
export default UserModel;
