import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold font-display text-gray-900">{title}</h1>
        {subtitle && <div className="text-sm text-gray-500 mt-0.5">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
