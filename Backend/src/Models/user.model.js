
import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {   type: String, required: true, unique: true },   
  name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },        
  password: { type: String, required: true },
  token: { type: String},
})
const userModel = model('User', userSchema);

export { userModel };