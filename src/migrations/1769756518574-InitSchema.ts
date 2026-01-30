import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1769756518574 implements MigrationInterface {
    name = 'InitSchema1769756518574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "age" integer NOT NULL DEFAULT '18'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "age"`);
    }

}
