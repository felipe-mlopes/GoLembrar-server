import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { RequestWithUser } from '../common/utils/types/RequestWithUser';
import { OkResponse } from '../swagger/decorators/ok.decorator';
import { UnauthorizedResponse } from '../swagger/decorators/unauthorized.decorator';
import { AuthService } from './auth.service';
import { CredentialsDto } from './dto/credentials.dto';
import { RefreshTokenGuard } from './guards/refresh-token/refresh-token.guard';
import { OkLoginModel } from './swagger/okAuthModel.swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Login' })
  @OkResponse(OkLoginModel)
  @UnauthorizedResponse()
  @HttpCode(HttpStatus.OK)
  login(@Body() credentials: CredentialsDto) {
    return this.authService.login(credentials);
  }

  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  @OkResponse(OkLoginModel)
  @ApiBearerAuth('JWT-Refresh-Token')
  @ApiOperation({ summary: 'Refresh the tokens' })
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Req() request: RequestWithUser,
    @Res() response: Response,
  ) {
    const tokens = await this.authService.refreshTokens(
      request.user.refreshToken,
      request.user['sub'],
    );

    return response.status(HttpStatus.OK).json(tokens);
  }
}
