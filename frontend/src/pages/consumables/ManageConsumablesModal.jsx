import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Package,
  History,
  PlusCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";
import ReturnConsumableModal from "../../components/consumables/ReturnConsumableModal";
import IssueConsumableModal from "../../components/consumables/IssueConsumableModal";

const ManageConsumablesModal = ({ isOpen, employee, onClose, onRefresh }) => {
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
  const assignedItems = (!employee || consumables.length === 0) ? [] : consumables.filter(c => 
    c.assignments?.some(a => (a.employeeId?._id || a.employeeId) === employee._id)
  ).map(c => {
    const assignment = c.assignments.find(a => (a.employeeId?._id || a.employeeId) === employee._id);
    return { ...c, heldQuantity: assignment.quantity };
  });

  // Derived state: What is AVAILABLE to give
  const availableItems = consumables.length === 0 ? [] : consumables.filter(c => {
    const available = (c.totalQuantity || 0) - (c.assignedQuantity || 0) - (c.maintenanceQuantity || 0);
    return available > 0;
  });

  if (!isOpen || !employee) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm p-4">
        <div
          className={`bg-bg-secondary border border-border rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 transition-opacity ${isRefreshing ? "opacity-75" : "opacity-100"}`}
        >
          {/* Header */}
          <div className="p-8 border-b border-border flex justify-between items-center bg-bg-tertiary/20">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Consumable <span className="text-accent-primary">Logistics</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">
                {employee.name} • {employee.department || "Staff"}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isRefreshing}
              className="p-3 hover:bg-bg-tertiary rounded-2xl transition-all disabled:opacity-50 text-text-muted hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-8 relative">
            {isRefreshing && !loading && (
              <div className="absolute top-2 right-6">
                <Loader2 size={16} className="animate-spin text-accent-primary" />
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center py-12 text-text-muted">
                <Loader2 className="animate-spin mb-2 text-accent-primary" />
                <p className="text-sm font-medium">
                  Synchronizing inventory...
                </p>
              </div>
            ) : (
              <>
                {/* Section: Held by Employee */}
                <section>
                  <h3 className="text-[10px] font-black text-text-disabled uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-accent-primary rounded-full shadow-glow" />
                    Currently Held
                  </h3>
                  <div className="space-y-2">
                    {assignedItems.length > 0 ? (
                      assignedItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-4 bg-bg-elevated/50 rounded-2xl border border-border group hover:bg-bg-elevated transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-accent-primary/10 border border-accent-primary/10 rounded-xl shadow-inner">
                              <Package className="text-accent-primary" size={20} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base font-black text-text-primary tracking-tight">
                                {item.itemName}
                              </span>
                              <span className="text-[10px] text-accent-primary/70 font-black uppercase tracking-widest">
                                Holding {item.heldQuantity} units
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setItemToReturn(item)}
                            disabled={isRefreshing}
                            className="text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border hover:bg-status-danger/10 hover:text-status-danger hover:border-status-danger/20 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            Return Items
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-border rounded-2xl">
                        <p className="text-sm text-text-muted italic">
                          No consumables currently held by this employee.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Section: Available to Allocate */}
                <section>
                  <h3 className="text-[10px] font-black text-text-disabled uppercase tracking-[0.2em] mb-6 flex items-center gap-2 mt-4">
                    <div className="w-1.5 h-1.5 bg-accent-secondary rounded-full shadow-glow" />
                    Allocate New Stock
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {availableItems.length > 0 ? (
                      availableItems.map((item) => {
                         const available = (item.totalQuantity || 0) - (item.assignedQuantity || 0) - (item.maintenanceQuantity || 0);
                         return (
                          <div
                            key={item._id}
                            className="flex items-center justify-between p-4 bg-bg-elevated/20 border border-border rounded-2xl hover:border-accent-primary/50 transition-all group"
                          >
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black text-accent-secondary uppercase tracking-[0.2em] mb-1">
                                {item.category || "GENERAL"}
                              </span>
                              <span className="text-base font-black text-text-primary tracking-tight group-hover:text-white transition-colors">
                                {item.itemName}
                              </span>
                              <span className="text-[10px] text-text-muted font-black uppercase tracking-widest opacity-60">
                                {available} units available in warehouse
                              </span>
                            </div>
                            <button
                              onClick={() => setItemToAllocate(item)}
                              disabled={isRefreshing}
                              className="text-accent-primary hover:bg-accent-primary/10 p-3 rounded-2xl transition-all disabled:opacity-50 border border-transparent hover:border-accent-primary/20"
                            >
                              <PlusCircle size={24} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 bg-bg-secondary border border-border rounded-2xl">
                        <p className="text-sm text-text-muted italic">
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
