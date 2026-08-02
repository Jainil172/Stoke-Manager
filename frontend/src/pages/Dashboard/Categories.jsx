import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import ActionMenu from "../../components/ui/ActionMenu.jsx";
import CategoryFormModal from "../../components/modals/CategoryFormModal.jsx";
import ConfirmationDialog from "../../components/common/ConfirmationDialog.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { showToast } from "../../components/common/Toast.jsx";
import { categoryIconMap } from "../../constants/categoryOptions.js";
import { formatNumber } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

export default function Categories() {
  const { categories, products, deleteCategory } = useData();
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const debouncedQuery = useDebounce(query, 200);

  const totalProducts = Math.max(1, products.length);

  const stats = useMemo(() => {
    const map = {};
    products.forEach((product) => {
      map[product.category] = (map[product.category] ?? 0) + 1;
    });
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [categories, debouncedQuery]);

  const openAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    try {
      await deleteCategory(deletingCategory.id);
      showToast.success(`${deletingCategory.name} category was deleted`);
    } catch (error) {
      showToast.error(error.message || "Could not delete the category.");
    }
    setDeletingCategory(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle={`${categories.length} product categories`}
        actions={
          <Button leftIcon={FiPlus} onClick={openAdd}>
            Add Category
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search categories..."
          className="w-full sm:max-w-xs"
        />
        <p className="text-sm text-muted">{filtered.length} shown</p>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <p className="py-12 text-center text-sm text-muted">No categories match your search.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((category, index) => {
            const Icon = categoryIconMap[category.icon] ?? categoryIconMap.cpu;
            const productCount = stats[category.name] ?? 0;
            const share = Math.max(1, Math.round((productCount / totalProducts) * 100));
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
                whileHover={{ y: -5 }}
              >
                <Card hover className="relative h-full">
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        "grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
                        category.color
                      )}
                    >
                      <Icon size={20} />
                    </span>
                    <ActionMenu
                      items={[
                        {
                          key: "edit",
                          label: "Edit",
                          icon: FiEdit2,
                          onClick: () => openEdit(category),
                        },
                        {
                          key: "delete",
                          label: "Delete",
                          icon: FiTrash2,
                          danger: true,
                          onClick: () => setDeletingCategory(category),
                        },
                      ]}
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-white">{category.name}</h3>
                  <p className="mt-1 text-xs text-muted">{category.description || "No description"}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">{formatNumber(productCount)}</span>
                    <span className="text-xs text-white/40">products</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-medium">
                      <span className="text-muted">Share of catalog</span>
                      <span className="text-white/70">{share}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, share)}%` }}
                        transition={{ duration: 0.7, delay: 0.15 + index * 0.05, ease: "easeOut" }}
                        className={cn("h-full rounded-full bg-gradient-to-r", category.color)}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editingCategory}
      />
      <ConfirmationDialog
        open={Boolean(deletingCategory)}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Delete category?"
        message={`"${deletingCategory?.name}" will be removed. Existing products in this category will not be deleted.`}
        confirmLabel="Delete Category"
        tone="danger"
      />
    </div>
  );
}
