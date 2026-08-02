import { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiChevronUp, FiInbox } from "react-icons/fi";
import Pagination from "../common/Pagination.jsx";
import Skeleton from "../ui/Skeleton.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import { cn } from "../../utils/cn.js";

export default function DataTable({
  columns,
  data,
  keyField = "id",
  loading = false,
  emptyMessage = "No records found.",
  itemsPerPage = 8,
  showPagination = true,
  skeletonRows = 6,
  className,
  sortKey,
  sortDir,
  onSortChange,
  defaultSortKey,
  defaultSortDir = "asc",
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [internalSortKey, setInternalSortKey] = useState(defaultSortKey);
  const [internalSortDir, setInternalSortDir] = useState(defaultSortDir);

  const activeSortKey = sortKey !== undefined ? sortKey : internalSortKey;
  const activeSortDir = sortDir !== undefined ? sortDir : internalSortDir;

  useEffect(() => {
    setCurrentPage(1);
  }, [data, itemsPerPage]);

  const sortedData = useMemo(() => {
    if (!activeSortKey) return data;
    const column = columns.find((item) => item.key === activeSortKey);
    if (!column?.sortable) return data;

    const getValue = (row) => {
      if (column.sortValue) return column.sortValue(row);
      return row[activeSortKey];
    };

    return [...data].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      let result = 0;
      if (typeof av === "number" && typeof bv === "number") {
        result = av - bv;
      } else {
        result = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }
      return activeSortDir === "asc" ? result : -result;
    });
  }, [data, columns, activeSortKey, activeSortDir]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const pageData = useMemo(() => {
    if (loading) return [];
    const start = (safePage - 1) * itemsPerPage;
    return sortedData.slice(start, start + itemsPerPage);
  }, [sortedData, loading, safePage, itemsPerPage]);

  const handleSort = (column) => {
    if (!column.sortable) return;
    const nextDir = activeSortKey === column.key && activeSortDir === "asc" ? "desc" : "asc";
    if (onSortChange) {
      onSortChange(column.key, nextDir);
    } else {
      setInternalSortKey(column.key);
      setInternalSortDir(nextDir);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: skeletonRows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-xl bg-white/[0.02] p-4">
            {columns.map((column) => (
              <Skeleton
                key={column.key}
                className={cn("h-4", index === 0 ? "w-1/4" : "flex-1")}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (sortedData.length === 0) {
    return <EmptyState icon={FiInbox} title="No results" description={emptyMessage} />;
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((column) => {
                const isActive = activeSortKey === column.key;
                return (
                  <th
                    key={column.key}
                    className={cn(
                      "px-4 py-3 text-xs font-semibold tracking-wider text-muted uppercase",
                      column.align === "right" && "text-right",
                      column.hideOnMobile && "hidden md:table-cell",
                      column.sortable && "cursor-pointer select-none"
                    )}
                    onClick={() => handleSort(column)}
                  >
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        column.align === "right" && "flex-row-reverse",
                        isActive && "text-primary"
                      )}
                    >
                      {column.header}
                      {column.sortable && (
                        <span className="flex flex-col leading-none">
                          <FiChevronUp
                            className={cn(
                              "h-2.5 w-2.5 -mb-0.5",
                              isActive && activeSortDir === "asc" ? "text-primary" : "text-white/25"
                            )}
                          />
                          <FiChevronDown
                            className={cn(
                              "h-2.5 w-2.5 -mt-0.5",
                              isActive && activeSortDir === "desc" ? "text-primary" : "text-white/25"
                            )}
                          />
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {pageData.map((row) => (
              <tr
                key={row[keyField]}
                className="transition-colors duration-150 hover:bg-white/[0.02]"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-4 py-3.5 text-sm",
                      column.align === "right" && "text-right",
                      column.hideOnMobile && "hidden md:table-cell"
                    )}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && sortedData.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={sortedData.length}
          pageSize={itemsPerPage}
          className="mt-4"
        />
      )}
    </div>
  );
}
