import consola from 'consola'
import express from 'express'
import compression from 'compression'
import cors from 'cors'
import mongoose from 'mongoose'

import { MONGODB_URI } from './util/secrets'

import { UserRoutes } from './routes/userRoutes'

class Server {
  private app: express.Application

  private connection: mongoose.Connection

  constructor () {
    this.app = express()
    this.connection = mongoose.connection

    this.config()
    this.database()
    this.routes()
  }

  private config (): void {
    this.app.set('port', process.env.PORT || 3000)
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: false }))
    this.app.use(compression())
    this.app.use(cors())
  }

  private database () {
    this.connection.on('connected', () => {
      consola.info('Mongo connection established')
    })
    this.connection.on('reconnected', () => {
      consola.info('Mongo connection re-established')
    })
    this.connection.on('disconnected', () => {
      consola.info('Mongo connection disconnected')
      consola.info('Trying to reconnect to Mongo...')
      setTimeout(async () => {
        await mongoose.connect(MONGODB_URI as string, {
          keepAlive: true,
          socketTimeoutMS: 3000,
          connectTimeoutMS: 3000
        })
      }, 3000)
    })
    this.connection.on('close', () => {
      consola.info('Mongo connection closed')
    })
    this.connection.on('error', (error: Error) => {
      consola.error(`Mongo connection error: ${error}`)
    })

    const run = async () => {
      await mongoose.connect(MONGODB_URI as string, {
        keepAlive: true
      })
    }
    run().catch((error) => consola.error(error))
  }

  public start (): void {
    this.app.listen(this.app.get('port'), () => {
      consola.success(`API is running at http://localhost:${this.app.get('port')}`)
    })
  }

  private routes (): void {
    this.app.use('/api/user', new UserRoutes().router)
  }
}

const server = new Server()

server.start()
