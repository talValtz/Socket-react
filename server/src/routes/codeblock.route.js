import express from "express";
import { getAllCodeBlocks, getCodeBlockById } from "../controllers/codeblock.controller.js";

const router = express.Router();

router.get("/", getAllCodeBlocks);
router.get("/:id", getCodeBlockById);

export default router;
