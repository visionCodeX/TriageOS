/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Activity, 
  MapPin, 
  PhoneCall, 
  ArrowRightLeft, 
  Search,
  Bell,
  CheckCircle2,
  AlertCircle,
  Wind,
  Users,
  BrainCircuit,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Stethoscope,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Timer,
  BadgeAlert,
  Info,
  Settings as SettingsIcon,
  X,
  History,
  Navigation,
  MoreVertical,
  Hospital as HospitalIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Hospital } from './types';

// Enhanced Mock Data with ETA and premium stats
const INITIAL_HOSPITALS: Hospital[] = [
  { 
    id: 'h1', 
    name: 'St. Jude Medical', 
    distance: '1.2 mi', 
    icuAvailability: 7, 
    totalIcuBeds: 20, 
    ventilatorsFree: 3,
    staffLoad: 54,
    eta: '16 mins',
    contact: '555-0101', 
    type: 'Trauma I',
    address: '1221 Medical Center Blvd, West Sector'
  },
  { 
    id: 'h2', 
    name: 'City General', 
    distance: '2.5 mi', 
    icuAvailability: 3, 
    totalIcuBeds: 15, 
    ventilatorsFree: 0,
    staffLoad: 92,
    eta: '8 mins',
    contact: '555-0102', 
    type: 'General',
    address: '450 Downtown Dr, Central Sector'
  },
  { 
    id: 'h3', 
    name: 'Southside Health', 
    distance: '4.8 mi', 
    icuAvailability: 12, 
    totalIcuBeds: 30, 
    ventilatorsFree: 8,
    staffLoad: 65,
    eta: '12 mins',
    contact: '555-0103', 
    type: 'Trauma II',
    address: '889 Industrial Way, South Sector'
  },
  { 
    id: 'h4', 
    name: 'Metro Care', 
    distance: '0.8 mi', 
    icuAvailability: 1, 
    totalIcuBeds: 12, 
    ventilatorsFree: 1,
    staffLoad: 97,
    eta: '6 mins',
    contact: '555-0104', 
    type: 'Trauma I',
    address: '12 North High St, North Sector'
  },
];

// New Mock Data for interactivity
const CRITICAL_FLEET = [
  { id: 'FT-902', type: 'ICU Transfer', status: 'En-route', priority: 'Critical', vessel: 'Air Ambulance 12', location: 'Sector 4', hospitalName: 'St. Jude Medical', floorNumber: '4th Floor' },
  { id: 'FT-441', type: 'Cardiac Emergency', status: 'Stabilizing', priority: 'Urgent', vessel: 'Ambulance 88', location: 'St. Marks', hospitalName: 'City General', floorNumber: '2nd Floor' },
  { id: 'FT-118', type: 'Needs Ventilator', status: 'Waiting', priority: 'Critical', vessel: 'Air Ambulance 09', location: 'Regional Clinic', hospitalName: 'Southside Health', floorNumber: '6th Floor' },
];

const TRIAGE_QUEUE = [
  { id: 'PX-1022', priority: 'P1', type: 'ICU-B', eta: '4 min', status: 'Pending' },
  { id: 'PX-1023', priority: 'P1', type: 'Trauma', eta: '9 min', status: 'In-Transit' },
  { id: 'PX-1024', priority: 'P2', type: 'Gen-Med', eta: '12 min', status: 'Pending' },
  { id: 'PX-1025', priority: 'P1', type: 'Neuro', eta: '15 min', status: 'Divert-Hold' },
];

const ANALYTICS_HISTORY = [
  { time: '08:00', occupancy: 65, volume: 12, saved: 22 },
  { time: '10:00', occupancy: 72, volume: 18, saved: 28 },
  { time: '12:00', occupancy: 85, volume: 25, saved: 35 },
  { time: '14:00', occupancy: 78, volume: 22, saved: 42 },
  { time: '16:00', occupancy: 92, volume: 30, saved: 48 },
  { time: '18:00', occupancy: 88, volume: 28, saved: 40 },
];

type ViewState = 'dashboard' | 'fleet' | 'queue' | 'analytics' | 'network';

