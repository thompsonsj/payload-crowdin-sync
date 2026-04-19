import console from 'node:console'
import nodemailer from 'nodemailer'
import { vi } from 'vitest'

// Align with existing Jest setup used in dev installs.
global.console = console

Object.assign(process.env, { NODE_ENV: 'test' })
process.env.PAYLOAD_DISABLE_ADMIN = 'true'
process.env.PAYLOAD_DROP_DATABASE = 'true'
process.env.PAYLOAD_PUBLIC_CLOUD_STORAGE_ADAPTER = 's3'
process.env.NODE_OPTIONS = '--no-deprecation'
process.env.PAYLOAD_CI_DEPENDENCY_CHECKER = 'true'

// Prevent external service calls.
vi.spyOn(nodemailer, 'createTestAccount').mockImplementation(() => {
  return Promise.resolve({
    imap: { host: 'imap.test.com', port: 993, secure: true },
    pass: 'testpass',
    pop3: { host: 'pop3.test.com', port: 995, secure: true },
    smtp: { host: 'smtp.test.com', port: 587, secure: false },
    user: 'testuser',
    web: 'https://webmail.test.com',
  })
})

