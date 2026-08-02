import { useMemo, useState } from "react";
import { FiEdit2, FiMail, FiMapPin, FiPhone, FiPlus, FiStar, FiTrash2, FiTruck } from "react-icons/fi";
import PageHeader from "../../components/common/PageHeader.jsx";
import Card from "../../components/common/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import Badge from "../../components/ui/Badge.jsx";
import SearchBar from "../../components/ui/SearchBar.jsx";
import DataTable from "../../components/tables/DataTable.jsx";
import ActionMenu from "../../components/ui/ActionMenu.jsx";
import SupplierFormModal from "../../components/modals/SupplierFormModal.jsx";
import ConfirmationDialog from "../../components/common/ConfirmationDialog.jsx";
import { useData } from "../../context/DataContext.jsx";
import { useDebounce } from "../../hooks/useDebounce.js";
import { showToast } from "../../components/common/Toast.jsx";
import { cn } from "../../utils/cn.js";

export default function Suppliers() {
  const { suppliers, products, deleteSupplier } = useData();
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);
  const debouncedQuery = useDebounce(query, 200);

  const productCounts = useMemo(() => {
    const map = {};
    products.forEach((product) => {
      map[product.supplier] = (map[product.supplier] ?? 0) + 1;
    });
    return map;
  }, [products]);

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return suppliers;
    return suppliers.filter((supplier) =>
      supplier.company.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      supplier.location.toLowerCase().includes(debouncedQuery.toLowerCase())
    );
  }, [suppliers, debouncedQuery]);

  const openAdd = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };

  const openEdit = (supplier) => {
    setEditingSupplier(supplier);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;
    try {
      await deleteSupplier(deletingSupplier.id);
      showToast.success(`${deletingSupplier.company} was removed from your suppliers`);
    } catch (error) {
      showToast.error(error.message || "Could not delete the supplier.");
    }
    setDeletingSupplier(null);
  };

  const columns = [
    {
      key: "company",
      header: "Company",
      sortable: true,
      render: (supplier) => (
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white",
              supplier.color
            )}
          >
            <FiTruck size={16} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{supplier.company}</p>
            <p className="text-xs text-muted">{supplier.contact}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      hideOnMobile: true,
      render: (supplier) => (
        <div className="space-y-1 text-xs">
          <p className="flex items-center gap-1.5 text-muted">
            <FiMail size={12} />
            {supplier.email}
          </p>
          <p className="flex items-center gap-1.5 text-muted">
            <FiPhone size={12} />
            {supplier.phone}
          </p>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      hideOnMobile: true,
      sortable: true,
      render: (supplier) => (
        <span className="flex items-center gap-1.5 text-muted">
          <FiMapPin size={13} />
          {supplier.location}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      hideOnMobile: true,
      sortable: true,
      sortValue: (supplier) => supplier.rating,
      render: (supplier) => (
        <span className="inline-flex items-center gap-1.5 font-medium text-white">
          <FiStar size={14} className="fill-warning text-warning" />
          {supplier.rating.toFixed(1)}
        </span>
      ),
    },
    {
      key: "products",
      header: "Products",
      align: "right",
      sortable: true,
      sortValue: (supplier) => productCounts[supplier.company] ?? 0,
      render: (supplier) => (
        <span className="text-muted">{productCounts[supplier.company] ?? 0}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      align: "right",
      sortable: true,
      sortValue: (supplier) => supplier.status,
      render: (supplier) => (
        <Badge variant={supplier.status === "active" ? "success" : "neutral"} dot>
          {supplier.status === "active" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (supplier) => (
        <ActionMenu
          items={[
            {
              key: "edit",
              label: "Edit",
              icon: FiEdit2,
              onClick: () => openEdit(supplier),
            },
            {
              key: "delete",
              label: "Delete",
              icon: FiTrash2,
              danger: true,
              onClick: () => setDeletingSupplier(supplier),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle={`${suppliers.length} suppliers in your directory`}
        actions={
          <Button leftIcon={FiPlus} onClick={openAdd}>
            Add Supplier
          </Button>
        }
      />

      <Card>
        <div className="mb-5">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search by company, contact or location..."
            className="w-full sm:max-w-xs"
          />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          defaultSortKey="company"
          emptyMessage="No suppliers match your search."
          itemsPerPage={6}
        />
      </Card>

      <SupplierFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        supplier={editingSupplier}
      />
      <ConfirmationDialog
        open={Boolean(deletingSupplier)}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDelete}
        title="Delete supplier?"
        message={`"${deletingSupplier?.company}" will be permanently removed from your directory.`}
        confirmLabel="Delete Supplier"
        tone="danger"
      />
    </div>
  );
}
