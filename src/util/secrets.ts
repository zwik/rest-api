import dotenv from 'dotenv'
import consola from 'consola'

dotenv.config()

export const { MONGODB_URI } = process.env

if (!MONGODB_URI) {
  consola.info('No Mongo connection string. Set MONGODB_URI environment variable')
  process.exit(1)
}

export const { JWT_SECRET } = process.env

if (!JWT_SECRET) {
  consola.info('No JWT secret string. Set JWT_SECRET environment variable')
  process.exit(1)
}
