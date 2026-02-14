"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSchema1769756518574 = void 0;
class InitSchema1769756518574 {
    constructor() {
        this.name = 'InitSchema1769756518574';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" ADD "age" integer NOT NULL DEFAULT '18'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "age"`);
    }
}
exports.InitSchema1769756518574 = InitSchema1769756518574;
