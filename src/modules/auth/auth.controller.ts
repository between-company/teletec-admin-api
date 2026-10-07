  import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res
  } from '@nestjs/common'
  import { ConfigService } from '@nestjs/config'
  import {
    ApiOperation,
    ApiTags
  } from '@nestjs/swagger'
  import type {
    Request,
    Response
  } from 'express'
  
  import { API_VERSION } from '../../common/constants/api-version.constants.js'
  import { ERROR_CODES } from '../../common/http/constants/error-codes.js'
  import { ApiErrorResponse } from '../../common/swagger/decorators/api-error-response.decorator.js'
  import { ApiSuccessResponse } from '../../common/swagger/decorators/api-success-response.decorator.js'
  
  import { AuthService } from './auth.service.js'
  import { AUTH_COOKIE } from './constants/auth.constants.js'
  import { LoginDto } from './dto/login.dto.js'
  import { LoginResponseDto } from './dto/login-response.dto.js'
  import { LogoutResponseDto } from './dto/logout-response.dto.js'
  import { RefreshResponseDto } from './dto/refresh-response.dto.js'
  import { ApiException } from '../../common/http/exceptions/api.exception.js'
  
  @ApiTags('Auth')
  @Controller({
    path: 'auth',
    version: API_VERSION.V1
  })
  export class AuthController {
    constructor(
      private readonly authService: AuthService,
      private readonly configService: ConfigService
    ) {}
  
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
      summary: 'Sign in with email and password'
    })
    @ApiSuccessResponse(
      LoginResponseDto,
      {
        status: HttpStatus.OK
      }
    )
    @ApiErrorResponse({
      status: HttpStatus.UNAUTHORIZED,
      code: ERROR_CODES.AUTH_INVALID_CREDENTIALS,
      message: 'Invalid email or password'
    })

    async login(
      @Body() dto: LoginDto,
      @Res({ passthrough: true }) response: Response
    ): Promise<LoginResponseDto> {
      const result = await this.authService.login(
        dto.email,
        dto.password
      )
      
      this.setRefreshTokenCookie(
        response,
        result.refreshToken
      )
  
      return {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: result.user
      }
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
      summary: 'Refresh the access token'
    })
    @ApiSuccessResponse(
      RefreshResponseDto,
      {
        status: HttpStatus.OK
      }
    )
    @ApiErrorResponse({
      status: HttpStatus.UNAUTHORIZED,
      code: ERROR_CODES.AUTH_REFRESH_TOKEN_MISSING,
      message: 'Refresh token is missing'
    })
    @ApiErrorResponse({
      status: HttpStatus.UNAUTHORIZED,
      code: ERROR_CODES.AUTH_INVALID_SESSION,
      message: 'Invalid or expired session'
    })
    async refresh(
      @Req() request: Request,
      @Res({ passthrough: true }) response: Response
    ): Promise<RefreshResponseDto> {
      const refreshToken =
        request.cookies?.[AUTH_COOKIE.REFRESH_TOKEN]

      if (
        !refreshToken ||
        typeof refreshToken !== 'string'
      ) {
        throw new ApiException({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ERROR_CODES.AUTH_REFRESH_TOKEN_MISSING,
          message: 'Refresh token is missing'
        })
      }

      const result = await this.authService.refresh(
        refreshToken
      )

      this.setRefreshTokenCookie(
        response,
        result.refreshToken
      )

      return {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: result.user
      }
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
      summary: 'Revoke the current session and clear the refresh token'
    })
    @ApiSuccessResponse(
      LogoutResponseDto,
      {
        status: HttpStatus.OK
      }
    )
    @ApiErrorResponse({
      status: HttpStatus.UNAUTHORIZED,
      code: ERROR_CODES.AUTH_REFRESH_TOKEN_MISSING,
      message: 'Refresh token is missing'
    })
    @ApiErrorResponse({
      status: HttpStatus.UNAUTHORIZED,
      code: ERROR_CODES.AUTH_INVALID_SESSION,
      message: 'Invalid or expired session'
    })
    async logout(
      @Req() request: Request,
      @Res({ passthrough: true }) response: Response
    ): Promise<LogoutResponseDto> {
      const refreshToken =
        request.cookies?.[AUTH_COOKIE.REFRESH_TOKEN]

      this.clearRefreshTokenCookie(response)

      if (
        !refreshToken ||
        typeof refreshToken !== 'string'
      ) {
        throw new ApiException({
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ERROR_CODES.AUTH_REFRESH_TOKEN_MISSING,
          message: 'Refresh token is missing'
        })
      }

      await this.authService.logout(refreshToken)

      return {
        loggedOut: true
      }
    }

    private setRefreshTokenCookie(
      response: Response,
      refreshToken: string
    ): void {
      const sessionExpiresDays =
        this.configService.getOrThrow<number>(
          'SESSION_EXPIRES_DAYS'
        )
    
      response.cookie(
        AUTH_COOKIE.REFRESH_TOKEN,
        refreshToken,
        {
          ...this.refreshTokenCookieOptions(),
          maxAge:
            sessionExpiresDays *
            24 *
            60 *
            60 *
            1000
        }
      )
    }

    private clearRefreshTokenCookie(
      response: Response
    ): void {
      response.clearCookie(
        AUTH_COOKIE.REFRESH_TOKEN,
        this.refreshTokenCookieOptions()
      )
    }

    private refreshTokenCookieOptions(): {
      httpOnly: true
      secure: boolean
      sameSite: 'lax'
      path: '/api/v1/auth'
    } {
      const isProduction =
        this.configService.get<string>('NODE_ENV') ===
        'production'

      return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/api/v1/auth'
      }
    }
  }