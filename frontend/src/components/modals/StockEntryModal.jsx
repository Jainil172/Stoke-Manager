import { useEffect, useMemo, useState } from "react";
import { FiArrowDownCircle, FiArrowUpCircle, FiChevronDown, FiSave } from "react-icons/fi";
import Modal from "../common/Modal.jsx";
import Input from "../ui/Input.jsx";
import Textarea from "../ui/Textarea.jsx";
import Button from "../ui/Button.jsx";
import Dropdown from "../ui/Dropdown.jsx";
import { showToast } from "../common/Toast.jsx";
import { useData } from "../../context/DataContext.jsx";
import { validateRequired } from "../../utils/validators.js";
import { cn } from "../../utils/cn.js";

export default function StockEntryModal({ open, onClose, type = "in" }) {
  const { products, addStockIn, addStockOut } = useData();
  const isInbound = type === "in";

  const [values, setValues] = useState({
    product: null,
    party: "",
    quantity: "",
    reference: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === values.product?.value),
    [products, values.product]
  );

  useEffect(() => {
    if (!open) return;
    setValues({ product: null, party: "", quantity: "", reference: "", notes: "" });
    setErrors({});
  }, [open]);

  const resetAndClose = () => {
    setValues({ product: null, party: "", quantity: "", reference: "", notes: "" });
    setErrors({});
    onClose();
  };

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      product: values.product ? null : "Please choose a product.",
      party: validateRequired(values.party, isInbound ? "Supplier" : "Customer"),
      quantity: validateRequired(values.quantity, "Quantity"),
      reference: validateRequired(values.reference, isInbound ? "PO reference" : "Invoice"),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      const quantity = Number(values.quantity) || 0;
      const entry = {
        productId: values.product.value,
        quantity,
        date: Date.now(),
        reference: values.reference.trim().toUpperCase(),
        notes: values.notes.trim(),
      };

      if (isInbound) {
        await addStockIn({
          ...entry,
          supplier: selectedProduct?.supplier ?? values.party.trim(),
        });
        showToast.success(`${quantity} units received for ${values.product.label}`);
      } else {
        await addStockOut({
          ...entry,
          customer: values.party.trim(),
          invoice: entry.reference,
        });
        showToast.success(`${quantity} units dispatched to ${values.party.trim()}`);
      }
      resetAndClose();
    } catch (error) {
      showToast.error(error.message || "Could not record the stock movement.");
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
      title={isInbound ? "Record Stock In" : "Record Stock Out"}
      subtitle={
        isInbound
          ? "Receive stock from a supplier"
          : "Dispatch stock to a customer or channel"
      }
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium text-muted">Product</p>
          <Dropdown
            width="w-full"
            align="left"
            trigger={
              <span className={triggerClass(errors.product)}>
                {values.product?.label ?? "Select product"}
                <FiChevronDown size={15} className="text-muted" />
              </span>
            }
            items={products.map((product) => ({
              key: `product-${product.id}`,
              label: `${product.name} · ${product.stock} in stock`,
              onClick: () => {
                setValues((prev) => ({
                  ...prev,
                  product: { label: product.name, value: product.id },
                  party: isInbound ? product.supplier : prev.party,
                }));
                setErrors((prev) => ({ ...prev, product: null }));
              },
            }))}
          />
          {errors.product && <p className="mt-2 text-xs font-medium text-danger">{errors.product}</p>}
        </div>

        <Input
          label={isInbound ? "Supplier" : "Customer"}
          placeholder={isInbound ? "e.g. TechNova Distributors" : "e.g. Northwind Goods"}
          value={values.party}
          onChange={handleChange("party")}
          error={errors.party}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Quantity"
            type="number"
            min="1"
            placeholder="50"
            value={values.quantity}
            onChange={handleChange("quantity")}
            error={errors.quantity}
          />
          <Input
            label={isInbound ? "PO reference" : "Invoice number"}
            placeholder={isInbound ? "PO-2301" : "INV-3100"}
            value={values.reference}
            onChange={handleChange("reference")}
            error={errors.reference}
          />
        </div>

        <Textarea
          label="Notes"
          rows={2}
          placeholder="Optional notes…"
          value={values.notes}
          onChange={handleChange("notes")}
        />

        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={saving}
            leftIcon={isInbound ? FiArrowDownCircle : FiArrowUpCircle}
          >
            {isInbound ? "Receive Stock" : "Dispatch Stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
