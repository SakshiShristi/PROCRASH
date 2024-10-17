import express from "express";
import { updateCategory, saveTimeData, toggleWebsiteCategory, getWebsiteHistory, fetchTimeSpent } from "./controller.js";
const router = express.Router();

router.post("/category", updateCategory);

router.post("/updateCategory", toggleWebsiteCategory);

router.post("/updateData", saveTimeData);

router.post("/fetchTimeSpent", fetchTimeSpent);

router.post("/userdata", getWebsiteHistory);

export default router;