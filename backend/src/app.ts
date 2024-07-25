import 'dotenv/config'

import { subscribe } from './subscriber.js'

subscribe()

// TODO: Add Hono app for longer running backend functions that would timeout in Next.js functions
// TODO: Endpoint to send messages from admin page of web app
