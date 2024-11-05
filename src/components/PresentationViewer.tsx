import React, { useState } from 'react';
import { FileSpreadsheet, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Row {
  id: number;
  cells: string[];
}

const PresentationViewer: React.FC = () => {
  const [url, setUrl] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowId: number; colIndex: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 20;

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock data loading - in a real app, you'd fetch data from the URL
    const mockData: Row[] = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      cells: Array.from({ length: 5 }, (_, j) => `Cell ${i + 1}-${j + 1}`),
    }));
    setRows(mockData);
  };

  const handleCellEdit = (rowId: number, colIndex: number, value: string) => {
    setRows(rows.map(row => 
      row.id === rowId 
        ? { ...row, cells: row.cells.map((cell, i) => i === colIndex ? value : cell) }
        : row
    ));
  };

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const currentRows = rows.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Presentation Viewer</h2>
        
        <form onSubmit={handleUrlSubmit} className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document URL
              </label>
              <div className="relative">
                <FileSpreadsheet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter OneDrive or Google Drive URL"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="self-end bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
            >
              Load
            </button>
          </div>
        </form>

        {rows.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Array.from({ length: 5 }, (_, i) => (
                      <th
                        key={i}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Column {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRows.map((row) => (
                    <tr key={row.id}>
                      {row.cells.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap"
                          onClick={() => setEditingCell({ rowId: row.id, colIndex })}
                        >
                          {editingCell?.rowId === row.id && editingCell?.colIndex === colIndex ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => handleCellEdit(row.id, colIndex, e.target.value)}
                                className="flex-1 border rounded px-2 py-1"
                                autoFocus
                              />
                              <button
                                onClick={() => setEditingCell(null)}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => setEditingCell(null)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <span className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded">
                              {cell}
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
                Showing {startIndex + 1}-{Math.min(endIndex, rows.length)} of {rows.length} rows
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PresentationViewer;