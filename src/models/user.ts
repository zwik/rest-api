import { Document, Schema, Model, model } from 'mongoose'
import bcrypt from 'bcrypt'

export interface IUser extends Document {
  username: string;
  password: string;
}

export const userSchema: Schema = new Schema({
  username: String,
  password: String
})

userSchema.pre<IUser>('save', function (next) {
  const user = this

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) {
        return next(err)
      }

      user.password = hash
      next()
    })
  })
})

userSchema.methods.comparePasswords = function (candidatePassword: string, callback: any) {
  const user = this as IUser

  bcrypt.compare(candidatePassword, user.password, (err, isMatch: boolean) => {
    callback(err, isMatch)
  })
}

export const User: Model<IUser> = model<IUser>('User', userSchema)
