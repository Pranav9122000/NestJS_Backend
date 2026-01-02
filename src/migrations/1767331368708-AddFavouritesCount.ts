import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavouritesCount1767331368708 implements MigrationInterface {
    name = 'AddFavouritesCount1767331368708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "favoritesCount" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "favoritesCount"`);
    }

}
