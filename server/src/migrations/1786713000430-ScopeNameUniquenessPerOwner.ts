import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScopeNameUniquenessPerOwner1786713000430 implements MigrationInterface {
  name = 'ScopeNameUniquenessPerOwner1786713000430';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "UQ_4c9fb58de893725258746385e16"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_products_name_created_by" ON "products" ("name", "created_by")`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_categories_name_created_by" ON "categories" ("name", "created_by")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_categories_name_created_by"`);
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name")`,
    );
    await queryRunner.query(`DROP INDEX "UQ_products_name_created_by"`);
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "UQ_4c9fb58de893725258746385e16" UNIQUE ("name")`,
    );
  }
}
