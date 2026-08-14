import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategoryCreatedBy1786711844932 implements MigrationInterface {
  name = 'AddCategoryCreatedBy1786711844932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "categories" ADD "created_by" uuid`);

    await queryRunner.query(
      `UPDATE "categories" SET "created_by" = (
         SELECT "id" FROM "users" WHERE "email" = 'bralldel@tolla.io' LIMIT 1
       ) WHERE EXISTS (SELECT 1 FROM "users" WHERE "email" = 'bralldel@tolla.io')`,
    );

    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP COLUMN "created_by"`,
    );
  }
}
