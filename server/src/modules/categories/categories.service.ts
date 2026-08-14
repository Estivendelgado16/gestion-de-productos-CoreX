import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '../users/enums/user-role.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(user?: JwtPayload | null): Promise<Category[]> {
    const where =
      user?.role === UserRole.ADMIN ? { createdById: user.sub } : {};
    return this.categoriesRepository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, user?: JwtPayload | null): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    if (user?.role === UserRole.ADMIN && category.createdById !== user.sub) {
      throw new NotFoundException('Categoría no encontrada');
    }
    return category;
  }

  async create(dto: CreateCategoryDto, creatorId: string): Promise<Category> {
    await this.assertNameNotTaken(dto.name, creatorId);
    const category = this.categoriesRepository.create({
      ...dto,
      createdById: creatorId,
    });
    return this.categoriesRepository.save(category);
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    user: JwtPayload,
  ): Promise<Category> {
    const category = await this.findOne(id);
    this.assertOwner(category, user);

    if (dto.name && dto.name.toLowerCase() !== category.name.toLowerCase()) {
      await this.assertNameNotTaken(dto.name, category.createdById);
    }

    Object.assign(category, dto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string, user: JwtPayload): Promise<void> {
    const category = await this.findOne(id);
    this.assertOwner(category, user);
    await this.categoriesRepository.remove(category);
  }

  private assertOwner(category: Category, user: JwtPayload): void {
    if (user.role === UserRole.ADMIN && category.createdById !== user.sub) {
      throw new ForbiddenException(
        'No puedes modificar categorías creadas por otro administrador',
      );
    }
  }

  private async assertNameNotTaken(
    name: string,
    ownerId: string | null,
  ): Promise<void> {
    const existing = await this.categoriesRepository.findOne({
      where: ownerId
        ? { name: ILike(name), createdById: ownerId }
        : { name: ILike(name), createdById: IsNull() },
    });
    if (existing) {
      throw new ConflictException(
        'Ya existe una categoría con este nombre en tu perfil',
      );
    }
  }
}
