import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api.js";
import {
  mapProduct,
  mapCategory,
  mapSupplier,
  mapLog,
  mapDashboard,
  toProductPayload,
  toCategoryPayload,
  toSupplierPayload,
  extractApiError,
} from "../services/apiMapper.js";

const DataContext = createContext(null);

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

const initialData = () => ({
  products: [],
  categories: [],
  suppliers: [],
  stockInHistory: [],
  stockOutHistory: [],
  stockAdjustments: [],
  loading: true,
});

export function DataProvider({ children }) {
  const [data, setData] = useState(initialData);
  const stateRef = useRef(data);
  stateRef.current = data;

  const fetchAll = useCallback(async () => {
    const [productsRes, categoriesRes, suppliersRes, historyRes] = await Promise.all([
      api.get("/products", { params: { limit: 100 } }),
      api.get("/categories", { params: { limit: 100 } }),
      api.get("/suppliers", { params: { limit: 100 } }),
      api.get("/inventory/history", { params: { limit: 100 } }),
    ]);
    const products = productsRes.data.data.items.map(mapProduct);
    const categories = categoriesRes.data.data.items.map(mapCategory);
    const suppliers = suppliersRes.data.data.items.map(mapSupplier);
    const stockInHistory = historyRes.data.data.items
      .filter((log) => log.type === "stock-in")
      .map((log) => mapLog(log, products));
    const stockOutHistory = historyRes.data.data.items
      .filter((log) => log.type === "stock-out")
      .map((log) => mapLog(log, products));
    return { products, categories, suppliers, stockInHistory, stockOutHistory };
  }, []);

  const refresh = useCallback(async () => {
    const next = await fetchAll();
    setData((prev) => ({ ...prev, ...next, stockAdjustments: prev.stockAdjustments }));
    return next;
  }, [fetchAll]);

  const load = useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, [refresh]);

  useEffect(() => {
    load();
  }, [load]);

  const addProduct = useCallback(async (product) => {
    const { categories, suppliers } = stateRef.current;
    try {
      const { data: response } = await api.post("/products", toProductPayload(product, { categories, suppliers }));
      const created = mapProduct(response.data);
      setData((prev) => ({ ...prev, products: [created, ...prev.products] }));
      return created;
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const updateProduct = useCallback(async (id, changes) => {
    const { categories, suppliers } = stateRef.current;
    try {
      const { data: response } = await api.put(`/products/${id}`, toProductPayload(changes, { categories, suppliers }));
      const updated = mapProduct(response.data);
      setData((prev) => ({
        ...prev,
        products: prev.products.map((item) => (item.id === updated.id ? updated : item)),
      }));
      return updated;
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const uploadProductImage = useCallback(async (id, file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const { data: response } = await api.post(`/products/${id}/image`, formData);
      const updated = mapProduct(response.data);
      setData((prev) => ({
        ...prev,
        products: prev.products.map((item) => (item.id === updated.id ? updated : item)),
      }));
      return updated;
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setData((prev) => ({
        ...prev,
        products: prev.products.filter((item) => item.id !== id),
        stockInHistory: prev.stockInHistory.filter((entry) => entry.productId !== id),
        stockOutHistory: prev.stockOutHistory.filter((entry) => entry.productId !== id),
        stockAdjustments: prev.stockAdjustments.filter((entry) => entry.productId !== id),
      }));
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const addCategory = useCallback(async (category) => {
    try {
      const { data: response } = await api.post("/categories", toCategoryPayload(category));
      const created = mapCategory(response.data);
      setData((prev) => ({ ...prev, categories: [...prev.categories, created] }));
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const updateCategory = useCallback(async (id, changes) => {
    try {
      const { data: response } = await api.put(`/categories/${id}`, toCategoryPayload(changes));
      const updated = mapCategory(response.data);
      setData((prev) => ({
        ...prev,
        categories: prev.categories.map((item) => (item.id === updated.id ? updated : item)),
      }));
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      const next = await fetchAll();
      setData((prev) => ({ ...prev, ...next, stockAdjustments: prev.stockAdjustments }));
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, [fetchAll]);

  const addSupplier = useCallback(async (supplier) => {
    try {
      const { data: response } = await api.post("/suppliers", toSupplierPayload(supplier));
      const created = mapSupplier(response.data);
      setData((prev) => ({ ...prev, suppliers: [...prev.suppliers, created] }));
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const updateSupplier = useCallback(async (id, changes) => {
    try {
      const { data: response } = await api.put(`/suppliers/${id}`, toSupplierPayload(changes));
      const updated = mapSupplier(response.data);
      setData((prev) => ({
        ...prev,
        suppliers: prev.suppliers.map((item) => (item.id === updated.id ? updated : item)),
      }));
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const deleteSupplier = useCallback(async (id) => {
    try {
      await api.delete(`/suppliers/${id}`);
      const next = await fetchAll();
      setData((prev) => ({ ...prev, ...next, stockAdjustments: prev.stockAdjustments }));
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, [fetchAll]);

  const applyStockMovement = useCallback((prev, { log, product }) => {
    const mappedLog = mapLog(log, prev.products);
    const mappedProduct = mapProduct(product);
    const collection = mappedLog.customer !== undefined ? "stockOutHistory" : "stockInHistory";
    return {
      ...prev,
      products: prev.products.map((item) => (item.id === mappedProduct.id ? mappedProduct : item)),
      [collection]: [mappedLog, ...prev[collection]],
    };
  }, []);

  const addStockIn = useCallback(async (entry) => {
    try {
      const { data: response } = await api.post("/inventory/stock-in", {
        productId: entry.productId,
        quantity: entry.quantity,
        supplier: entry.supplier,
        referenceNumber: entry.reference,
        notes: entry.notes,
      });
      setData((prev) => applyStockMovement(prev, response.data));
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, [applyStockMovement]);

  const addStockOut = useCallback(async (entry) => {
    try {
      const { data: response } = await api.post("/inventory/stock-out", {
        productId: entry.productId,
        quantity: entry.quantity,
        customer: entry.customer,
        referenceNumber: entry.reference,
        notes: entry.notes,
      });
      setData((prev) => applyStockMovement(prev, response.data));
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, [applyStockMovement]);

  const addAdjustment = useCallback((entry) => {
    setData((prev) => ({
      ...prev,
      stockAdjustments: [{ id: Date.now(), user: "You", ...entry }, ...prev.stockAdjustments],
      products: prev.products.map((item) => {
        if (item.id !== entry.productId) return item;
        const stock = Math.max(0, item.stock + (Number(entry.quantity) || 0));
        return { ...item, stock };
      }),
    }));
  }, []);

  const resetData = useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, [refresh]);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data: response } = await api.get("/dashboard");
      return mapDashboard(response.data);
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const { data: response } = await api.get("/dashboard/analytics");
      return response.data;
    } catch (error) {
      throw new Error(extractApiError(error, FALLBACK_MESSAGE));
    }
  }, []);

  const value = useMemo(
    () => ({
      ...data,
      addProduct,
      updateProduct,
      deleteProduct,
      uploadProductImage,
      addCategory,
      updateCategory,
      deleteCategory,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addStockIn,
      addStockOut,
      addAdjustment,
      resetData,
      fetchDashboard,
      fetchAnalytics,
    }),
    [
      data,
      addProduct,
      updateProduct,
      deleteProduct,
      uploadProductImage,
      addCategory,
      updateCategory,
      deleteCategory,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addStockIn,
      addStockOut,
      addAdjustment,
      resetData,
      fetchDashboard,
      fetchAnalytics,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
