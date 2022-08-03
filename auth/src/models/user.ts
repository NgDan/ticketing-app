import mongoose from 'mongoose';
import { Password } from '../services/password';

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

const userSchema = new mongoose.Schema(
  {
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
  },
  {
    // this toJSON is a config property that allows us to customize how we JSON.stringify the user model
    // before stringifying it and sending it back as a HTTP response payload. We don't want to send back the password
    // and the __v fields and we want to rename the _id field
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// this is a mongoose Schema "hook". It's a cb called before
// the db saves something.
// Inside this cb function we get access to the document it's being saved
// inside the "this" keyword, that's why we need to use the "function"
// keyword instead of an arrow function
userSchema.pre('save', async function (done) {
  // we need to check if the password is modified so we don't
  // hash it twice in the case we're trying to save a modified user
  // like when we change an email or some other detail
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  // mongoose doesn't have very good async await support so
  // we need to call "done" when we're done with our async await
  // stuff to let the db know
  done();
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
