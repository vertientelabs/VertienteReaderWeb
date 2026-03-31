'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import GlassButton from '@/components/ui/glass-button';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  searchPlaceholder?: string;
  pageSize?: number;
}

export default function DataTable<T>({ data, columns, searchPlaceholder = 'Buscar...', pageSize = 20 }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white/60 dark:bg-[#1e1e1e]/60 backdrop-blur-xl overflow-hidden">
      {/* Search */}
      <div className="p-3 sm:p-4 border-b border-black/[0.06] dark:border-white/10">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          className="
            w-full sm:max-w-sm px-3 sm:px-4 py-2 text-sm
            bg-white/40 dark:bg-white/5
            border border-black/[0.08] dark:border-white/10
            rounded-xl backdrop-blur-sm
            text-[var(--text-primary)]
            placeholder:text-[var(--text-tertiary)]
            outline-none focus:border-[#0A84FF]/50
            transition-all duration-200
          "
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
        <table className="w-full min-w-[600px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-black/[0.06] dark:border-white/10">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer select-none hover:text-[var(--text-primary)] transition-colors whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="text-[var(--text-tertiary)]">
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-black/[0.04] dark:border-white/5 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[var(--text-primary)]">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-black/[0.06] dark:border-white/10">
        <p className="text-[10px] sm:text-xs text-[var(--text-tertiary)]">
          Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} registros
        </p>
        <div className="flex items-center gap-1 sm:gap-2">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Anterior</span>
          </GlassButton>
          <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] px-1 sm:px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            icon={<ChevronRight className="h-4 w-4" />}
          >
            <span className="hidden sm:inline">Siguiente</span>
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
