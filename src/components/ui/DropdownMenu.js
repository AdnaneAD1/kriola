'use client'

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export function DropdownMenu({ items }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`
                block w-full text-left px-4 py-2 text-sm
                ${item.destructive 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
