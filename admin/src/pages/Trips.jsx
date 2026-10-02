import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import {
    Tags,
    Plus,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import { apiRequest } from "../lib/api";

const Categories = () => {
    const { getToken } = useAuth();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);

    const loadCategories = async () => {
        try {
            setLoading(true);

            const data = await apiRequest(
                "/admin/categories",
                {},
                getToken
            );

            setCategories(data.categories || []);
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const openCreate = () => {
        setEditing(null);
        setName("");
        setModal(true);
    };

    const openEdit = (category) => {
        setEditing(category.name);
        setName(category.name);
        setModal(true);
    };

    const save = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        try {
            setSaving(true);

            if (editing) {
                await apiRequest(
                    `/admin/categories/${encodeURIComponent(
                        editing
                    )}`,
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            name: name.trim(),
                        }),
                    },
                    getToken
                );
            } else {
                await apiRequest(
                    "/admin/categories",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            name: name.trim(),
                        }),
                    },
                    getToken
                );
            }

            setModal(false);
            await loadCategories();
        } catch (error) {
            alert(error.message);
        } finally {
            setSaving(false);
        }
    };

    const remove = async (category) => {
        if (
            !window.confirm(
                `Remove "${category.name}" from all places?`
            )
        ) {
            return;
        }

        try {
            await apiRequest(
                `/admin/categories/${encodeURIComponent(
                    category.name
                )}`,
                {
                    method: "DELETE",
                },
                getToken
            );

            await loadCategories();
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Categories
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage place categories
                    </p>
                </div>

                <button
                    onClick={openCreate}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            {loading ? (
                <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
                    Loading categories...
                </div>
            ) : categories.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white">
                    <Tags
                        size={40}
                        className="mb-3 text-slate-300"
                    />

                    <p className="font-semibold text-slate-700">
                        No categories found
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                        Categories appear when they are assigned
                        to places.
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.map((category) => (
                        <div
                            key={category.name}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                                    <Tags
                                        size={21}
                                        className="text-blue-600"
                                    />
                                </div>

                                <div className="flex gap-1">
                                    <button
                                        onClick={() =>
                                            openEdit(
                                                category
                                            )
                                        }
                                        className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            remove(category)
                                        }
                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="mt-5 text-lg font-semibold text-slate-800">
                                {category.name}
                            </h3>

                            <p className="mt-1 text-sm text-slate-500">
                                {category.placeCount}{" "}
                                {category.placeCount === 1
                                    ? "place"
                                    : "places"}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h3 className="font-bold text-slate-900">
                                {editing
                                    ? "Rename Category"
                                    : "Add Category"}
                            </h3>

                            <button
                                onClick={() => setModal(false)}
                                className="rounded-lg p-2 hover:bg-slate-100"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form
                            onSubmit={save}
                            className="space-y-5 p-6"
                        >
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Category Name
                                </label>

                                <input
                                    value={name}
                                    onChange={(e) =>
                                        setName(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Nature"
                                    autoFocus
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setModal(false)
                                    }
                                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    disabled={saving}
                                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    {saving
                                        ? "Saving..."
                                        : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;