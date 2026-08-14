import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImagesRepository: Repository<ProductImage>,
    private readonly categoriesService: CategoriesService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(query: QueryProductDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.search) {
      qb.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search)',
        {
          search: `%${query.search}%`,
        },
      );
    }

    if (query.categoryId) {
      qb.andWhere('product.categoryId = :categoryId', {
        categoryId: query.categoryId,
      });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    await this.categoriesService.findOne(dto.categoryId);
    await this.assertNameNotTaken(dto.name);

    const providedImages = dto.images ?? [];
    const images =
      providedImages.length > 0
        ? providedImages.map((url, index) =>
            this.productImagesRepository.create({ url, order: index }),
          )
        : [
            this.productImagesRepository.create({
              url: await this.buildAutoImageUrl(dto.name),
              order: 0,
            }),
          ];

    const product = this.productsRepository.create({
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      stock: dto.stock,
      categoryId: dto.categoryId,
      images,
    });

    const saved = await this.productsRepository.save(product);
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      await this.categoriesService.findOne(dto.categoryId);
    }

    if (dto.name && dto.name.toLowerCase() !== product.name.toLowerCase()) {
      await this.assertNameNotTaken(dto.name);
    }

    const { images, ...rest } = dto;
    Object.assign(product, rest);

    if (images) {
      await this.productImagesRepository.delete({ productId: id });
      product.images = images.map((url, index) =>
        this.productImagesRepository.create({ url, order: index }),
      );
    }

    await this.productsRepository.save(product);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  private async assertNameNotTaken(name: string): Promise<void> {
    const existing = await this.productsRepository.findOne({
      where: { name: ILike(name) },
    });
    if (existing) {
      throw new ConflictException('Ya existe un producto con este nombre');
    }
  }

  private async buildAutoImageUrl(name: string): Promise<string> {
    const keywords = this.extractKeywords(name);
    const apiKey = this.configService.get<string>('PEXELS_API_KEY');

    if (apiKey) {
      const pexelsUrl = await this.searchPexelsImage(
        keywords.join(' '),
        apiKey,
      );
      if (pexelsUrl) {
        return pexelsUrl;
      }
    }

    const tag = keywords.join(',') || 'product';
    return `https://loremflickr.com/640/480/${tag}`;
  }

  private async searchPexelsImage(
    query: string,
    apiKey: string,
  ): Promise<string | null> {
    try {
      const endpoint = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;
      const response = await fetch(endpoint, {
        headers: { Authorization: apiKey },
      });
      if (!response.ok) {
        return null;
      }
      const data = (await response.json()) as {
        photos?: Array<{ src?: { large?: string; medium?: string } }>;
      };
      const photo = data.photos?.[0];
      return photo?.src?.large ?? photo?.src?.medium ?? null;
    } catch {
      return null;
    }
  }

  private extractKeywords(name: string): string[] {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter((token) => token.length >= 2 && !/^\d+$/.test(token))
      .slice(0, 3);
  }
}
