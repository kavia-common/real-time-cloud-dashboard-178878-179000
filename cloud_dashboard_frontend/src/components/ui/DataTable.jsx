import React, { useMemo, useState } from 'react';
import '../../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * DataTable with client-side sorting and pagination, Ocean Professional themed.
 * Props:
 * - columns: [{ header, accessor, key?, render?(row), sortable? }]
 * - rows: array of objects
 * - keyField: unique field in row (default 'id')
 * - className: additional wrapper classes
 * - pageSizeOptions: number[] (default [5, 10, 20])
 * - initialPageSize: number (default 10)
 * - onSortChange?: (sortBy, direction) => void
 * - optimistic?: { pendingIds?: Set<string>, errorIds?: Set<string> }
 */
export default function DataTable({
  columns = [],
  rows = [],
  keyField = 'id',
  className = '',
  pageSizeOptions = [5, 10, 20],
  initialPageSize = 10,
  onSortChange,
  optimistic,
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Sorting
  const sortedRows = useMemo(() => {
    if (!sortBy) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortBy];
      const bv = b[sortBy];
      if (av == null && bv == null) return 0;
      if (av == null) return sortDir === 'asc' ? -1 : 1;
      if (bv == null) return sortDir === 'asc' ? 1 : -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return sortDir === 'asc' ? -1 : 1;
      if (as > bs) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [rows, sortBy, sortDir]);

  // Pagination
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pagedRows = useMemo(() => {
    const start = currentPage * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  function toggleSort(accessor, sortable) {
    if (!sortable) return;
    if (sortBy !== accessor) {
      setSortBy(accessor);
      setSortDir('asc');
      setPage(0);
      onSortChange && onSortChange(accessor, 'asc');
    } else {
      const next = sortDir === 'asc' ? 'desc' : 'asc';
      setSortDir(next);
      setPage(0);
      onSortChange && onSortChange(accessor, next);
    }
  }

  return (
    <div className={`card table ${className}`.trim()}>
      <table className="table-el">
        <thead>
          <tr>
            {columns.map((c) => {
              const isSorted = sortBy === c.accessor;
              const sortable = c.sortable !== false && !!c.accessor;
              return (
                <th
                  key={c.key || c.accessor || c.header}
                  onClick={() => toggleSort(c.accessor, sortable)}
                  style={{ cursor: sortable ? 'pointer' : 'default', userSelect: 'none' }}
                  aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span>{c.header}</span>
                    {sortable && (
                      <span className="muted" aria-hidden>
                        {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {pagedRows.length ? (
            pagedRows.map((r) => {
              const key = r[keyField] ?? JSON.stringify(r);
              const isPending = optimistic?.pendingIds?.has?.(r[keyField]);
              const isError = optimistic?.errorIds?.has?.(r[keyField]);
              return (
                <tr key={key} className={`${isPending ? 'row-pending' : ''} ${isError ? 'row-error' : ''}`.trim()}>
                  {columns.map((c) => (
                    <td key={c.key || c.accessor || c.header}>
                      {c.render ? c.render(r) : r[c.accessor]}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length} className="muted center">No data</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="table-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
        <div className="muted small">Rows: {rows.length}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn ghost" onClick={() => setPage(0)} disabled={currentPage === 0}>{'⏮'}</button>
          <button className="btn ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}>{'◀'}</button>
          <span className="small">Page {currentPage + 1} / {pageCount}</span>
          <button className="btn ghost" onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))} disabled={currentPage >= pageCount - 1}>{'▶'}</button>
          <button className="btn ghost" onClick={() => setPage(pageCount - 1)} disabled={currentPage >= pageCount - 1}>{'⏭'}</button>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt} / page</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
