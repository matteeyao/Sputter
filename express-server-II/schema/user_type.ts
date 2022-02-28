import {
  buildSchemaSync,
  Field,
  FieldResolver,
  ID,
  Int,
  ObjectType,
  Query,
  Resolver,
  Root
} from 'type-graphql';
import { prop } from '@typegoose/typegoose';
import { IsEmail } from 'class-validator';

@ObjectType()
export class User {
  @Field(() => ID)
  @prop()
  readonly id: number;

  @Field()
  @prop()
  name: string;

  @Field()
  @IsEmail()
  @prop()
  email: string;
}
