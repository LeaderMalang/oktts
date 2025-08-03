import React from 'react';
import { ICONS } from '../constants';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput: React.FC<SearchInputProps> = (props) => (
    <div className="relative flex-grow max-w-xs w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(ICONS.search, { className: "h-5 w-5 text-gray-400" })}
        </div>
        <input
            type="text"
            {...props}
            className="block w-full text-sm rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-10"
        />
    </div>
);
