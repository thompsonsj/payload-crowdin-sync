import { APIError } from 'payload'

export class CustomAdminError extends APIError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode, undefined, true)
  }
}

export default CustomAdminError
