export interface UserForAuthentication {
    id: string
    email: string
    firstName: string
    lastName: string
    passwordHash: string | null
    isActive: boolean
    activatedAt: Date | null
  }