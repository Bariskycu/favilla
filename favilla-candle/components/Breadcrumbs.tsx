import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';

interface BreadcrumbsProps {
    items?: { label: string; path?: string }[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    const { language } = useStore();
    const t = translations[language];

    // Default base is Home
    const breadcrumbs = [
        { label: t.nav.home, path: '/' },
        ...(items || [])
    ];

    return (
        <nav aria-label="Breadcrumb" className="mb-8 hidden md:block">
            <ol className="flex items-center space-x-2">
                {breadcrumbs.map((item, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    
                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <ChevronRight size={12} className="text-neutral-300 mx-2" />
                            )}
                            {isLast || !item.path ? (
                                <span className="text-[10px] font-bold tracking-widest uppercase text-softBlack" aria-current="page">
                                    {item.label}
                                </span>
                            ) : (
                                <Link 
                                    to={item.path}
                                    className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 hover:text-softBlack transition-colors"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};