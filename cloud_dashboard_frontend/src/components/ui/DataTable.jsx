import React, { useMemo, useState } from 'react';
import '../../styles/theme.css';

/**
 * PUBLIC_INTERFACE
 * DataTable with modern styling, density controls, and enhanced UX
 * Props:
 * - columns: [{ header, accessor, key?, render?(row), sortable? }]
 * - rows: array of objects
 * - keyField: unique field in row (default 'id')
 * - className: additional wrapper classes
 * - pageSizeOptions: number[] (default [5, 10, 20, 50])
 * - initialPageSize: number (default 10)
 * - onSortChange?: (sortBy, direction) => void
 * - optimistic?: { pendingIds?: Set<string>, errorIds?: Set<string> }
 * - density?: 'compact' | 'normal' | 'comfortable' (default 'normal')
 */
export default function DataTable({
  columns = [],
  rows = [],
  keyField = 'id',
  className = '',
  pageSizeOptions = [5, 10, 20, 50],
  initialPageSize = 10,
  onSortChange,
  optimistic,
  density: initialDensity = 'normal',
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [density, setDensity] = useState(initialDensity);

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

  const densityPadding = {
    compact: 'var(--spacing-sm)',
    normal: 'var(--spacing-md)',
    comfortable: 'var(--spacing-lg)',
  };

  const tablePadding = densityPadding[density] || densityPadding.normal;

  return (
    <div className={`card table ${className}`.trim()} style={{ overflow: 'hidden' }}>
      {/* Table Controls */}
      <div
        className="table-controls"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-md) var(--spacing-lg)',
          background: 'var(--color-bg-alt)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="muted small">
          Showing {pagedRows.length} of {rows.length} rows
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <span className="muted small">Density:</span>
          <button
            className={`btn ${density === 'compact' ? 'primary' : 'ghost'}`}
            style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
            onClick={() => setDensity('compact')}
            aria-label="Compact density"
            title="Compact"
          >
            ☰
          </button>
          <button
            className={`btn ${density === 'normal' ? 'primary' : 'ghost'}`}
            style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
            onClick={() => setDensity('normal')}
            aria-label="Normal density"
            title="Normal"
          >
            ≡
          </button>
          <button
            className={`btn ${density === 'comfortable' ? 'primary' : 'ghost'}`}
            style={{ padding: '4px 8px', fontSize: 'var(--font-size-xs)' }}
            onClick={() => setDensity('comfortable')}
            aria-label="Comfortable density"
            title="Comfortable"
          >
            ▤
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
        <table className="table-el" role="table">
          <thead>
            <tr role="row">
              {columns.map((c) => {
                const isSorted = sortBy === c.accessor;
                const sortable = c.sortable !== false && !!c.accessor;
                return (
                  <th
                    key={c.key || c.accessor || c.header}
                    onClick={() => toggleSort(c.accessor, sortable)}
                    style={{
                      cursor: sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      padding: tablePadding,
                    }}
                    aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                    role="columnheader"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{c.header}</span>
                      {sortable && (
                        <span
                          className="muted"
                          style={{
                            fontSize: 'var(--font-size-xs)',
                            opacity: isSorted ? 1 : 0.4,
                            transition: 'opacity var(--transition-fast)',
                          }}
                          aria-hidden="true"
                        >
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
              pagedRows.map((r, rowIndex) => {
                const key = r[keyField] ?? `row-${rowIndex}`;
                const isPending = optimistic?.pendingIds?.has?.(r[keyField]);
                const isError = optimistic?.errorIds?.has?.(r[keyField]);
                return (
                  <tr
                    key={key}
                    className={`${isPending ? 'row-pending' : ''} ${isError ? 'row-error' : ''}`.trim()}
                    style={{
                      opacity: isPending ? 0.6 : 1,
                      background: isError ? 'rgba(239, 68, 68, 0.05)' : undefined,
                    }}
                    role="row"
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key || c.accessor || c.header}
                        style={{ padding: tablePadding }}
                        role="cell"
                      >
                        {c.render ? c.render(r) : r[c.accessor]}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="muted center"
                  style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    <span style={{ fontSize: '2rem', opacity: 0.5 }} aria-hidden="true">
                      📋
                    </span>
                    <span>No data available</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        className="table-footer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--spacing-md)',
        }}
      >
        <div className="muted small">Total: {rows.length} items</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          <button
            className="btn ghost"
            onClick={() => setPage(0)}
            disabled={currentPage === 0}
            aria-label="First page"
            title="First"
          >
            ⏮
          </button>
          <button
            className="btn ghost"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            aria-label="Previous page"
            title="Previous"
          >
            ◀
          </button>
          <span className="small" style={{ minWidth: '100px', textAlign: 'center' }}>
            Page {currentPage + 1} / {pageCount}
          </span>
          <button
            className="btn ghost"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={currentPage >= pageCount - 1}
            aria-label="Next page"
            title="Next"
          >
            ▶
          </button>
          <button
            className="btn ghost"
            onClick={() => setPage(pageCount - 1)}
            disabled={currentPage >= pageCount - 1}
            aria-label="Last page"
            title="Last"
          >
            ⏭
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            aria-label="Rows per page"
            style={{ padding: '6px 10px', fontSize: 'var(--font-size-sm)' }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
