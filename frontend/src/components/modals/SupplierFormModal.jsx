import { useEffect, useState } from "react";
import { FiMail, FiMapPin, FiPhone, FiSave, FiTruck, FiUser } from "react-icons/fi";
import Modal from "../common/Modal.jsx";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import { showToast } from "../common/Toast.jsx";
import { useData } from "../../context/DataContext.jsx";
import { validateEmail, validateRequired } from "../../utils/validators.js";

const emptyForm = { company: "", contact: "", email: "", phone: "", location: "", address: "" };

export default function SupplierFormModal({ open, onClose, supplier = null }) {
  const { addSupplier, updateSupplier } = useData();
  const isEditing = Boolean(supplier);

  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (supplier) {
      setValues({
        company: supplier.company ?? "",
        contact: supplier.contact ?? "",
        email: supplier.email ?? "",
        phone: supplier.phone ?? "",
        location: supplier.location ?? "",
        address: supplier.address ?? "",
      });
    } else {
      setValues(emptyForm);
    }
    setErrors({});
  }, [open, supplier]);

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
    const nextErrors = {
      company: validateRequired(values.company, "Company name"),
      contact: validateRequired(values.contact, "Contact person"),
      email: validateEmail(values.email),
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSaving(true);
    try {
      const payload = {
        company: values.company.trim(),
        contact: values.contact.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        location: values.location.trim(),
        address: values.address.trim(),
        color: supplier?.color ?? "from-blue-500 to-indigo-600",
      };
      if (isEditing) {
        await updateSupplier(supplier.id, payload);
        showToast.success(`${payload.company} was updated`);
      } else {
        await addSupplier(payload);
        showToast.success(`${payload.company} was added to your suppliers`);
      }
      resetAndClose();
    } catch (error) {
      showToast.error(error.message || "Could not save the supplier.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={resetAndClose}
      title={isEditing ? "Edit Supplier" : "Add Supplier"}
      subtitle={isEditing ? "Update the supplier details below" : "Register a new supplier in your directory"}
      size="md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Input
          label="Company name"
          placeholder="e.g. Nordwind Wholesale"
          icon={FiTruck}
          value={values.company}
          onChange={handleChange("company")}
          error={errors.company}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Contact person"
            placeholder="e.g. Alex Rivera"
            icon={FiUser}
            value={values.contact}
            onChange={handleChange("contact")}
            error={errors.contact}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="sales@company.com"
            icon={FiMail}
            value={values.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Phone"
            placeholder="+91 90000 00000"
            icon={FiPhone}
            value={values.phone}
            onChange={handleChange("phone")}
          />
          <Input
            label="Location"
            placeholder="e.g. Austin, US"
            icon={FiMapPin}
            value={values.location}
            onChange={handleChange("location")}
          />
        </div>
        <Input
          label="Address"
          placeholder="Street, city, postal code…"
          icon={FiMapPin}
          value={values.address}
          onChange={handleChange("address")}
        />

        <div className="flex flex-col-reverse gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} leftIcon={FiSave}>
            {isEditing ? "Save Changes" : "Add Supplier"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
