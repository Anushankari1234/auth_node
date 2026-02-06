import { AppDataSource } from "../data-source"
import { File } from "../models/File";

export const fileRepo = AppDataSource.getRepository(File);

export const saveFile = (data: Partial<File>) =>
  fileRepo.save(data);

export const findFileById = (id: number) =>
  fileRepo.findOne({
    where: { id },
    relations: ["user"],
  });
