import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateArticleTable1766929089487 implements MigrationInterface {
    name = 'UpdateArticleTable1766929089487'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "favorited"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "favoritesCount"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "favoritesCount" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "favorited" boolean NOT NULL`);
    }

}
