import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    // this is the javascript String constructor
    // not the typescript type string
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', userSchema);

new User({
  email: 'test',
  password: 'asdfsdaf',
});

export { User };
