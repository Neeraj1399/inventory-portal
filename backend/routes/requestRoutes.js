import express from "express";
import { 
  createRequest, 
  getRequests, 
  getRequest, 
  updateRequestStatus,
  deleteRequest
} from "../controllers/requestController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

// All request routes are protected
router.use(protect);

router
  .route("/")
  .get(getRequests)
  .post(createRequest);

router
  .route("/:id")
  .get(getRequest)
  .patch(restrictTo("ADMIN"), updateRequestStatus)
  .delete(deleteRequest);

export default router;
