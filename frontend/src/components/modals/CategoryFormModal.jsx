import { useEffect, useState } from "react";
import { FiFolder, FiSave } from "react-icons/fi";
import Modal from "../common/Modal.jsx";
import Input from "../ui/Input.jsx";
import Textarea from "../ui/Textarea.jsx";
import Button from "../ui/Button.jsx";
import { showToast } from "../common/Toast.jsx";
import { useData } from "../../context/DataContext.jsx";
import { categoryIconKeys, categoryIconMap, categoryColorPresets } from "../../constants/categoryOptions.js";
import { validateRequired } from "../../utils/validators.js";
import { cn } from "../../utils/cn.js";

const emptyForm = { name: "", description: "", icon: categoryIconKeys[0], color: categoryColorPresets[0] };

export default function CategoryFormModal({ open, onClose, category = null }) {
  const { addCategory, updateCategory } = useData();
  const isEditing = Boolean(category);

  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (category) {
      setValues({
        name: category.name ?? "",
        description: category.description ?? "",
        icon: category.icon ?? categoryIconKeys[0],
        color: categoryColorPresets.find((preset) => preset.hex === category.hex) ?? categoryColorPresets[0],
      });
    } else {
      setValues(emptyForm);
    }
    setErrors({});
  }, [open, category]);

  const resetAndClose = () => {
    setValues(emptyForm);
    setErrors({});
    onClose();
  };

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = { name: validateRequired(values.name, "Category name") };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim(),
        icon: values.icon,
        gradient: values.color.gradient,
        hex: values.color.hex,
        color: values.color.gradient,
      };
      if (isEditing) {
        await updateCategory(category.id, payload);
        showToast.success(`${payload.name} was updated`);
      } else {
        await addCategory(payload);
        showToast.success(`${payload.name} category was created`);
      }
      resetAndClose();
    } catch (error) {
      showToast.error(error.message || "Could not save the category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title={isEditing ? "Edit Category" : "Add Category"}
      subtitle={isEditing ? "Update the category details below" : "Organize your products with a new category"}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Category name"
          placeholder="e.g. Smart Home"
          icon={FiFolder}
          value={values.name}
          onChange={handleChange("name")}
          error={errors.name}
        />
        <Textarea
          label="Description"
          rows={2}
          placeholder="Short description of this category…"
          value={values.description}
          onChange={handleChange("description")}
        />

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Icon</p>
          <div className="flex flex-wrap gap-2">
            {categoryIconKeys.map((key) => {
              const Icon = categoryIconMap[key];
              const active = values.icon === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValues((prev) => ({ ...prev, icon: key }))}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-xl border transition-all duration-200",
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-white"
                  )}
                  aria-label={`Select ${key} icon`}
                >
                  <Icon size={17} />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Color</p>
          <div className="flex flex-wrap gap-2">
            {categoryColorPresets.map((preset) => {
              const active = values.color.hex === preset.hex;
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setValues((prev) => ({ ...prev, color: preset }))}
                  className={cn(
                    "h-9 w-9 rounded-full bg-gradient-to-br transition-transform duration-200",
                    preset.gradient,
                    active && "ring-2 ring-white ring-offset-2 ring-offset-card scale-110"
                  )}
                  aria-label={`Select color ${preset.hex}`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} leftIcon={FiSave}>
            {isEditing ? "Save Changes" : "Add Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
