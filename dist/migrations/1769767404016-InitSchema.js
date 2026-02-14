"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSchema1769767404016 = void 0;
class InitSchema1769767404016 {
    constructor() {
        this.name = 'InitSchema1769767404016';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "test" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_5417af0062cf987495b611b59c7" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "test"`);
    }
}
exports.InitSchema1769767404016 = InitSchema1769767404016;
