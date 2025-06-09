import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
});

export default model('User', UserSchema);
