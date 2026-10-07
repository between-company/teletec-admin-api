import { Module } from '@nestjs/common'

import { EmailService } from './email.service.js'
import { ResendEmailProvider } from './providers/resend-email.provider.js'
import { EMAIL_PROVIDER } from './constants/email.constants.js'

@Module({
  providers: [
    ResendEmailProvider,
    {
      provide: EMAIL_PROVIDER,
      useExisting: ResendEmailProvider,
    },
    EmailService
  ],
  exports: [
    EmailService
  ]
})
export class EmailModule {}