import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Reusable Pagination Component - Premium SaaS Edition
 */
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5; 

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mt-12 px-6 py-8 border-t border-border bg-bg-secondary/30 rounded-b-[2rem]">
      {/* Items Info */}
      {totalItems !== undefined && (
        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] order-2 sm:order-1 opacity-60">
          Syncing <span className="text-text-primary">{startItem}</span> – <span className="text-text-primary">{endItem}</span> <span className="mx-1 font-medium opacity-40 italic">of</span> <span className="text-accent-primary font-black">{totalItems}</span> entries
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-2 order-1 sm:order-2">
        {/* First Page */}
        <NavButton
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          icon={ChevronsLeft}
          title="First Vector"
        />

        {/* Prev Page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-10 px-4 text-text-muted hover:text-accent-primary disabled:opacity-20 disabled:hover:text-text-muted transition-all mr-2 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
          <span className="hidden md:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {getPageNumbers().map((page, idx) => (
            <React.Fragment key={idx}>
              {page === "..." ? (
                <span className="px-3 text-text-disabled font-black opacity-30">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page)}
                  className={`
                    min-w-[40px] h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-90 relative overflow-hidden group
                    ${
                      currentPage === page
                        ? "bg-accent-primary text-white shadow-glow border border-border"
                        : "text-text-muted hover:bg-bg-elevated hover:text-text-primary border border-transparent"
                    }
                  `}
                >
                   {currentPage !== page && (
                     <div className="absolute inset-0 bg-accent-primary/0 group-hover:bg-accent-primary/5 transition-colors" />
                   )}
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-10 px-4 text-text-muted hover:text-accent-primary disabled:opacity-20 disabled:hover:text-text-muted transition-all ml-2 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 active:scale-95 group"
        >
          <span className="hidden md:inline">Next</span> 
          <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Last Page */}
        <NavButton
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          icon={ChevronsRight}
          title="Final Vector"
        />
      </div>
    </div>
  );
};

const NavButton = ({ onClick, disabled, icon: Icon, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-10 h-10 flex items-center justify-center rounded-xl text-text-muted hover:text-white hover:bg-bg-elevated disabled:opacity-10 disabled:hover:bg-transparent disabled:hover:text-text-muted transition-all active:scale-90 border border-transparent hover:border-border"
    title={title}
  >
    <Icon size={18} />
  </button>
);

export default Pagination;
