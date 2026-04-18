import express from "express";

import {
    createContent,
    getAllContent,
    getContentById,
    updateContent,
    submitContent,
    rejectContent,
    approveContent,
    getAvailableActionsController
} from "../controllers/content.controller.js"

const router = express.Router();

router.post("/", createContent);
router.get("/", getAllContent);
router.get("/:id", getContentById);
router.put("/:id", updateContent);
router.post("/:id/submit", submitContent);
router.post("/:id/approve", approveContent);
router.post("/:id/reject", rejectContent);
router.get("/:id/actions", getAvailableActionsController);

export default router;