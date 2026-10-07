export interface SendEmailData {
    to: string
    subject: string
    html: string
    text?: string
  }
  
  export interface EmailProvider {
    send(data: SendEmailData): Promise<void>
  }