import { User } from '../models/user'; 

declare module 'hono' {
  interface HonoRequest {
    user?: User;
  }
}
