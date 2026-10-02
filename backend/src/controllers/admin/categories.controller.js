import Category from "../../models/Category.js";
import Place from "../../models/Place.js";


const createSlug = (name) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

export const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({}).sort({ name: 1 }).lean();

        const categoriesWithCount = await Promise.all(
            categories.map(async (category) => {
                const placeCount = await Place.countDocuments({
                    category: category._id,
                });

                return {
                    ...category,
                    placeCount,
                };
            }),
        );

        return res.json({
            success: true,
            categories: categoriesWithCount,
        });
    } catch (error) {
        console.error("Get categories error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to load categories.",
        });
    }
};


export const createCategory = async (req, res) => {
    try {
        const name = String(req.body.name || "").trim();

        if (!name) {
            return res.status(400).json({
                success: false,
                error: "Category name is required.",
            });
        }

        const slug = createSlug(name);

        if (!slug) {
            return res.status(400).json({
                success: false,
                error: "Invalid category name.",
            });
        }

        const existing = await Category.findOne({
            $or: [
                {
                    name: {
                        $regex: `^${name}$`,
                        $options: "i",
                    },
                },
                {
                    slug,
                },
            ],
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                error: "Category already exists.",
            });
        }

        const category = await Category.create({
            name,
            slug,
        });

        return res.status(201).json({
            success: true,
            category: {
                ...category.toObject(),
                placeCount: 0,
            },
        });
    } catch (error) {
        console.error("Create category error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: "Category already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to create category.",
        });
    }
};


export const renameCategory = async (req, res) => {
    try {
        const id = req.params.id;

        const newName = String(req.body.name || "").trim();

        if (!id || !newName) {
            return res.status(400).json({
                success: false,
                error: "Category ID and name are required.",
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: "Category not found.",
            });
        }

        const newSlug = createSlug(newName);

        const duplicate = await Category.findOne({
            _id: {
                $ne: category._id,
            },
            $or: [
                {
                    name: {
                        $regex: `^${newName}$`,
                        $options: "i",
                    },
                },
                {
                    slug: newSlug,
                },
            ],
        });

        if (duplicate) {
            return res.status(409).json({
                success: false,
                error: "Another category with this name already exists.",
            });
        }

        category.name = newName;
        category.slug = newSlug;

        await category.save();

        return res.json({
            success: true,
            category,
        });
    } catch (error) {
        console.error("Rename category error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to rename category.",
        });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                error: "Category ID is required.",
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                error: "Category not found.",
            });
        }

        await Place.updateMany(
            {
                category: category._id,
            },
            {
                $pull: {
                    category: category._id,
                },
            },
        );

        await category.deleteOne();

        return res.json({
            success: true,
            message: "Category deleted successfully.",
        });
    } catch (error) {
        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to delete category.",
        });
    }
};
