import { useEffect, useState } from "react";
import { FiChevronDown, FiPackage, FiSave } from "react-icons/fi";
import Modal from "../common/Modal.jsx";
import Input from "../ui/Input.jsx";
import Textarea from "../ui/Textarea.jsx";
import Button from "../ui/Button.jsx";
import Dropdown from "../ui/Dropdown.jsx";
import ImageUploadBox from "../ui/ImageUploadBox.jsx";
import { showToast } from "../common/Toast.jsx";
import { useData } from "../../context/DataContext.jsx";
import { validateRequired } from "../../utils/validators.js";
import { getStockStatus } from "../../utils/format.js";
import { cn } from "../../utils/cn.js";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  supplier: "",
  purchasePrice: "",
  price: "",
  stock: "",
  minStock: "",
  description: "",
  image: null,
};

const dataUrlToFile = (dataUrl) => {
  const [meta, base64] = dataUrl.split(",");
  const mime = /^data:(.*?);/i.exec(meta)?.[1] || "image/png";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const extension = mime.split("/")[1]?.replace("jpeg", "jpg") || "png";
  return new File([bytes], `product-image.${extension}`, { type: mime });
};

export default function ProductFormModal({ open, onClose, product = null }) {
  const { products, categories, suppliers, addProduct, updateProduct, uploadProductImage } = useData();
  const isEditing = Boolean(product);

  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (product) {
      setValues({
        name: product.name ?? "",
        sku: product.sku ?? "",
        category: product.category ?? "",
        supplier: product.supplier ?? "",
        purchasePrice: product.purchasePrice ?? "",
        price: product.price ?? "",
        stock: product.stock ?? "",
        minStock: product.minStock ?? "",
        description: product.description ?? "",
        image: product.image ?? null,
      });
    } else {
      setValues(emptyForm);
    }
    setErrors({});
  }, [open, product]);

  const resetAndClose = () => {
    setValues(emptyForm);
    setErrors({});
    onClose();
  };

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const pickFromList = (field) => (option) => {
    setValues((prev) => ({ ...prev, [field]: option.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      name: validateRequired(values.name, "Product name"),
      sku: validateRequired(values.sku, "SKU"),
      category: validateRequired(values.category, "Category"),
      supplier: validateRequired(values.supplier, "Supplier"),
      price: validateRequired(values.price, "Price"),
      stock: validateRequired(values.stock, "Stock"),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      const stock = Number(values.stock) || 0;
      const minStock = Number(values.minStock) || 0;
      const isDataUrl = typeof values.image === "string" && values.image.startsWith("data:image/");
      const payload = {
        name: values.name.trim(),
        sku: values.sku.trim().toUpperCase(),
        category: values.category,
        supplier: values.supplier,
        purchasePrice: Number(values.purchasePrice) || 0,
        price: Number(values.price) || 0,
        stock,
        minStock,
        description: values.description.trim(),
        ...(isDataUrl ? { image: null } : { image: values.image }),
        status: getStockStatus(stock, minStock),
        color: product?.color ?? "from-blue-500 to-indigo-600",
      };

      const saved = isEditing
        ? await updateProduct(product.id, payload)
        : await addProduct(payload);

      if (isDataUrl) {
        await uploadProductImage(saved.id, dataUrlToFile(values.image));
      }

      showToast.success(
        isEditing ? `${payload.name} was updated` : `${payload.name} was added to your catalog`
      );
      resetAndClose();
    } catch (error) {
      showToast.error(error.message || "Could not save the product.");
    } finally {
      setSaving(false);
    }
  };

  const triggerClass = (hasError) =>
    cn(
      "flex h-11 w-full items-center justify-between rounded-xl border bg-white/[0.03] px-4 text-sm transition-all duration-200",
      hasError ? "border-danger/60 text-muted" : "border-white/10 text-white"
    );

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title={isEditing ? "Edit Product" : "Add Product"}
      subtitle={isEditing ? "Update the product details below" : "Create a new product in your catalog"}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
          <ImageUploadBox
            value={values.image}
            onChange={(image) => setValues((prev) => ({ ...prev, image }))}
          />
          <div className="space-y-4">
            <Input label="SKU" placeholder="SF-2001" value={values.sku} onChange={handleChange("sku")} error={errors.sku} />
            <Input
              label="Stock quantity"
              type="number"
              min="0"
              placeholder="100"
              value={values.stock}
              onChange={handleChange("stock")}
              error={errors.stock}
            />
            <Input
              label="Reorder point"
              type="number"
              min="0"
              placeholder="40"
              value={values.minStock}
              onChange={handleChange("minStock")}
            />
          </div>
        </div>

        <Input
          label="Product name"
          placeholder="e.g. Wireless Mouse Pro"
          icon={FiPackage}
          value={values.name}
          onChange={handleChange("name")}
          error={errors.name}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-muted">Category</p>
            <Dropdown
              width="w-full"
              align="left"
              trigger={
                <span className={triggerClass(errors.category)}>
                  {values.category || "Select category"}
                  <FiChevronDown size={15} className="text-muted" />
                </span>
              }
              items={categories.map((category) => ({
                key: `category-${category.id}`,
                label: category.name,
                onClick: () => pickFromList("category")({ value: category.name }),
              }))}
            />
            {errors.category && <p className="mt-2 text-xs font-medium text-danger">{errors.category}</p>}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-muted">Supplier</p>
            <Dropdown
              width="w-full"
              align="left"
              trigger={
                <span className={triggerClass(errors.supplier)}>
                  {values.supplier || "Select supplier"}
                  <FiChevronDown size={15} className="text-muted" />
                </span>
              }
              items={suppliers.map((supplier) => ({
                key: `supplier-${supplier.id}`,
                label: supplier.company,
                onClick: () => pickFromList("supplier")({ value: supplier.company }),
              }))}
            />
            {errors.supplier && <p className="mt-2 text-xs font-medium text-danger">{errors.supplier}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Cost price (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="29.99"
            value={values.purchasePrice}
            onChange={handleChange("purchasePrice")}
          />
          <Input
            label="Selling price (₹)"
            type="number"
            min="0"
            step="0.01"
            placeholder="49.99"
            value={values.price}
            onChange={handleChange("price")}
            error={errors.price}
          />
        </div>

        <Textarea
          label="Description"
          rows={3}
          placeholder="Short product description…"
          value={values.description}
          onChange={handleChange("description")}
        />

        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} leftIcon={FiSave}>
            {isEditing ? "Save Changes" : "Add Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
