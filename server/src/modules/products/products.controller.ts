import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Productos')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar productos (público)',
    description:
      'Soporta paginación (page, limit), filtro por categoría (categoryId) y búsqueda de texto (search) sobre nombre y descripción. Si el token pertenece a un administrador, solo devuelve los productos que ese admin creó; para usuarios o visitantes devuelve todos.',
  })
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Query() query: QueryProductDto, @CurrentUser() user?: JwtPayload) {
    return this.productsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un producto (público)' })
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.productsService.findOne(id, user);
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear un producto (requiere rol admin)' })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: JwtPayload) {
    return this.productsService.create(dto, user.sub);
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar un producto (requiere rol admin)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.update(id, dto, user);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un producto (requiere rol admin)' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.productsService.remove(id, user);
  }
}
