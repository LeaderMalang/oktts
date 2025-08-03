import React from 'react';

const FilterBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
            {children}
        </div>
    </div>
);

const FilterInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="block w-full sm:w-auto text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
);

const FilterSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
    <select {...props} className="block w-full sm:w-auto text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        {children}
    </select>
);

const ResetButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
        Reset
    </button>
);

const FilterControls = {
    Input: FilterInput,
    Select: FilterSelect,
    ResetButton: ResetButton,
};

export { FilterBar, FilterControls };
