import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixProductOwnershipToBrallamdel1786710316985 implements MigrationInterface {
  name = 'FixProductOwnershipToBrallamdel1786710316985';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "products" SET "created_by" = (
         SELECT "id" FROM "users" WHERE "email" = 'bralldel@tolla.io' LIMIT 1
       ) WHERE EXISTS (SELECT 1 FROM "users" WHERE "email" = 'bralldel@tolla.io')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "products" SET "created_by" = NULL WHERE "created_by" = (
         SELECT "id" FROM "users" WHERE "email" = 'bralldel@tolla.io' LIMIT 1
       )`,
    );
  }
}
