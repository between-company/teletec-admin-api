import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

import type {
  EmailProvider,
  SendEmailData
} from '../interfaces/email-provider.interface.js'

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend
  private readonly from: string

  constructor(
    private readonly configService: ConfigService
  ) {
    const apiKey =
      this.configService.getOrThrow<string>(
        'RESEND_API_KEY'
      )

    this.from =
      this.configService.getOrThrow<string>(
        'EMAIL_FROM'
      )

    this.resend = new Resend(apiKey)
  }

  async send(data: SendEmailData): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.from,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text
    })

    if (error) {
      throw new Error(
        `Failed to send email: ${error.message}`
      )
    }
  }
}