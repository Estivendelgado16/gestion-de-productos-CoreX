import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductCreatedBy1786710133693 implements MigrationInterface {
  name = 'AddProductCreatedBy1786710133693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD "created_by" uuid`);

    await queryRunner.query(
      `UPDATE "products" SET "created_by" = (
         SELECT "id" FROM "users"
         WHERE "role" = 'admin'
         ORDER BY "created_at" ASC
         LIMIT 1
       ) WHERE "created_by" IS NULL
         AND EXISTS (SELECT 1 FROM "users" WHERE "role" = 'admin')`,
    );

    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_products_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_products_created_by"`,
    );
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "created_by"`);
  }
}
