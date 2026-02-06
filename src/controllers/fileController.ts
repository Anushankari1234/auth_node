import { Router } from "express";
import { Response } from "express";
import {
  createUploadPresignedUrl,
  createViewPresignedUrl,
  uploadFileViaBackend,
} from "../services/fileService";
import { presignUploadSchema } from "../validation/file.validation";
import { AuthRequest } from "../middleware/auth";
import {upload } from "../middleware/upload";


const router = Router();

router.post("/presign-upload", async(req : AuthRequest, res)=>{
   
    const parsed = presignUploadSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json(parsed.error);
    }

    const userId = req.userId; 

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await createUploadPresignedUrl(
        userId,
        parsed.data.mimeType
    );

    res.json(result);
});


router.get("/:id/presign-view", async(req : AuthRequest, res) => {
    
    const userId = req.userId;
    const fileId = Number(req.params.id);

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await createViewPresignedUrl(fileId, userId);
    res.json(result);

});

router.post(
  "/upload",
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File missing" });
    } 

    const result = await uploadFileViaBackend(
      userId,
      req.file.buffer,
      req.file.mimetype
    );

    res.json(result);
  }
);

export default router;
