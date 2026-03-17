import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Package,
  History,
  PlusCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../../hooks/api";
import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";
import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";

const ManageConsumablesModal = ({ employee, onClose, onRefresh }) => {
  const [consumables, setConsumables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // UI State for sub-modals
  const [itemToReturn, setItemToReturn] = useState(null);
  const [itemToAllocate, setItemToAllocate] = useState(null);

  const fetchData = useCallback(async () => {
    if (consumables.length === 0) setLoading(true);
    setIsRefreshing(true);

    try {
      const timestamp = new Date().getTime();
      const res = await api.get(`/consumables?t=${timestamp}`);
      setConsumables(res.data.data || []);
    } catch (err) {
      console.error("Failed to load consumables", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [consumables.length]);

  useEffect(() => {
    if (employee?._id) {
       fetchData();
    }
  }, [employee?._id, fetchData]);

  // Derived state: What the employee HAS
  const assignedItems = consumables.filter(c => 
    c.assignments?.some(a => (a.employeeId?._id || a.employeeId) === employee._id)
  ).map(c => {
    const assignment = c.assignments.find(a => (a.employeeId?._id || a.employeeId) === employee._id);
    return { ...c, heldQuantity: assignment.quantity };
  });

  // Derived state: What is AVAILABLE to give
  const availableItems = consumables.filter(c => {
    const available = (c.totalQuantity || 0) - (c.assignedQuantity || 0) - (c.maintenanceQuantity || 0);
    return available > 0;
  });

  if (!employee) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm p-4">
        <div
          className={`bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 transition-opacity ${isRefreshing ? "opacity-75" : "opacity-100"}`}
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-zinc-50">
                Manage Consumables
              </h2>
              <p className="text-sm text-zinc-500">
                {employee.name} • {employee.department || "Staff"}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isRefreshing}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-8 relative">
            {isRefreshing && !loading && (
              <div className="absolute top-2 right-6">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center py-12 text-zinc-400">
                <Loader2 className="animate-spin mb-2 text-indigo-500" />
                <p className="text-sm font-medium">
                  Synchronizing inventory...
                </p>
              </div>
            ) : (
              <>
                {/* Section: Held by Employee */}
                <section>
                  <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <History size={12} className="text-indigo-400" />
                    Currently Held
                  </h3>
                  <div className="space-y-2">
                    {assignedItems.length > 0 ? (
                      assignedItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm">
                              <Package className="text-indigo-400" size={18} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-zinc-200">
                                {item.itemName}
                              </span>
                              <span className="text-xs text-indigo-400/70 font-bold">
                                Holding {item.heldQuantity} units
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setItemToReturn(item)}
                            disabled={isRefreshing}
                            className="text-xs font-bold text-rose-400 hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-rose-500/20 disabled:opacity-50"
                          >
                            Return Items
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-zinc-800/50 rounded-2xl">
                        <p className="text-sm text-zinc-500 italic">
                          No consumables currently held by this employee.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Section: Available to Allocate */}
                <section>
                  <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <PlusCircle size={12} className="text-emerald-400" />
                    Allocate New Stock
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {availableItems.length > 0 ? (
                      availableItems.map((item) => {
                         const available = (item.totalQuantity || 0) - (item.assignedQuantity || 0) - (item.maintenanceQuantity || 0);
                         return (
                          <div
                            key={item._id}
                            className="flex items-center justify-between p-3 bg-zinc-800/20 border border-zinc-800 rounded-2xl hover:border-indigo-500/50 transition-all group"
                          >
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                                {item.category || "GENERAL"}
                              </span>
                              <span className="text-sm font-extrabold text-zinc-200 group-hover:text-white">
                                {item.itemName}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-bold">
                                {available} units available in warehouse
                              </span>
                            </div>
                            <button
                              onClick={() => setItemToAllocate(item)}
                              disabled={isRefreshing}
                              className="text-indigo-400 hover:bg-indigo-500/10 p-2.5 rounded-xl transition-all disabled:opacity-50"
                            >
                              <PlusCircle size={22} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
                        <p className="text-sm text-zinc-500 italic">
                          All consumable stock is currently depleted.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>

      {itemToReturn && (
        <ReturnConsumableModal
          isOpen={!!itemToReturn}
          item={itemToReturn}
          onClose={() => setItemToReturn(null)}
          onRefresh={async () => {
            setItemToReturn(null);
            await fetchData();
            onRefresh();
          }}
        />
      )}

      {itemToAllocate && (
        <IssueConsumableModal
          isOpen={!!itemToAllocate}
          item={itemToAllocate}
          onClose={() => setItemToAllocate(null)}
          onRefresh={async () => {
             setItemToAllocate(null);
             await fetchData();
             onRefresh();
          }}
        />
      )}
    </>
  );
};

export default ManageConsumablesModal;
