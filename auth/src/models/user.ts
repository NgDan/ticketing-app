import mongoose from 'mongoose';

// An interface that describes the properties
// that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

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

// this is a trick we use to ensure proper type checking with mongo
// the User constructor won't type check itself so we need to create
// this function and use this instead of new User directly
// we could've created a function like this:
// const buildUser = (attrs: UserAttrs) => {
//     return new User(attrs);
//   };
// and export that but it's nicer to have it packaged
// into the User object itself so we add it as a method
// It's important to add this method to userSchema before
// we create the User object otherwise it'll throw a type error
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// add the extended UserModel interface so it accepts our new build method
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

new User({
  email: 'test',
  password: 'asdfsdaf',
});

export { User };

// watch "Database Management and Modeling -> Adding Static Properties to a Model"
// for a reminder of this typescript-mongoose trick
