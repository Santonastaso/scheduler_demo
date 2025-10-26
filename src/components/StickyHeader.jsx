import React from 'react';

function StickyHeader({ title, children }) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border px-2 py-3 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {title && <h2 className="text-[10px] font-semibold text-gray-900">{title}</h2>}
        </div>
        {children}
      </div>
    </div>
  );
}

export default StickyHeader;
