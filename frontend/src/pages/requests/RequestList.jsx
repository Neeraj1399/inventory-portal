import React, { useEffect, useState } from "react";
import { 
  ClipboardList, 
  Plus, MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  User,
  Filter,
  RefreshCw,
  Search,
  MoreVertical
} from "lucide-react";
import api from "../../hooks/api";
import RequestModal from "../../components/common/RequestModal";
import { useAuth } from "../../context/AuthContext";

const RequestList = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const isAdmin = user?.roleAccess === "ADMIN";
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/requests");
      setRequests(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id, status, note = "") => {
    try {
      await api.patch(`/requests/${id}`, { status, adminNote: note });
      fetchRequests();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "APPROVED": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "REJECTED": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "FULFILLED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH": return "text-rose-500";
      case "MEDIUM": return "text-amber-500";
      case "LOW": return "text-blue-500";
      default: return "text-zinc-500";
    }
  };

  const filteredRequests = (Array.isArray(requests) ? requests : []).filter(req => {
    if (!req) return false;
    const matchesSearch = 
      (req.title?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (req.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (isAdmin && (req.employeeId?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-50 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-indigo-500" size={32} />
            Allocation Requests
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {isAdmin ? "Manage staff inventory requests and incident reports" : "Track status of your equipment and service requests"}
          </p>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={fetchRequests}
            className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-400 hover:text-zinc-100 transition-all shadow-xl"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          {!isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} /> New Ticket
            </button>
          )}
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text"
            placeholder="Search tickets..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-200 focus:border-indigo-500 outline-none transition-all cursor-pointer min-w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 bg-zinc-900/50 border border-zinc-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl">
          <div className="p-4 bg-zinc-800/100/50 w-fit mx-auto rounded-full text-zinc-700 mb-4">
            <ClipboardList size={40} />
          </div>
          <h3 className="text-zinc-300 font-bold">No tickets found</h3>
          <p className="text-zinc-500 text-sm">Requests and reports will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRequests.map((req) => (
            req?._id ? (
              <div key={req._id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group hover:border-zinc-700 transition-all shadow-lg hover:shadow-black/40">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${getPriorityColor(req.priority)}`}>
                        {req.priority || "MEDIUM"} Priority • {req.type}
                      </span>
                      <h3 className="text-lg font-bold text-zinc-50 leading-tight">{req.title}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border tracking-wider ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                    {req.description}
                  </p>

                  {req.itemId && (
                    <div className="flex items-center gap-2 p-2 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <MessageSquare size={14} />
                      </div>
                      <div className="text-[10px]">
                        <p className="text-zinc-500 font-bold uppercase tracking-tighter">Related Item</p>
                        <p className="text-zinc-300 font-medium">{req.itemId?.model || req.itemId?.itemName || "Item Details Missing"}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <User size={14} />
                        <span className="font-semibold text-zinc-400">{isAdmin ? (req.employeeId?.name || "Unknown User") : "Me"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Clock size={14} />
                        <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "Date N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {isAdmin && req.status === "PENDING" && (
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => handleStatusUpdate(req._id, "APPROVED")}
                        className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(req._id, "REJECTED")}
                        className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-400 font-bold text-xs hover:bg-rose-900/20 hover:text-rose-400 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {isAdmin && req.status === "APPROVED" && (
                    <button 
                      onClick={() => handleStatusUpdate(req._id, "FULFILLED")}
                      className="w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      Mark as Fulfilled
                    </button>
                  )}

                  {req.adminNote && (
                    <div className="mt-4 p-3 bg-zinc-800/30 rounded-xl border border-zinc-700/30">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Admin Resolution</p>
                      <p className="text-xs text-zinc-300 italic">"{req.adminNote}"</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null
          ))}
        </div>
      )}
      <RequestModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchRequests(); }} />
    </div>
  );
};

export default RequestList;
