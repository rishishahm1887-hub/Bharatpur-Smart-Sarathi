import express from "express";
import {
    getUsers,
    getUser,
    updateUserRole,
    deleteUser,
} from "../../controllers/admin/users.controller.js";

const router = express.Router();

router.get("/", getUsers);

router.get("/:id", getUser);

router.patch("/:id/role", updateUserRole);

router.delete("/:id", deleteUser);

export default router;