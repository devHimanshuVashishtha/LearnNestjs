import { Document } from "mongoose";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


export type UserDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    age: number;

    @Prop()
    country?: string;

    @Prop()
    profilepic?: string;

    @Prop()
    phone?: string
}

export const UserSchema = SchemaFactory.createForClass(User);