export default function App() {
  const [hospitals, setHospitals] = useState(INITIAL_HOSPITALS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeHospital, setActiveHospital] = useState<string | null>(null);
  const [activeHospitalName, setActiveHospitalName] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStep, setAnalyzingStep] = useState('');
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [transferring, setTransferring] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transferredHospital, setTransferredHospital] = useState<Hospital | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Live Data Simulation Engine
  useEffect(() => {
    const dataTimer = setInterval(() => {
      setHospitals(prev => prev.map(h => {
        const bedDelta = Math.random() > 0.9 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const loadDelta = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const etaVal = parseInt(h.eta);
        const etaDelta = Math.random() > 0.95 ? (Math.random() > 0.5 ? 1 : -1) : 0;

        return {
          ...h,
          icuAvailability: Math.max(0, Math.min(h.totalIcuBeds, h.icuAvailability + bedDelta)),
          staffLoad: Math.max(10, Math.min(100, h.staffLoad + loadDelta)),
          eta: `${Math.max(2, etaVal + etaDelta)} mins`
        };
      }));
    }, 15000); // Slower interval for better performance and less distraction

    const timeTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);

    return () => {
      clearInterval(dataTimer);
      clearInterval(timeTimer);
    };
  }, []);

  const recommendation = useMemo(() => {
    const sorted = [...hospitals].sort((a, b) => {
      const scoreA = (a.icuAvailability * 15) + (100 - a.staffLoad) - (parseInt(a.eta) * 1.5);
      const scoreB = (b.icuAvailability * 15) + (100 - b.staffLoad) - (parseInt(b.eta) * 1.5);
      return scoreB - scoreA;
    });

    const best = sorted[0];
    const runnerUp = sorted[1];
    const allOverloaded = hospitals.every(h => h.icuAvailability === 0 || h.staffLoad > 95);

    if (allOverloaded) return { status: 'emergency' };
    
    let reason = "Optimal balance of proximity and capacity";
    if (best.icuAvailability > 8) reason = "Highest safe capacity with fast ETA";
    else if (parseInt(best.eta) < 10) reason = "Immediate trauma-ready arrival prioritized";
    else if (best.staffLoad < 60) reason = "Minimal resource strain for critical stabilization";

    // Confidence Calculation Logic
    const scoreBest = (best.icuAvailability * 15) + (100 - best.staffLoad) - (parseInt(best.eta) * 1.5);
    const scoreNext = (runnerUp.icuAvailability * 15) + (100 - runnerUp.staffLoad) - (parseInt(runnerUp.eta) * 1.5);
    const margin = scoreBest - scoreNext;
    
    // Higher margin = higher confidence
    const confidence = Math.min(99, Math.max(55, 75 + (margin / 2)));

    return { ...best, reason, confidence, status: 'ok' };
  }, [hospitals]);

  const handleTransfer = (hospitalId: string) => {
    const target = hospitals.find(h => h.id === hospitalId);
    if (!target) return;
    
    setTransferring(true);
    
    // Simulation of "Authorizing..."
    setTimeout(() => {
      setTransferring(false);
      setTransferredHospital(target);
      setShowSuccessModal(true);
      setShowToast(true);
    }, 2000);

    setTimeout(() => {
      setShowToast(false);
    }, 7000);
  };

  const handleSyncAI = () => {
    setIsAnalyzing(true);
    const steps = [
      'Synchronizing live nodes...',
      'Analyzing real-time bed data...',
      'Calculating traffic patterns...',
      'Optimizing clinical match...'
    ];
    
    steps.forEach((step, i) => {
      setTimeout(() => setAnalyzingStep(step), i * 600);
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzingStep('');
    }, 2800);
  };

  const handleGlobalRefresh = () => {
    handleSyncAI();
    // Simulate data fetch
    setHospitals(prev => prev.map(h => ({
      ...h,
      icuAvailability: Math.max(0, h.icuAvailability + (Math.random() > 0.5 ? 1 : -1))
    })));
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const networkDistribution = [
    { name: 'Trauma I', value: hospitals.filter(h => h.type === 'Trauma I').length, color: '#3b82f6' },
    { name: 'Trauma II', value: hospitals.filter(h => h.type === 'Trauma II').length, color: '#6366f1' },
    { name: 'General', value: hospitals.filter(h => h.type === 'General').length, color: '#94a3b8' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-600/10 overflow-hidden">
      
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-[#0A0E17]/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] border border-slate-200 p-12 shadow-2xl overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
              
              <div className="mb-8 relative">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center mx-auto text-emerald-600 shadow-inner"
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24 bg-emerald-400/20 rounded-[2.5rem] -z-10"
                />
              </div>

              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Patient Transfer Confirmed</h2>
              <p className="text-slate-500 font-medium leading-relaxed mb-10">
                The secure digital handoff to <span className="text-slate-900 font-black">{transferredHospital?.name}</span> is complete. 
                Unit <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">FT-902</span> is now transitioning.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ETA Update</p>
                  <p className="text-xl font-black text-slate-900">{transferredHospital?.eta}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xl font-black text-emerald-600">IN-TRANSIT</p>
                </div>
              </div>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-5 bg-[#0A0E17] text-white font-black rounded-2xl hover:bg-blue-600 transition-all uppercase tracking-widest text-sm shadow-xl shadow-blue-900/20"
              >
                Return to Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">App Settings</h2>
                <p className="text-slate-400 font-mono text-xs uppercase mt-2 tracking-widest font-black opacity-60">Control Hub v5.0</p>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: 'Detailed Status', desc: 'Enable advanced real-time hospital overlays', icon: Activity },
                  { label: 'Priority Surge Alert', desc: 'Global notifications for hospital load', icon: Bell },
                  { label: 'Smart Routing', desc: 'AI-assisted routing for better efficiency', icon: BrainCircuit },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 tracking-tight leading-none mb-1 truncate">{item.label}</p>
                        <p className="text-xs text-slate-400 font-bold truncate">{item.desc}</p>
                      </div>
                    </div>
                    <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Authorizing Loader */}
      <AnimatePresence>
        {transferring && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-white/80 backdrop-blur-xl">
            <div className="text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full border-4 border-blue-100 border-t-blue-600 rounded-full"
                />
                <ArrowRightLeft className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-900 tracking-widest uppercase">Authorizing Transfer...</p>
                <p className="text-blue-600 font-bold font-mono text-xs uppercase tracking-widest">Validating Protocol 4A-D Link</p>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-6 px-12 py-7 bg-[#0A0E17] rounded-[2.5rem] text-white shadow-[0_40px_80px_-20px_rgba(10,14,23,0.4)] border border-white/10"
          >
            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight leading-none mb-1">Transfer Authorized</p>
              <p className="text-slate-400 font-bold text-sm tracking-tight capitalize">Destination: {activeHospitalName}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Dark Sidebar Navigation */}
      <aside className={`${isSidebarCollapsed ? 'w-24' : 'w-80'} bg-[#0A0E17] flex flex-col shrink-0 z-20 shadow-2xl relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border-r border-white/5`}>
        {/* Subtle glow effect for sidebar bg */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
        
        <div className={`p-8 ${isSidebarCollapsed ? 'px-0 flex justify-center' : 'pb-10'} relative z-10`}>
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-blue-600/30 cursor-pointer shrink-0"
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              T
            </motion.div>
            {!isSidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-2xl font-black tracking-tighter leading-none text-white">Triage<span className="text-blue-500">OS</span></h1>
                <p className="text-[10px] text-blue-400/60 mt-1.5 uppercase tracking-[0.3em] font-black leading-none">Main Control Center</p>
              </motion.div>
            )}
          </div>
        </div>
        
        <nav className={`flex-1 ${isSidebarCollapsed ? 'px-4' : 'px-5'} py-4 space-y-2 overflow-y-auto custom-scrollbar relative z-10`}>
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-5'} py-4 rounded-2xl font-bold transition-all ${currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title="Dashboard Center"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Dashboard Center</span>}
          </button>
          <button 
            onClick={() => setCurrentView('fleet')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-5'} py-4 rounded-2xl font-bold transition-all ${currentView === 'fleet' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title="Active Fleet"
          >
            <div className="relative">
              <ClipboardList className="w-5 h-5 shrink-0" />
              {isSidebarCollapsed && <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[#0A0E17]">03</span>}
            </div>
            {!isSidebarCollapsed && (
              <>
                <span className="truncate text-left flex-1">Active Fleet</span>
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">03</span>
              </>
            )}
          </button>
          <button 
            onClick={() => setCurrentView('queue')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-5'} py-4 rounded-2xl font-bold transition-all ${currentView === 'queue' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title="Triage Queue"
          >
            <BadgeAlert className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Triage Queue</span>}
          </button>
          <button 
            onClick={() => setCurrentView('network')}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-5'} py-4 rounded-2xl font-bold transition-all ${currentView === 'network' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title="Network Nodes"
          >
            <HospitalIcon className="w-5 h-5 shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Network Nodes</span>}
          </button>
          
          <div className={`pt-10 pb-6 border-t border-white/5 mt-6 ${isSidebarCollapsed ? 'px-0' : ''}`}>
            {!isSidebarCollapsed && <p className="px-5 text-[10px] font-black text-slate-600 uppercase tracking-[0.25em] mb-4 opacity-50">Intelligence</p>}
            <button 
              onClick={() => setCurrentView('analytics')}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-5'} py-3.5 rounded-2xl font-bold transition-all ${currentView === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
              title="Stats & Analytics"
            >
              <BarChart3 className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate text-left flex-1">Stats & Analytics</span>}
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-4 px-5'} py-3.5 rounded-2xl font-bold text-slate-500 hover:text-white transition-all`}
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5 shrink-0" />
              {!isSidebarCollapsed && <span className="truncate text-left flex-1">Settings</span>}
            </button>
          </div>
        </nav>

        <div className={`p-8 border-t border-white/5 bg-black/20 ${isSidebarCollapsed ? 'px-0 flex justify-center' : ''}`}>
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-white/5 flex items-center justify-center font-black text-blue-400 border border-white/10 shadow-inner">SJ</div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-white leading-tight">Sarah Jenkins</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 opacity-60">Director of Ops</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Premium Main Context */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]">
        {/* Top Navigation - Deep Navy */}
        <header className="h-24 bg-[#0A0E17] px-12 flex items-center justify-between shrink-0 z-50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 to-transparent pointer-events-none"></div>
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-white tracking-tight leading-none">Southwest Sector <span className="font-medium text-slate-500 ml-2">Regional Overview</span></h2>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  LIVE CONNECTED
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{currentTime} • GMT -5</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-8 relative z-10">
            <div className="relative group w-80 hidden lg:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search hospitals & status..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm font-medium text-white placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/20 focus:bg-white/10 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all relative group border border-white/5 shadow-inner">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-900 rounded-full group-hover:scale-110 transition-transform"></span>
              </button>
            </div>
            <button 
              onClick={handleGlobalRefresh}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black rounded-2xl shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest border border-white/10"
            >
              Sync Network
            </button>
          </div>
        </header>

        {/* Dashboard Components */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-8 space-y-12 custom-scrollbar scroll-smooth">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                {/* Demo Day Headline Section */}
                <div className="space-y-4 max-w-4xl px-2">
                  <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight"
                  >
                    Real-Time <span className="text-blue-600">ICU Coordination</span> Across Hospital Networks
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl"
                  >
                    AI-powered bed routing, staff balancing, and emergency transfer decisions.
                  </motion.p>
                </div>

                {/* Key Metrics Grid */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Transfer Time Saved', value: '48m', detail: 'Avg Per Transfer', icon: Timer, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'ICU Beds Available', value: hospitals.reduce((acc, h) => acc + h.icuAvailability, 0), detail: 'Across 12 Sectors', icon: HospitalIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Critical Requests', value: '03', detail: 'Priority 1 Active', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
                    { label: 'Network Online', value: '18', detail: 'Active Data Nodes', icon: Navigation, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  ].map((stat, i) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.4 + (i * 0.1),
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className={`p-4 ${stat.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                        <stat.icon className={`w-7 h-7 ${stat.color}`} />
                      </div>
                      <p className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums mb-1">{stat.value}</p>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {stat.detail}
                      </p>
                    </motion.div>
                  ))}
                </section>

                {/* AI Intelligence Panel */}
                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.section 
                      key="analyzing"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="relative rounded-[3.5rem] overflow-hidden bg-white border border-blue-100 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.1)] p-12 flex flex-col items-center justify-center min-h-[400px] space-y-10 group"
                    >
                      {/* Animated Scanner Background */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                      <motion.div 
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent z-0"
                      />

                      <div className="relative z-10">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 border-b-2 border-blue-500 rounded-full"
                          />
                          <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-4 border-t-2 border-indigo-400 opacity-30 rounded-full"
                          />
                          <BrainCircuit className="w-14 h-14 text-blue-600 animate-pulse" />
                        </div>
                      </div>

                      <div className="text-center space-y-3 relative z-10">
                        <motion.h3 
                          key={analyzingStep}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-3xl font-black text-slate-900 tracking-tight uppercase"
                        >
                          {analyzingStep || "Initializing Cloud Nodes..."}
                        </motion.h3>
                        <p className="text-blue-600 font-mono text-xs uppercase tracking-[0.4em] font-black opacity-60">
                          Secure Neural Processing • Real-Time Telemetry
                        </p>
                      </div>
                    </motion.section>
                  ) : recommendation.status === 'emergency' ? (
                    <motion.section 
                      key="emergency"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="relative rounded-[3rem] overflow-hidden bg-rose-50 border-2 border-rose-100 p-12 flex flex-col items-center justify-center text-center space-y-6 shadow-xl min-h-[400px]"
                    >
                      <div className="p-6 bg-rose-500 rounded-[2rem] shadow-xl shadow-rose-500/20">
                        <BadgeAlert className="w-12 h-12 text-white" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-4xl font-black text-rose-600 tracking-tighter">Capacity Critical</h3>
                        <p className="text-rose-900/60 text-lg font-bold max-w-2xl mx-auto">Regional logistics bottleneck detected. Divert status active across all sector nodes.</p>
                      </div>
                      <button className="px-10 py-5 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-700 transition-all uppercase tracking-widest text-sm shadow-lg shadow-rose-600/30">Execute Regional Divert</button>
                    </motion.section>
                  ) : recommendation && recommendation.id && (
                    <motion.section 
                      key={recommendation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative rounded-[3rem] overflow-hidden bg-white border border-blue-100 shadow-xl p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12"
                    >
                      <div className="relative z-10 space-y-8 flex-1">
                        <div className="flex flex-wrap items-center gap-4">
                          <button 
                            onClick={handleSyncAI}
                            className="flex items-center gap-3 px-5 py-2 bg-blue-50 border border-blue-100 rounded-full hover:bg-blue-100 transition-all shadow-sm"
                          >
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">AI OPTIMIZED</span>
                          </button>
                        </div>
 
                        <div>
                          <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                            Target Choice:<br />
                            <span className="text-blue-600">{recommendation.name}</span>
                          </h3>
                          <p className="mt-4 text-slate-500 font-medium leading-relaxed max-w-xl">
                            {recommendation.reason}. AI logic suggests protocol <span className="text-blue-600 font-black">FAST-TRACK</span> for this transition.
                          </p>
                        </div>
 
                        <div className="flex flex-wrap items-center gap-10">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                              <Timer className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ETA</p>
                                <p className="text-xl font-black text-slate-900">{recommendation.eta}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-2xl">
                              <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                <p className="text-xl font-black text-blue-600">{Math.round(recommendation.confidence!)}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
 
                      <button 
                        onClick={() => handleTransfer(recommendation.id!)}
                        className="px-12 py-8 rounded-[2rem] bg-[#0A0E17] text-white font-black text-lg shadow-2xl hover:bg-blue-600 transition-all flex items-center gap-4 border border-blue-500/20"
                      >
                        <ArrowRightLeft className="w-6 h-6 text-blue-400" />
                        Authorize Transfer
                      </button>
                    </motion.section>
                  )}
                </AnimatePresence>

                {/* System Intelligence Feed */}
                <section className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8">
                   <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-start gap-5">
                      <div className="bg-blue-100 p-3.5 rounded-2xl text-blue-600">
                        <Info className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Network Update</p>
                        <p className="text-sm font-bold text-slate-700 leading-snug">System-G relay restored in Northwest. Global sync reaching 99.8% node density.</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-start gap-5">
                      <div className="bg-rose-100 p-3.5 rounded-2xl text-rose-600">
                        <BadgeAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Environmental</p>
                        <p className="text-sm font-bold text-slate-700 leading-snug">High moisture in Sector 9. Med-Air ETA adjusted for regional turbulence.</p>
                      </div>
                    </div>
                </section>

                {/* Quick Fleet Overview */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {CRITICAL_FLEET.slice(0, 3).map((item) => (
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">{item.id}</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      </div>
                      <h4 className="font-black text-slate-900 tracking-tight">{item.type}</h4>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none">{item.status} • {item.location}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{item.hospitalName} • {item.floorNumber}</p>
                      </div>
                    </div>
                  ))}
                </section>
              </motion.div>
            )}

            {currentView === 'fleet' && (
              <motion.div 
                key="fleet"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Active Fleet</h3>
                    <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-widest">Real-time Emergency Response Missions</p>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Export</button>
                    <button className="px-6 py-3 bg-[#0A0E17] text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all outline-none">Dispatch</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {CRITICAL_FLEET.map((caseItem, idx) => (
                    <motion.div 
                      key={caseItem.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:border-blue-200 shadow-sm transition-all group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 border border-rose-100">
                          <Activity className="w-6 h-6" />
                        </div>
                        <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-rose-600/20">{caseItem.priority}</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mb-2 truncate" title={caseItem.type}>{caseItem.type}</h4>
                      <p className="text-slate-400 text-xs font-bold mb-6 truncate">ID: {caseItem.id} • {caseItem.location}</p>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex items-center justify-between text-xs font-bold gap-4">
                          <span className="text-slate-400 uppercase tracking-widest whitespace-nowrap">Facility</span>
                          <span className="text-slate-900 truncate" title={caseItem.hospitalName}>{caseItem.hospitalName}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold gap-4">
                          <span className="text-slate-400 uppercase tracking-widest whitespace-nowrap">Floor</span>
                          <span className="text-slate-900 truncate">{caseItem.floorNumber}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold gap-4">
                          <span className="text-slate-400 uppercase tracking-widest whitespace-nowrap">Ambulance</span>
                          <span className="text-slate-900 truncate" title={caseItem.vessel}>{caseItem.vessel}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold gap-4">
                          <span className="text-slate-400 uppercase tracking-widest whitespace-nowrap">Live Status</span>
                          <span className="text-emerald-600 font-black truncate">{caseItem.status}</span>
                        </div>
                      </div>
                      
                      <button className="w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0A0E17] hover:text-white transition-all">Details</button>
                    </motion.div>
                  ))}
                </div>

                {/* Available Destination Nodes Section */}
                <div className="pt-12">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Available Destination Nodes</h3>
                      <p className="text-slate-500 font-mono text-xs mt-1 uppercase tracking-widest">Active Hospitals for Immediate Diversion</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {hospitals.map((hospital) => (
                      <motion.div 
                        key={`fleet-hosp-${hospital.id}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-2xl ${hospital.icuAvailability > 0 ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'} border border-current opacity-20`}>
                            <HospitalIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-black text-slate-900">{hospital.name}</h4>
                              <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-widest">{hospital.type}</span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {hospital.address} • {hospital.distance}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">ICU Availability</p>
                            <p className={`text-xl font-black ${hospital.icuAvailability > 5 ? 'text-emerald-600' : hospital.icuAvailability > 0 ? 'text-amber-500' : 'text-rose-600'}`}>{hospital.icuAvailability} Beds</p>
                          </div>
                          <button 
                            onClick={() => handleTransfer(hospital.id)}
                            disabled={hospital.icuAvailability === 0}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hospital.icuAvailability > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                          >
                            Assign Unit
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentView === 'queue' && (
              <motion.div 
                key="queue"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Patient Queue</h3>
                    <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-widest">Waiting for Assignment • Current Rank</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {['Patient ID', 'Priority', 'Type', 'ETA', 'Current Step', 'Actions'].map((head) => (
                          <th key={head} className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {TRIAGE_QUEUE.map((patient) => (
                        <tr key={patient.id} className="hover:bg-blue-50/50 transition-colors group text-sm">
                          <td className="px-8 py-6 font-black text-slate-900 whitespace-nowrap">{patient.id}</td>
                          <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black whitespace-nowrap ${patient.priority === 'P1' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                              {patient.priority}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-slate-600 font-bold truncate max-w-[120px]">{patient.type}</td>
                          <td className="px-8 py-6 font-mono text-blue-600 font-bold whitespace-nowrap">{patient.eta}</td>
                          <td className="px-8 py-6">
                            <span className="flex items-center gap-2 text-xs font-bold text-slate-500 whitespace-nowrap">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${patient.status === 'In-Transit' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-slate-300'}`}></span>
                              {patient.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {currentView === 'network' && (
              <motion.div 
                key="network"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Hospital Network</h3>
                    <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-widest">Regional Facility Inventory • Live Status</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-widest">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       {hospitals.length} Active Nodes
                    </div>
                  </div>
                </div>

                {/* Hospital Telemetry Grid */}
                <section className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="font-black text-slate-600 uppercase tracking-[0.3em] text-[11px]">Regional Network Feed</h3>
                    <div className="flex gap-4 text-[10px] font-black text-slate-500 uppercase tracking-widest p-1.5 bg-white/5 rounded-full border border-white/5">
                      <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full"><span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Optimal</span>
                      <span className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full"><span className="w-2 h-2 bg-rose-500 rounded-full"></span> Divert Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode='wait'>
                      {filteredHospitals.map((hospital, idx) => {
                        const isLoadHigh = hospital.staffLoad > 85;
                        const isDivert = hospital.icuAvailability === 0;
                        const isRecommended = hospital.id === recommendation.id;
                        
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.02 }}
                            key={hospital.id}
                            className={`group relative bg-white rounded-[2.5rem] border p-6 md:p-7 shadow-sm transition-all duration-300 flex flex-col h-full cursor-default
                              ${isRecommended 
                                ? 'border-blue-500 ring-4 ring-blue-500/5 shadow-md' 
                                : 'border-slate-100 hover:border-blue-300'
                              }`}
                          >
                            {isRecommended && (
                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-4 py-1 rounded-full shadow-lg shadow-blue-600/30 uppercase tracking-[0.2em] z-10 whitespace-nowrap">
                                AI Recommended
                              </div>
                            )}

                            <div className="flex w-full items-start justify-between gap-4 mb-5">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xl md:text-2xl font-black text-slate-900 leading-[1.1] tracking-tighter group-hover:text-blue-600 transition-colors duration-500 break-words" title={hospital.name}>
                                  {hospital.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className="text-[9px] font-black text-blue-700 uppercase tracking-widest bg-blue-100/50 px-2 py-1 rounded-lg whitespace-nowrap shrink-0 border border-blue-200/50">{hospital.type}</span>
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {hospital.distance}
                                  </span>
                                </div>
                              </div>
                              <div className={`w-3.5 h-3.5 rounded-full mt-1.5 shrink-0 ${isDivert ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : isLoadHigh ? 'bg-amber-500' : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] animate-pulse'}`}></div>
                            </div>
 
                            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
                              <div className="p-4 md:p-5 rounded-[1.75rem] bg-slate-50 border border-slate-100 transition-all duration-500 group-hover:bg-blue-50 group-hover:border-blue-100 min-w-0 flex flex-col justify-between shadow-sm">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-2">ICU Capacity</p>
                                  <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl md:text-3xl font-black tabular-nums tracking-tighter ${isDivert ? 'text-rose-600' : 'text-slate-900'}`}>{hospital.icuAvailability}</span>
                                    <span className="text-[10px] font-bold text-slate-400">/{hospital.totalIcuBeds}</span>
                                  </div>
                                </div>
                                <div className="mt-4 h-2 w-full bg-slate-200 rounded-full overflow-hidden p-[1px]">
                                  <div className={`h-full rounded-full ${isDivert ? 'bg-rose-500' : 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.3)]'}`} style={{ width: `${(hospital.icuAvailability / hospital.totalIcuBeds) * 100}%` }}></div>
                                </div>
                              </div>
                              <div className="p-4 md:p-5 rounded-[1.75rem] bg-slate-50 border border-slate-100 transition-all duration-500 group-hover:bg-blue-50 group-hover:border-blue-100 min-w-0 flex flex-col justify-between shadow-sm">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-2">Vent Units</p>
                                  <div className="flex items-center gap-2">
                                    <Wind className={`w-5 h-5 shrink-0 ${hospital.ventilatorsFree > 0 ? 'text-blue-500' : 'text-slate-300'}`} />
                                    <span className="text-2xl md:text-3xl font-black tabular-nums tracking-tighter text-slate-900">{hospital.ventilatorsFree}</span>
                                  </div>
                                </div>
                                <p className="text-[9px] font-black text-blue-600/60 mt-4 uppercase tracking-widest flex items-center gap-1.5 bg-blue-50/50 px-2 py-0.5 rounded-md w-fit">
                                  <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"></span>
                                  Active Pulse
                                </p>
                              </div>
                            </div>

                            <div className="space-y-6 mt-auto">
                              <div className="space-y-3 px-1">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em]">
                                  <span className="text-slate-500">Staff Load Analysis</span>
                                  <span className={`font-black ${isLoadHigh ? 'text-rose-600' : 'text-slate-900'}`}>{hospital.staffLoad}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-[2px] shadow-sm border border-slate-200/50">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${hospital.staffLoad}%` }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className={`h-full rounded-full shadow-sm ${isLoadHigh ? 'bg-gradient-to-r from-rose-500 to-rose-600' : hospital.staffLoad > 75 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'}`} 
                                  ></motion.div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between py-4 px-1 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100/50 shadow-sm">
                                    <Timer className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Transit ETA</p>
                                    <span className="text-xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{hospital.eta}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-700 font-black text-[10px] uppercase tracking-widest bg-emerald-100/50 px-3 py-1.5 rounded-xl border border-emerald-200/50 shadow-sm">
                                  <TrendingDown className="w-3.5 h-3.5" />
                                  Optimal
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => handleTransfer(hospital.id)}
                                disabled={isDivert}
                                className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group/btn ${isDivert ? 'bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100' : 'bg-[#0A0E17] text-white shadow-xl hover:bg-blue-600 hover:shadow-blue-600/30'}`}
                              >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                  <ArrowRightLeft className="w-4 h-4 group-hover/btn:rotate-180 transition-all duration-700" />
                                  {isDivert ? 'Divert Active' : 'Transfer'}
                                </span>
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </section>
              </motion.div>
            )}
            
            {currentView === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter">System Analytics</h3>
                    <p className="text-slate-500 font-mono text-sm mt-1 uppercase tracking-widest">Overall Network Traffic • Efficiency Stats</p>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <button className="px-5 py-2 bg-slate-50 text-slate-900 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-white transition-all">Daily</button>
                    <button className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg shadow-blue-600/20">Weekly</button>
                    <button className="px-5 py-2 bg-slate-50 text-slate-900 text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-white transition-all">Monthly</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10 h-[500px] flex flex-col shadow-sm group">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">Network Occupancy Over Time</h4>
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg">
                        <TrendingDown className="w-3 h-3" />
                        8% TREND
                      </div>
                    </div>
                    <div className="flex-1 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={ANALYTICS_HISTORY}>
                          <defs>
                            <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tick={{dy: 10}} />
                          <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tick={{dx: -10}} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                            itemStyle={{ color: '#0f172a', fontSize: '12px', fontWeight: 'bold' }}
                            cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Area type="monotone" dataKey="occupancy" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorOcc)" animationDuration={1500} />
                          <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" fill="transparent" animationDuration={1500} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 h-[500px] flex flex-col shadow-sm">
                    <h4 className="text-xl font-black text-slate-900 mb-8 tracking-tight">Facility Distribution</h4>
                    <div className="flex-1 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={networkDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                            animationDuration={1000}
                          >
                            {networkDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                             contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tighter">{hospitals.length}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                       {networkDistribution.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                          </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Hospital Connections', val: '1,280+', delta: '+12%', icon: History, trend: 'up' },
                    { label: 'Active Diverts', val: '08', delta: '-2', icon: Navigation, trend: 'down' },
                    { label: 'Wait Time Avg', val: '14.2m', delta: '-4m', icon: Timer, trend: 'down' },
                    { label: 'System Health', val: '99.9%', delta: 'Verified', icon: Activity, trend: 'up' },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ y: -8 }}
                      className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col gap-6 shadow-sm group hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-12">
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{stat.delta}</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                        <span className="text-4xl font-black text-slate-900 tracking-tighter">{stat.val}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Control Footer */}
        <footer className="px-12 py-8 bg-white border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] shrink-0">
          <div className="flex items-center gap-8">
            <p className="text-slate-400 italic opacity-80 underline underline-offset-4 decoration-slate-200 uppercase tracking-widest">© 2026 TriageOS • Official Health System Dashboard</p>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
            <p className="font-black text-slate-500">HIPAA Secure Data</p>
          </div>
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full border border-emerald-100 shadow-sm transition-all hover:bg-emerald-100 cursor-help">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></span>
              API OPERATIONAL: 100%
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
