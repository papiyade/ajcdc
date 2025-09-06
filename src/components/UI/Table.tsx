import React, { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import { TableColumn, SortParams } from '../../types';
import { Input } from './Input';
import { Button } from './Button';

interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  sortable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  emptyMessage = 'Aucune donnée disponible',
  loading = false,
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  className
}: TableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortParams, setSortParams] = useState<SortParams | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrage et recherche
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Recherche textuelle
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        columns.some(column => {
          const value = item[column.key];
          return value?.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    return filtered;
  }, [data, searchTerm, columns]);

  // Tri
  const sortedData = useMemo(() => {
    if (!sortParams) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortParams.field];
      const bValue = b[sortParams.field];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (aValue == null) comparison = -1;
      else if (bValue == null) comparison = 1;
      else if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else {
        comparison = aValue < bValue ? -1 : 1;
      }

      return sortParams.direction === 'desc' ? -comparison : comparison;
    });
  }, [filteredData, sortParams]);

  // Pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  // Gestion du tri
  const handleSort = (field: string) => {
    if (!sortable) return;

    setSortParams(prev => {
      if (prev?.field === field) {
        return prev.direction === 'asc'
          ? { field, direction: 'desc' }
          : null;
      }
      return { field, direction: 'asc' };
    });
  };

  // Gestion de la sélection
  const isSelected = (item: T) => {
    return selectedRows.some(selected => selected === item);
  };

  const handleRowSelection = (item: T, checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedRows, item]);
    } else {
      onSelectionChange(selectedRows.filter(selected => selected !== item));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return;

    if (checked) {
      onSelectionChange([...selectedRows, ...paginatedData.filter(item => !isSelected(item))]);
    } else {
      onSelectionChange(selectedRows.filter(selected => !paginatedData.includes(selected)));
    }
  };

  const allPageItemsSelected = paginatedData.length > 0 && paginatedData.every(isSelected);
  const somePageItemsSelected = paginatedData.some(isSelected);

  return (
    <div className={clsx('space-y-4', className)}>
      {/* Barre de recherche et filtres */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {searchable && (
            <div className="w-full sm:w-auto sm:min-w-80">
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search />}
              />
            </div>
          )}
          
          {filterable && (
            <Button
              variant="secondary"
              icon={<Filter />}
              size="sm"
            >
              Filtres
            </Button>
          )}
        </div>
      )}

      {/* Tableau */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                {onSelectionChange && (
                  <th className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={allPageItemsSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = somePageItemsSelected && !allPageItemsSelected;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </th>
                )}
                
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={clsx(
                      'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                      sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-100',
                      column.className
                    )}
                    onClick={() => column.sortable !== false && handleSort(String(column.key))}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {sortable && column.sortable !== false && (
                        <span className="flex flex-col">
                          <ChevronUp
                            className={clsx(
                              'h-3 w-3',
                              sortParams?.field === column.key && sortParams.direction === 'asc'
                                ? 'text-primary'
                                : 'text-gray-300'
                            )}
                          />
                          <ChevronDown
                            className={clsx(
                              'h-3 w-3 -mt-1',
                              sortParams?.field === column.key && sortParams.direction === 'desc'
                                ? 'text-primary'
                                : 'text-gray-300'
                            )}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onSelectionChange ? 1 : 0)}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className={clsx(
                      'hover:bg-gray-50',
                      onRowClick && 'cursor-pointer',
                      isSelected(item) && 'bg-primary-50'
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {onSelectionChange && (
                      <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={isSelected(item)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelection(item, e.target.checked);
                          }}
                        />
                      </td>
                    )}
                    
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className={clsx(
                          'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
                          column.className
                        )}
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]?.toString() || '-'
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de {((currentPage - 1) * pageSize) + 1} à{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} sur{' '}
            {sortedData.length} résultats
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Précédent
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

