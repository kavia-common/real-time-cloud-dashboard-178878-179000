import React from 'react';
import '../../styles/theme.css';

// PUBLIC_INTERFACE
export default function DataTable({ columns = [], rows = [], keyField = 'id', className = '' }) {
  /** Simple table with headers and rows; ready for API data binding. */
  return (
    <div className={`card table ${className}`.trim()}>
      <table className="table-el">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key || c.accessor}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((r) => (
            <tr key={r[keyField] || JSON.stringify(r)}>
              {columns.map((c) => (
                <td key={c.key || c.accessor}>
                  {c.render ? c.render(r) : r[c.accessor]}
                </td>
              ))}
            </tr>
          )) : (
            <tr>
              <td colSpan={columns.length} className="muted center">No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
