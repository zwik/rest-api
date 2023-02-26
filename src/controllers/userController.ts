import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from 'express'
import * as jwt from 'jsonwebtoken'
import passport from 'passport'

import { User } from '../models/user'
import { JWT_SECRET } from '../util/secrets'

export class UserController {
  public async registerUser (req: Request, res: Response): Promise<void> {
    if (!(req.body.username && req.body.password)) {
      res.status(400).end('username and password must be provided')
      return
    }

    try {
      await User.create({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
      })

      const token = jwt.sign({
        username: req.body.username,
        scope: req.body.scope
      }, JWT_SECRET as string)
      res.status(200).send({ token })
    } catch (error) {
      res.status(501).end('Failed to create user')
    }
  }

  public authenticateUser (req: Request, res: Response, next: NextFunction) {
    passport.authenticate('local', (err: Error, user: any) => {
      if (err) return next(err)
      if (!user) return res.status(401).json({ status: 'error', code: 'unauthorized' })
      else {
        const token = jwt.sign({ username: user.username }, JWT_SECRET as string)
        res.status(200).send({ token })
      }
    })
  }
}
