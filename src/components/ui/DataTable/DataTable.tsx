import { useState, useMemo, useDeferredValue } from "react";
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaFileImage,
} from "react-icons/fa";
import { TbSeo } from "react-icons/tb";

export interface TableColumn<T extends object> {
  key: keyof T | "actions";
  label: string;
  sortable?: boolean;
  /* eslint-disable-next-line */
  render?: (value: any, row: T) => React.ReactNode;
}

export interface TableProps<T extends object> {
  data: T[];
  columns: TableColumn<T>[];
  itemsPerPage?: number;
  searchable?: boolean;
  sortable?: boolean;
  total?: number;
  page?: number;
  limit?: number;
  onEdit?: (data: T) => void;
  onDelete?: (id: string) => void;
  onSeo?: (data: T) => void;
  onImage?: (data: T) => void;
}

export default function DataTable<T extends object>({
  data = [],
  columns = [],
  itemsPerPage = 10,
  searchable = true,
  sortable = true,
  total,
  page,
  limit,
  onEdit,
  onDelete,
  onSeo,
  onImage,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  const autoColumns =
    !columns && data.length > 0
      ? Object.keys(data[0] as object).map((key) => ({
          key: key as keyof T,
          label:
            key.charAt(0).toUpperCase() +
            key
              .slice(1)
              .replace(/([A-Z])/g, " $1")
              .trim(),
        }))
      : [];

  const tableColumns = columns || autoColumns;

  const deferredSearchTerm = useDeferredValue(searchTerm);

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const filteredData = useMemo(() => {
    if (!searchable || !deferredSearchTerm.trim()) return safeData;
    const lower = deferredSearchTerm.trim().toLowerCase();
    return safeData.filter((row) =>
      Object.values(row as object).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(lower);
      }),
    );
  }, [safeData, searchable, deferredSearchTerm]);

  const sortedData = useMemo(() => {
    if (!sortable || !sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortable, sortConfig]);

  const isServerSide = total !== undefined;
  const effectiveItemsPerPage = limit || itemsPerPage;
  const effectiveTotal = isServerSide ? total : sortedData.length;
  const totalPages = Math.ceil(effectiveTotal / effectiveItemsPerPage);
  const effectiveCurrentPage = isServerSide ? page || 1 : currentPage;

  const startIndex = (effectiveCurrentPage - 1) * effectiveItemsPerPage;
  const paginatedData = useMemo(() => {
    return isServerSide
      ? sortedData
      : sortedData.slice(startIndex, startIndex + effectiveItemsPerPage);
  }, [isServerSide, sortedData, startIndex, effectiveItemsPerPage]);

  const handleSort = (key: keyof T) => {
    if (!sortable) return;
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  return (
    <div className="w-full">
      {/* Search */}
      {searchable && (
        <div className="mb-4">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-10 pr-10 pl-4 text-sm border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-xl bg-background">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {tableColumns.map((col, index) => (
                <th
                  key={index}
                  onClick={() => col.key != "actions" && handleSort(col.key)}
                  className={`
                                        px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider
                                        ${sortable && col.key !== "actions" ? "cursor-pointer hover:text-foreground" : ""}
                                    `}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortable &&
                      sortConfig.key === col.key &&
                      (sortConfig.direction === "asc" ? (
                        <FaChevronUp className="w-3 h-3" />
                      ) : (
                        <FaChevronDown className="w-3 h-3" />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition-colors">
                  {tableColumns.map(
                    (col, index) =>
                      col.key != "actions" && (
                        <td
                          key={index}
                          className="px-4 py-3 text-sm text-foreground"
                        >
                          {col.render
                            ? col.render(row[col.key as keyof T], row)
                            : (row[
                                col.key as keyof T
                              ] as unknown as React.ReactNode)}
                        </td>
                      ),
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            const id = (row as { _id?: string })._id;
                            if (id) onDelete(id);
                          }}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      )}
                      {onSeo && (
                        <button
                          onClick={() => onSeo(row)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                          <TbSeo className="w-4 h-4" />
                        </button>
                      )}
                      {onImage && (
                        <button
                          onClick={() => onImage(row)}
                          className="p-1.5 rounded-md text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors"
                        >
                          <FaFileImage className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                  key="no-data"
                >
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            عرض {startIndex + 1} إلى{" "}
            {Math.min(
              startIndex +
                (isServerSide ? sortedData.length : effectiveItemsPerPage),
              effectiveTotal,
            )}{" "}
            من {effectiveTotal} نتيجة
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                isServerSide ? null : setCurrentPage((p) => Math.max(1, p - 1))
              }
              disabled={effectiveCurrentPage === 1}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              السابق
            </button>
            <button
              onClick={() =>
                isServerSide
                  ? null
                  : setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={effectiveCurrentPage === totalPages}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg bg-background disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
