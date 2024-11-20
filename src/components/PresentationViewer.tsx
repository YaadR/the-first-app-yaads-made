import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Save, X, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { google } from 'googleapis';

interface Cell {
  value: string;
  isEditing: boolean;
}

interface Row {
  id: number;
  cells: Cell[];
}

const PresentationViewer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const rowsPerPage = 20;

  const extractSpreadsheetId = (url: string): string | null => {
    const match = url.match(/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const loadSpreadsheetData = async (spreadsheetId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/.netlify/functions/get-spreadsheet?id=${spreadsheetId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch spreadsheet data');
      }

      const data = await response.json();
      
      // Transform the data into our Row format
      const transformedRows = data.values?.map((row: string[], index: number) => ({
        id: index,
        cells: row.map((value) => ({
          value,
          isEditing: false,
        })),
      })) || [];
      

      setTotalRows(transformedRows.length);
      setRows(transformedRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load spreadsheet');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const spreadsheetId = extractSpreadsheetId(url);
    if (!spreadsheetId) {
      setError('Invalid Google Sheets URL');
      return;
    }
    await loadSpreadsheetData(spreadsheetId);
  };

  const handleCellEdit = (rowId: number, cellIndex: number, value: string) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const newCells = [...row.cells];
        newCells[cellIndex] = {
          ...newCells[cellIndex],
          value
        };
        return { ...row, cells: newCells };
      }
      return row;
    }));
  };

  const toggleCellEdit = (rowId: number, cellIndex: number) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const newCells = row.cells.map((cell, i) => ({
          ...cell,
          isEditing: i === cellIndex ? !cell.isEditing : false
        }));
        return { ...row, cells: newCells };
      }
      return {
        ...row,
        cells: row.cells.map(cell => ({ ...cell, isEditing: false }))
      };
    }));
  };

  const saveCell = async (rowId: number, cellIndex: number) => {
    const cell = rows.find(r => r.id === rowId)?.cells[cellIndex];
    if (!cell) return;

    try {
      // Here you would typically make an API call to update the cell in Google Sheets
      // For now, we'll just update our local state
      toggleCellEdit(rowId, cellIndex);
    } catch (err) {
      setError('Failed to save cell');
    }
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const currentRows = rows.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Presentation Viewer</h2>
        
        <form onSubmit={handleUrlSubmit} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Sheets URL
              </label>
              <div className="relative">
                <FileSpreadsheet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste your Google Sheets URL"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="self-end bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Loading...
                </>
              ) : (
                'Load Sheet'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-4 flex items-center text-red-500">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        {rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRows.map((row) => (
                    <tr key={row.id}>
                      {row.cells.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => !cell.isEditing && toggleCellEdit(row.id, cellIndex)}
                        >
                          {cell.isEditing ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={cell.value}
                                onChange={(e) => handleCellEdit(row.id, cellIndex, e.target.value)}
                                className="flex-1 border rounded px-2 py-1"
                                autoFocus
                              />
                              <button
                                onClick={() => saveCell(row.id, cellIndex)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => toggleCellEdit(row.id, cellIndex)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                              {cell.value}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1}-{Math.min(endIndex, totalRows)} of {totalRows} rows
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PresentationViewer;