import {
  Inject,
  Injectable
} from '@nestjs/common'
import { render } from '@react-email/render'
import { createElement } from 'react'

import { EMAIL_PROVIDER } from './constants/email.constants.js'
import type { EmailProvider } from './interfaces/email-provider.interface.js'
import type { SendInvitationEmailData } from './interfaces/send-invitation-email.interface.js'
import { InvitationEmail } from './templates/invitation.email.js'

@Injectable()
export class EmailService {
  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider
  ) {}

  async sendInvitation(
    data: SendInvitationEmailData
  ): Promise<void> {
    const template = createElement(
      InvitationEmail,
      {
        firstName: data.firstName,
        invitationUrl: data.invitationUrl
      }
    )

    const html = await render(template)

    const text = await render(template, {
      plainText: true
    })

    await this.emailProvider.send({
      to: data.to,
      subject: 'Invitación a TELETEC',
      html,
      text
    })
  }
}