import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Key, Shield, LogIn, LogOut, UserPlus, CreditCard, 
  RefreshCw, BarChart2, ShieldAlert, CheckCircle2, Trash2, Edit2, 
  Plus, Users, Compass, Clock, Check, AlertTriangle, Send, Sparkles, Building,
  Mail, Smartphone, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, QuotaAuditLog } from '../types';

// Storage keys
const STORAGE_PREFIX = 'cultureos_auth_';

export interface QuotaRequest {
  id: string;
  userEmail: string;
  userName: string;
  requestedAmount: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export function useAuthManager() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<QuotaAuditLog[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<QuotaRequest[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'profile'>('login');
  const [quotaExceededModalOpen, setQuotaExceededModalOpen] = useState(false);

  // Initialize and load persistent state
  useEffect(() => {
    // 1. Load users list, pre-populating mock accounts
    let storedUsers: UserProfile[] = [];
    const localUsers = localStorage.getItem(`${STORAGE_PREFIX}users`);
    if (localUsers) {
      try {
        storedUsers = JSON.parse(localUsers);
      } catch (e) {}
    }

    if (storedUsers.length === 0) {
      // Seed default accounts
      storedUsers = [
        {
          id: 'u-1',
          email: 'admin@cultureos.com',
          name: '系统超级管理员 (Platform Admin)',
          role: 'admin',
          remainingQuota: 999999,
          maxQuota: 999999,
          regDate: '2026-05-10',
          businessDomain: 'CultureOS SaaS Platform',
          purpose: 'Global administrative control & enterprise scaling'
        },
        {
          id: 'u-2',
          email: 'demo@cultureos.com',
          name: '出海瑞鹿电器 (Lucky Deer Pet Inc)',
          role: 'user',
          remainingQuota: 3,
          maxQuota: 5,
          regDate: '2026-06-15',
          businessDomain: '智能宠物电器 / 喂食器 (Pet Tech)',
          purpose: 'North America Amazon retail scaling'
        },
        {
          id: 'u-3',
          email: 'tea_pioneers@outlook.com',
          name: '东方茗风冷泡茶 (Ancient Eastern Leaf)',
          role: 'user',
          remainingQuota: 0, // Exhausted by default to showcase lock screen!
          maxQuota: 5,
          regDate: '2026-06-18',
          businessDomain: '中草自然东方冷萃茶 (Herbal Tea & Cold Brew)',
          purpose: 'Southeast Asia and UK boutique tea mapping'
        }
      ];
      localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(storedUsers));
    }
    setUsersList(storedUsers);

    // 2. Load pending upgrade requests
    let storedRequests: QuotaRequest[] = [];
    const localRequests = localStorage.getItem(`${STORAGE_PREFIX}requests`);
    if (localRequests) {
      try {
        storedRequests = JSON.parse(localRequests);
      } catch (e) {}
    }
    if (storedRequests.length === 0) {
      storedRequests = [
        {
          id: 'req-1',
          userEmail: 'tea_pioneers@outlook.com',
          userName: '东方茗风冷泡茶',
          requestedAmount: 10,
          message: '国内爆款古汉冷泡茶，需要更大的配额以适配英国大区 Tiktok 的全谱系分发和词组包，请求扩容',
          status: 'pending',
          timestamp: '2026-06-21 16:30'
        }
      ];
      localStorage.setItem(`${STORAGE_PREFIX}requests`, JSON.stringify(storedRequests));
    }
    setUpgradeRequests(storedRequests);

    // 3. Load Quota audit logs
    let storedAudit: QuotaAuditLog[] = [];
    const localAudit = localStorage.getItem(`${STORAGE_PREFIX}audit`);
    if (localAudit) {
      try {
        storedAudit = JSON.parse(localAudit);
      } catch (e) {}
    }
    if (storedAudit.length === 0) {
      storedAudit = [
        {
          id: 'aud-1',
          timestamp: '2026-06-22 00:15',
          userId: 'u-2',
          userEmail: 'demo@cultureos.com',
          action: 'RAG 规则动态自进化',
          amount: -1,
          remainingAfter: 3
        },
        {
          id: 'aud-2',
          timestamp: '2026-06-21 18:22',
          userId: 'u-3',
          userEmail: 'tea_pioneers@outlook.com',
          action: '协同工作台 - 极瑞智能流程运算',
          amount: -1,
          remainingAfter: 0
        }
      ];
      localStorage.setItem(`${STORAGE_PREFIX}audit`, JSON.stringify(storedAudit));
    }
    setAuditLogs(storedAudit);

    // 4. Load logged in user
    const savedUser = localStorage.getItem(`${STORAGE_PREFIX}current`);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as UserProfile;
        // Keep synced with dynamic state in general list
        const matched = storedUsers.find(su => su.id === u.id);
        if (matched) {
          setCurrentUser(matched);
        } else {
          setCurrentUser(u);
        }
      } catch (e) {}
    } else {
      // Default to the admin user so they can do everything directly with no hassle!
      const defaultAdmin: UserProfile = {
        id: 'u-1',
        email: 'admin@cultureos.com',
        name: '系统超级管理员 (Platform Admin)',
        role: 'admin',
        remainingQuota: 999999,
        maxQuota: 999999,
        regDate: '2026-05-10',
        businessDomain: 'CultureOS SaaS Platform',
        purpose: 'Global administrative control & enterprise scaling'
      };
      setCurrentUser(defaultAdmin);
    }
  }, []);

  // Update localStorage and triggers when currentUser changes
  const saveCurrentUser = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(`${STORAGE_PREFIX}current`, JSON.stringify(user));
    } else {
      localStorage.removeItem(`${STORAGE_PREFIX}current`);
    }
  };

  const handleLogin = (email: string): { success: boolean; error?: string } => {
    const matched = usersList.find(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());
    if (matched) {
      saveCurrentUser(matched);
      return { success: true };
    }
    return { success: false, error: '未找到匹配的账户。试着使用默认账号 demo@cultureos.com 或是 admin@cultureos.com。' };
  };

  const handleRegister = (name: string, email: string, businessDomain: string, purpose: string): { success: boolean; error?: string } => {
    const trimmedEmail = email.trim().toLowerCase();
    if (usersList.some(u => u.email === trimmedEmail)) {
      return { success: false, error: '该邮箱已经注册过系统账号。试着直接登录！' };
    }

    const newUser: UserProfile = {
      id: `u-${Date.now()}`,
      email: trimmedEmail,
      name,
      role: trimmedEmail.includes('admin') ? 'admin' : 'user',
      remainingQuota: trimmedEmail.includes('admin') ? 999999 : 5, // Default 5 trials
      maxQuota: trimmedEmail.includes('admin') ? 999999 : 5,
      regDate: new Date().toISOString().split('T')[0],
      businessDomain,
      purpose
    };

    const updatedUsers = [...usersList, newUser];
    setUsersList(updatedUsers);
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(updatedUsers));
    
    // Automatically log in
    saveCurrentUser(newUser);

    // Create an audit log
    const audit: QuotaAuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userId: newUser.id,
      userEmail: newUser.email,
      action: '注册新账号并分配免费算力额度',
      amount: newUser.remainingQuota,
      remainingAfter: newUser.remainingQuota
    };
    const updatedAudit = [audit, ...auditLogs];
    setAuditLogs(updatedAudit);
    localStorage.setItem(`${STORAGE_PREFIX}audit`, JSON.stringify(updatedAudit));

    return { success: true };
  };

  const handleGuestLogin = () => {
    const guestUser: UserProfile = {
      id: 'u-guest',
      email: 'guest@cultureos.com',
      name: '游客演示账号 (Guest Demo)',
      role: 'guest',
      remainingQuota: 0,
      maxQuota: 0,
      regDate: new Date().toISOString().split('T')[0],
      businessDomain: '只读演示企业 (ReadOnly Inc)',
      purpose: '预览体验大区适配、AI工作坊和出海方案演示'
    };
    saveCurrentUser(guestUser);
  };

  const handleLogout = () => {
    saveCurrentUser(null);
  };

  // Check and consume Quota
  const handleCheckAndConsumeQuota = (actionName: string): boolean => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return false;
    }

    if (currentUser.role === 'admin') {
      return true; // Infinite capacity for admins
    }

    if (currentUser.role === 'guest') {
      setQuotaExceededModalOpen(true);
      return false;
    }

    if (currentUser.remainingQuota <= 0) {
      setQuotaExceededModalOpen(true);
      return false;
    }

    // Decrement quota
    const updatedUser = {
      ...currentUser,
      remainingQuota: currentUser.remainingQuota - 1
    };

    // Update locally and in users list
    saveCurrentUser(updatedUser);
    const updatedUsers = usersList.map(u => u.id === currentUser.id ? updatedUser : u);
    setUsersList(updatedUsers);
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(updatedUsers));

    // Register inside audit log
    const audit: QuotaAuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0, 5),
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: actionName,
      amount: -1,
      remainingAfter: updatedUser.remainingQuota
    };
    const updatedAudit = [audit, ...auditLogs];
    setAuditLogs(updatedAudit);
    localStorage.setItem(`${STORAGE_PREFIX}audit`, JSON.stringify(updatedAudit));

    return true;
  };

  // Admin recharge operation
  const handleRechargeUser = (userId: string, amount: number) => {
    if (userId === 'u-guest') {
      const guestTrial: UserProfile = {
        id: 'u-guest',
        email: 'guest@cultureos.com',
        name: '游客演示账号 (Guest Demo)',
        role: 'user', // Promoted to 'user' so they can trigger runs
        remainingQuota: amount,
        maxQuota: amount,
        regDate: new Date().toISOString().split('T')[0],
        businessDomain: '出海极客企业 (Pioneer Inc)',
        purpose: '新手通关奖励体验额度'
      };
      saveCurrentUser(guestTrial);
      return;
    }

    const updatedUsers = usersList.map(u => {
      if (u.id === userId) {
        const remainingQuota = u.role === 'admin' ? 999999 : Math.min(u.maxQuota + amount, u.remainingQuota + amount);
        const maxQuota = u.role === 'admin' ? 999999 : u.maxQuota + amount;
        return {
          ...u,
          remainingQuota,
          maxQuota
        };
      }
      return u;
    });

    setUsersList(updatedUsers);
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(updatedUsers));

    // Update currentUser if modified
    const matched = updatedUsers.find(u => u.id === currentUser?.id);
    if (matched) {
      saveCurrentUser(matched);
    }

    // Create log
    const targetUser = usersList.find(u => u.id === userId);
    if (targetUser) {
      const audit: QuotaAuditLog = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        userId: userId,
        userEmail: targetUser.email,
        action: `管理员重新分配/补充额度 (${amount})`,
        amount: amount,
        remainingAfter: targetUser.remainingQuota + amount
      };
      const updatedAudit = [audit, ...auditLogs];
      setAuditLogs(updatedAudit);
      localStorage.setItem(`${STORAGE_PREFIX}audit`, JSON.stringify(updatedAudit));
    }
  };

  // Submit Upgrade Request from customer
  const handleSubmitUpgradeRequest = (requestedAmount: number, message: string) => {
    if (!currentUser) return;

    const newRequest: QuotaRequest = {
      id: `req-${Date.now()}`,
      userEmail: currentUser.email,
      userName: currentUser.name,
      requestedAmount,
      message,
      status: 'pending',
      timestamp: new Date().toLocaleString()
    };

    const updated = [newRequest, ...upgradeRequests];
    setUpgradeRequests(updated);
    localStorage.setItem(`${STORAGE_PREFIX}requests`, JSON.stringify(updated));
  };

  // Admin handles upgrade requests
  const handleProcessUpgradeRequest = (requestId: string, approve: boolean) => {
    const request = upgradeRequests.find(r => r.id === requestId);
    if (!request) return;

    const updated = upgradeRequests.map(r => {
      if (r.id === requestId) {
        return { ...r, status: approve ? ('approved' as const) : ('rejected' as const) };
      }
      return r;
    });
    setUpgradeRequests(updated);
    localStorage.setItem(`${STORAGE_PREFIX}requests`, JSON.stringify(updated));

    if (approve) {
      // Find user and add quota
      const user = usersList.find(u => u.email === request.userEmail);
      if (user) {
        handleRechargeUser(user.id, request.requestedAmount);
      }
    }
  };

  // Custom live update profile action
  const handleUpdateUserProfile = (userId: string, updates: Partial<UserProfile>) => {
    const updatedUsers = usersList.map(u => {
      if (u.id === userId) {
        // Safe casting/merging
        const nextUser = { ...u, ...updates };
        if (updates.remainingQuota !== undefined) {
          nextUser.remainingQuota = Math.max(0, updates.remainingQuota);
        }
        if (updates.maxQuota !== undefined) {
          nextUser.maxQuota = Math.max(0, updates.maxQuota);
        }
        return nextUser;
      }
      return u;
    });

    setUsersList(updatedUsers);
    localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(updatedUsers));

    // If current logged-in user is updated, sync their details
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates };
      if (updates.remainingQuota !== undefined) {
        updatedUser.remainingQuota = Math.max(0, updates.remainingQuota);
      }
      if (updates.maxQuota !== undefined) {
        updatedUser.maxQuota = Math.max(0, updates.maxQuota);
      }
      saveCurrentUser(updatedUser);
    }

    // Add an audit log of this live administrative manipulation
    const audit: QuotaAuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString().slice(0, 5),
      userId: userId,
      userEmail: currentUser?.email || 'admin@cultureos.com',
      action: `管理员通过账号中心实时篡改/修正档案信息 (${Object.keys(updates).join(', ')})`,
      amount: updates.remainingQuota !== undefined ? (updates.remainingQuota - (currentUser?.remainingQuota || 0)) : 0,
      remainingAfter: updates.remainingQuota !== undefined ? updates.remainingQuota : (currentUser?.remainingQuota || 0)
    };
    const updatedAudit = [audit, ...auditLogs];
    setAuditLogs(updatedAudit);
    localStorage.setItem(`${STORAGE_PREFIX}audit`, JSON.stringify(updatedAudit));
  };

  return {
    currentUser,
    usersList,
    auditLogs,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authView,
    setAuthView,
    quotaExceededModalOpen,
    setQuotaExceededModalOpen,
    upgradeRequests,
    handleLogin,
    handleRegister,
    handleGuestLogin,
    handleLogout,
    handleCheckAndConsumeQuota,
    handleRechargeUser,
    handleSubmitUpgradeRequest,
    handleProcessUpgradeRequest,
    handleUpdateUserProfile
  };
}

// =============================================================
// SUB-COMPONENT: PORTABLE STATS BADGE & ROLE LABEL (AVATAR)
// =============================================================
export function AuthQuotaControl({
  currentUser,
  onLoginClick,
  onLogout,
  onAvatarClick,
  isZh
}: {
  currentUser: UserProfile | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onAvatarClick?: () => void;
  isZh: boolean;
}) {
  const isAdmin = currentUser?.role === 'admin';
  const isGuest = currentUser?.role === 'guest';

  return (
    <div 
      className="relative flex items-center justify-center shrink-0" 
      id="user-avatar-container"
      onClick={onAvatarClick}
    >
      <div className={`relative w-8 h-8 rounded-full bg-gradient-to-tr p-[1.5px] shadow-lg cursor-pointer select-none transition-transform hover:scale-105 ${
        isAdmin 
          ? 'from-amber-400 to-orange-500 shadow-amber-500/10' 
          : isGuest 
            ? 'from-emerald-400 to-teal-500 shadow-teal-500/10' 
            : 'from-cyan-400 to-blue-600 shadow-cyan-500/10'
      }`}>
        <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {isAdmin ? (
            <Shield className="w-4.5 h-4.5 text-amber-400 animate-pulse" />
          ) : isGuest ? (
            <Compass className="w-4.5 h-4.5 text-emerald-400" />
          ) : (
            <User className="w-4.5 h-4.5 text-cyan-400" />
          )}
        </div>
      </div>
      {/* Small Active Status Dot */}
      <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0c1322] animate-pulse" />
    </div>
  );
}

// =============================================================
// SUB-COMPONENT: REVOLUTIONARY OVERALL ACCOUNT DESIGN MANAGER
// =============================================================
export function AccountManagerModal({
  isOpen,
  onClose,
  currentUser,
  usersList,
  onSwitchUser,
  onUpdateUserProfile,
  onLogout,
  onNavigateToAdmin,
  isZh
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  usersList: UserProfile[];
  onSwitchUser: (email: string) => { success: boolean; error?: string };
  onUpdateUserProfile: (userId: string, updates: Partial<UserProfile>) => void;
  onLogout: () => void;
  onNavigateToAdmin?: () => void;
  isZh: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDomain, setEditedDomain] = useState('');
  const [editedPurpose, setEditedPurpose] = useState('');
  const [editedQuota, setEditedQuota] = useState<number>(0);
  const [editedRole, setEditedRole] = useState<'admin' | 'user' | 'guest'>('user');
  
  const [customRegisterOpen, setCustomRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDomain, setRegDomain] = useState('ebike');
  const [regPurpose, setRegPurpose] = useState('');
  const [regError, setRegError] = useState('');

  // Sync edits on load/change
  useEffect(() => {
    if (currentUser) {
      setEditedName(currentUser.name);
      setEditedDomain(currentUser.businessDomain || '');
      setEditedPurpose(currentUser.purpose || '');
      setEditedQuota(currentUser.remainingQuota);
      setEditedRole(currentUser.role);
    }
    setCustomRegisterOpen(false);
    setRegError('');
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUserProfile(currentUser.id, {
      name: editedName,
      businessDomain: editedDomain,
      purpose: editedPurpose,
      remainingQuota: editedQuota,
      role: editedRole,
      maxQuota: Math.max(editedQuota, currentUser.maxQuota)
    });
    setIsEditing(false);
  };

  const handleAddCreditsDirectly = (amount: number) => {
    onUpdateUserProfile(currentUser.id, {
      remainingQuota: currentUser.remainingQuota + amount,
      maxQuota: Math.max(currentUser.maxQuota, currentUser.remainingQuota + amount)
    });
  };

  const triggerQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName || !regEmail || !regPurpose) {
      setRegError(isZh ? '请完整填写注册资料' : 'Please complete all fields');
      return;
    }
    if (usersList.some(u => u.email.toLowerCase() === regEmail.toLowerCase().trim())) {
      setRegError(isZh ? '该邮箱已注册，可以直接一键切换！' : 'Email already registered!');
      return;
    }

    // Call switch with simulation
    const newId = `u-${Date.now()}`;
    const newUser: UserProfile = {
      id: newId,
      email: regEmail.trim().toLowerCase(),
      name: regName,
      role: 'user',
      remainingQuota: 5,
      maxQuota: 5,
      regDate: new Date().toISOString().split('T')[0],
      businessDomain: regDomain,
      purpose: regPurpose
    };

    // Store custom user in general list manually by tricking update or through a registration simulation
    // Since we want simple, we will just register this user through updates
    onUpdateUserProfile(newId, newUser);
    onSwitchUser(newUser.email);
    setCustomRegisterOpen(false);
    setRegName('');
    setRegEmail('');
    setRegPurpose('');
  };

  const isAdmin = currentUser.role === 'admin';
  const isGuest = currentUser.role === 'guest';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0b1220] border border-cyan-500/20 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Header Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                {isZh ? '❖ 账号设计控制中心' : '❖ Sandbox Account Hub'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isZh ? '免登入随时切换环境、修改角色与实时调整算力余额' : 'Change roles, adjust credits, and toggle user profiles on the fly.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition p-1 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Scroll Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-sans">
          
          {/* Section 1: ACTIVE LIVE CARD */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-7 space-y-3">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                {isZh ? '● 当前激活会话' : '● Live Active Session'}
              </span>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/5 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">{isZh ? '姓名/企业名' : 'Name/Enterprise'}</label>
                    <input
                      required
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-sans text-xs focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">{isZh ? '所属角色' : 'Role'}</label>
                      <select
                        value={editedRole}
                        onChange={(e) => setEditedRole(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 text-xs focus:outline-none"
                      >
                        <option value="admin">{isZh ? '系统管理员' : 'Platform Admin'}</option>
                        <option value="user">{isZh ? '出海商家' : 'Active Merchant'}</option>
                        <option value="guest">{isZh ? '只读游客' : 'Guest Viewer'}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold block">{isZh ? '算力余额' : 'Credits Limit'}</label>
                      <input
                        type="number"
                        value={editedQuota}
                        onChange={(e) => setEditedQuota(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-mono text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">{isZh ? '主营行业大类' : 'Vertical Category'}</label>
                    <input
                      required
                      type="text"
                      value={editedDomain}
                      onChange={(e) => setEditedDomain(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 font-sans text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">{isZh ? '全球化诉求简述' : 'Scaling Goal'}</label>
                    <textarea
                      required
                      rows={2}
                      value={editedPurpose}
                      onChange={(e) => setEditedPurpose(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-slate-100 font-sans text-xs focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-1 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 rounded border border-slate-800 hover:text-white text-slate-400 cursor-pointer"
                    >
                      {isZh ? '取消' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1 rounded bg-cyan-500 hover:bg-cyan-600 font-bold text-slate-950 cursor-pointer"
                    >
                      {isZh ? '保存修改' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={`p-5 rounded-2xl border bg-slate-950/40 relative overflow-hidden space-y-4 ${
                  isAdmin 
                    ? 'border-amber-500/30 shadow-lg shadow-amber-500/5' 
                    : isGuest 
                      ? 'border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                      : 'border-cyan-500/20 shadow-lg shadow-cyan-500/5'
                }`}>
                  {/* Glassmorphic background glow decor */}
                  <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full blur-2xl opacity-10 ${
                    isAdmin ? 'bg-amber-400' : isGuest ? 'bg-emerald-400' : 'bg-cyan-400'
                  }`} />

                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{currentUser.name}</span>
                        {isAdmin ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-400 font-extrabold uppercase animate-pulse">ADMIN</span>
                        ) : isGuest ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15 text-[9px] font-mono text-emerald-400 font-black">GUEST</span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/15 text-[9px] font-mono text-cyan-400 font-black">CLIENT</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-450 hover:text-cyan-400 hover:bg-slate-900 transition cursor-pointer"
                      title={isZh ? '实时修改档案' : 'Edit Profile'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-900 py-3 font-sans">
                    <div>
                      <span className="text-slate-500 text-[10px] block">{isZh ? '主营出海行业大类' : 'Vertical Category'}</span>
                      <span className="text-slate-350 text-xs font-bold block mt-0.5">
                        {currentUser.businessDomain || (isZh ? '未绑定品类' : 'N/A')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">{isZh ? '本轮出海核心诉求' : 'Enterprise Goal'}</span>
                      <span className="text-slate-350 text-xs font-bold block mt-0.5 truncate max-w-[150px]" title={currentUser.purpose}>
                        {currentUser.purpose || (isZh ? '无全局描述' : 'N/A')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 text-[10px] block">{isZh ? '智能创意算力余额 (Credits)' : 'AI Credits Quota'}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-lg font-black ${currentUser.remainingQuota === 0 ? 'text-red-400' : 'text-cyan-400'}`}>
                          {isAdmin ? '♾️' : currentUser.remainingQuota}
                        </span>
                        {!isAdmin && (
                          <span className="text-slate-500 font-mono text-xs">/ {currentUser.maxQuota}</span>
                        )}
                        <span className="text-[10px] text-slate-400 ml-1">
                          {isAdmin ? (isZh ? '无限制配额' : 'Infinite') : (isZh ? '可用次数' : 'Left')}
                        </span>
                      </div>
                    </div>

                    {!isAdmin && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAddCreditsDirectly(10)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] transition cursor-pointer"
                        >
                          +10 Credits
                        </button>
                        <button
                          onClick={() => handleAddCreditsDirectly(50)}
                          className="px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-300 font-extrabold text-[10px] transition cursor-pointer"
                        >
                          +50 Credits
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick description guidelines */}
            <div className="md:col-span-5 space-y-4">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                {isZh ? '💡 账号机制说明' : '💡 Account Sandbox Notes'}
              </span>

              <div className="p-4 rounded-xl border border-slate-850 bg-slate-900/10 space-y-3 leading-relaxed text-slate-400 text-[11px] select-none">
                <p>
                  {isZh 
                    ? '1. 本系统通过 LocalStorage 提供真实、持久的用户沙盒隔离。当算力归零后，调用创意生成等高能操作将触发扩容弹窗。' 
                    : '1. True persistence backed by local browser sandbox environments.'}
                </p>
                <p>
                  {isZh 
                    ? '2. 您可以直接在此对当前账号进行 [算力直接充值]，无需繁琐的后端数据配置，极速体验大区适配！' 
                    : '2. Instant quick credit injection eliminates database configuration wait times.'}
                </p>
                <p>
                  {isZh 
                    ? '3. 出海瑞鹿电器 (3余额)、东方茗风冷泡茶 (0余额) 是预置的演示商家，随时切换进行调试体验。' 
                    : '3. Pre-seeded client scenarios feature specific trial limitations.'}
                </p>
              </div>

              {currentUser.role === 'admin' && onNavigateToAdmin && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToAdmin();
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-300 font-black transition cursor-pointer flex items-center justify-center gap-1.5 text-xs shadow-sm"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isZh ? '前往系统超级控制台 (审批/日志)' : 'Go to Administrator Dashboard'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: SANDBOX PROFILE SWITCHER */}
          <div className="space-y-3 border-t border-slate-900 pt-5">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
              {isZh ? '❖ 一键切换沙盒预设账号 (快速切换商户环境)' : '❖ Instant Sandbox Account Selector'}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {usersList.map((usr) => {
                const isActive = currentUser.id === usr.id;
                const usrIsAdmin = usr.role === 'admin';
                const usrIsGuest = usr.role === 'guest';

                return (
                  <div 
                    key={usr.id}
                    onClick={() => {
                      onSwitchUser(usr.email);
                    }}
                    className={`p-4 rounded-xl border transition cursor-pointer select-none relative group text-left ${
                      isActive 
                        ? 'bg-[#14233c] border-cyan-500/40 text-cyan-300 shadow shadow-cyan-500/5' 
                        : 'bg-slate-950/40 border-slate-850 hover:border-slate-700 hover:bg-slate-900/40 text-slate-350'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-extrabold ${isActive ? 'text-white' : 'text-slate-200'}`}>{usr.name}</span>
                          {usrIsAdmin ? (
                            <span className="px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] text-amber-400 font-extrabold font-mono">ADMIN</span>
                          ) : usrIsGuest ? (
                            <span className="px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/15 text-[8px] text-emerald-400 font-bold font-mono">GUEST</span>
                          ) : (
                            <span className="px-1 py-0.2 rounded bg-cyan-500/10 border border-cyan-500/15 text-[8px] text-cyan-400 font-bold font-mono">CLIENT</span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-slate-500 font-mono block">{usr.email}</span>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono text-xs font-black block ${
                          usrIsAdmin ? 'text-amber-400' : usr.remainingQuota === 0 ? 'text-red-400' : 'text-cyan-400'
                        }`}>
                          {usrIsAdmin ? '♾️' : `${usr.remainingQuota} / ${usr.maxQuota}`}
                        </span>
                        <span className="text-[8px] text-slate-500 block uppercase font-mono tracking-widest">{isZh ? '配额' : 'Credits'}</span>
                      </div>
                    </div>

                    {usr.businessDomain && (
                      <p className="text-[10px] text-slate-450 mt-1.5 font-sans leading-relaxed truncate group-hover:text-slate-300 transition">
                        {isZh ? '品类：' : 'Vertical: '} <span className="italic">{usr.businessDomain}</span>
                      </p>
                    )}

                    {/* Check indicator */}
                    {isActive && (
                      <div className="absolute top-1.5 right-1.5 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[8px] font-bold px-1 rounded uppercase">
                        {isZh ? '当前在线' : 'Online'}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Guest account pre-seeded card explicitly */}
              {!usersList.some(u => u.email === 'guest@cultureos.com') && (
                <div 
                  onClick={() => {
                    const guestUser: UserProfile = {
                      id: 'u-guest',
                      email: 'guest@cultureos.com',
                      name: '游客演示账号 (Guest Demo)',
                      role: 'guest',
                      remainingQuota: 0,
                      maxQuota: 0,
                      regDate: new Date().toISOString().split('T')[0],
                      businessDomain: '只读演示企业 (ReadOnly Inc)',
                      purpose: '预览体验大区适配、AI工作坊和出海方案演示'
                    };
                    onUpdateUserProfile('u-guest', guestUser);
                    onSwitchUser('guest@cultureos.com');
                  }}
                  className={`p-4 rounded-xl border transition cursor-pointer select-none text-left ${
                    currentUser.id === 'u-guest'
                      ? 'bg-[#14233c] border-cyan-500/40 text-cyan-300 shadow shadow-cyan-500/5' 
                      : 'bg-slate-950/40 border-slate-850 hover:border-slate-700 hover:bg-slate-900/40 text-slate-350'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-white">{isZh ? '游客演示账号' : 'Guest Demo Account'}</span>
                        <span className="px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/15 text-[8px] text-emerald-400 font-bold font-mono">GUEST</span>
                      </div>
                      <span className="text-[9.5px] text-slate-500 font-mono block">guest@cultureos.com</span>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-black text-slate-500 block">0</span>
                      <span className="text-[8px] text-slate-500 block uppercase font-mono tracking-widest">{isZh ? '配额' : 'Credits'}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-450 mt-1.5 truncate">
                    {isZh ? '免注册只读演示，适合快速巡查适配成品' : 'Read-only trial with zero registration barrier.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: SIMULATED REGISTRATION ON-THE-FLY */}
          <div className="space-y-3.5 border-t border-slate-900 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                {isZh ? '❖ 快速新建个性化出海商户 (Simulate New Merchant Setup)' : '❖ Simulate New Merchant Profile'}
              </span>

              <button
                onClick={() => setCustomRegisterOpen(!customRegisterOpen)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{customRegisterOpen ? (isZh ? '收起面板' : 'Collapse') : (isZh ? '展开自主建档' : 'Expand Setup')}</span>
              </button>
            </div>

            {customRegisterOpen && (
              <form onSubmit={triggerQuickRegister} className="p-4 rounded-xl border border-slate-850 bg-slate-950/30 space-y-3.5 text-left animate-fade-in">
                {regError && (
                  <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px]">
                    {regError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">{isZh ? '商户主体/企业名称' : 'Merchant Name'}</label>
                    <input
                      required
                      type="text"
                      placeholder="例如：极客骑行智能科技"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">{isZh ? '商户绑定邮箱' : 'Merchant Email'}</label>
                    <input
                      required
                      type="email"
                      placeholder="client@e-bike.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">{isZh ? '主营行业大类' : 'Product Category'}</label>
                    <select
                      value={regDomain}
                      onChange={(e) => setRegDomain(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-slate-200 focus:outline-none cursor-pointer"
                    >
                      <option value="🧸 智能宠物电器">{isZh ? "🧸 智能温控宠物电器" : "Pet Tech Accessories"}</option>
                      <option value="⚡ 强续航低碳智能电动车">{isZh ? "⚡ 强续航低碳智能电动车" : "Carbon Low E-Bike"}</option>
                      <option value="🍵 东方古方草本茶">{isZh ? "🍵 东方古方草本茶" : "Herbal Oriental Tea"}</option>
                      <option value="🔊 降噪数字音频耳机">{isZh ? "🔊 降噪数字音频耳机" : "Acoustic Headphones"}</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">{isZh ? '拟攻坚的海外市场与核心目标' : 'Core Scaling Goal'}</label>
                    <input
                      required
                      type="text"
                      placeholder="例如：主攻北美TikTok红人营销，提升点击转化率"
                      value={regPurpose}
                      onChange={(e) => setRegPurpose(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 font-black text-slate-950 flex items-center gap-1.5 cursor-pointer shadow-md transition"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isZh ? '立即一键建档并以该身份登入' : 'Create & Login as Merchant'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Footer actions bar */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/80 flex items-center justify-between select-none">
          <p className="text-[10px] text-slate-500">
            {isZh ? '所有修改均在本地沙盒环境内永久存储' : 'All transactions are written safely into the client database.'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 font-extrabold cursor-pointer transition flex items-center gap-1 text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isZh ? '退出当前账号' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// =============================================================
// SUB-COMPONENT: RECHARGE / UPGRADE LIMIT EXCEEDED MODAL

// =============================================================
export function QuotaExceededModal({
  isOpen,
  onClose,
  onSubmitRequest,
  onSignUpClick,
  currentUser,
  isZh
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (amount: number, message: string) => void;
  onSignUpClick?: () => void;
  currentUser: UserProfile | null;
  isZh: boolean;
}) {
  const [requestedAmount, setRequestedAmount] = useState<number>(10);
  const [message, setMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !currentUser) return null;

  if (currentUser.role === 'guest') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-[#0b1220] border border-amber-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
          
          {/* Banner header icon */}
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/25 p-5 border-b border-amber-500/10 text-center space-y-1 relative">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/35 flex items-center justify-center text-amber-300 mx-auto animate-pulse">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white mt-3">
              {isZh ? '🔒 只读演示模式受限' : 'Read-Only Demo Mode'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isZh ? '您当前处于 [游客演示] 状态，此操作需要调用大语言模型算力队列。' : 'You are browsing in Guest Viewer state.'}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-350 leading-relaxed">
              {isZh 
                ? '出海商家 AI 工作流协同编排、智能文案生成及规则进化的操作需要绑定真实的商户档案及算力指标。目前您可以任意查看各大区预设的适配交割物。' 
                : 'Interactive agent pipeline simulations are restricted for guest previews under read-only parameters.'}
            </p>
            
            <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/15 leading-relaxed text-amber-400 text-xs text-center font-bold font-sans">
              {isZh ? '💡 限时优惠：一键免费建档立即赠送 5 次免费调用配额' : 'Register now for 5 complimentary system access credits.'}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-800 hover:text-slate-200 cursor-pointer text-slate-400 font-bold transition text-xs"
              >
                {isZh ? '继续只读体验' : 'Read-Only Preview'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSignUpClick) onSignUpClick();
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 cursor-pointer text-slate-950 font-black flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/10 transition text-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-950" />
                <span>{isZh ? '立即免费注册建档' : 'Create Profile'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest(requestedAmount, message || (isZh ? '请求为项目扩容，以便生成更多大区包装。' : 'Requesting quota booster for production runs.'));
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0b1220] border border-cyan-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Banner header icon */}
        <div className="bg-gradient-to-r from-red-500/25 to-amber-500/25 p-5 border-b border-red-500/10 text-center space-y-1 relative">
          <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto animate-bounce">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-white mt-3">
            {isZh ? '🚀 免费算力额度已用尽' : 'Adoption Quota Exhausted'}
          </h3>
          <p className="text-[11px] text-slate-400">
            {isZh ? '普通体验账号默认配额已消耗。请求管理员扩容以解锁全球化生产。' : 'Experience account free trial credit has run out.'}
          </p>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
              <p className="text-sm font-bold text-slate-100">{isZh ? '扩容请求已呈报管理员！' : 'Booster request submitted!'}</p>
              <p className="text-xs text-slate-400 font-sans">{isZh ? '管理员账号可以直接进行全局管理审批。您也可以一键切换至管理账号完成充值！' : 'Switch accounts to the administrator panel or wait for approval.'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900 leading-relaxed text-slate-350 select-none">
                <span className="font-bold text-slate-200">{isZh ? '当前账号：' : 'Account: '}</span>
                {currentUser.name} <span className="text-slate-500">({currentUser.email})</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">{isZh ? '申请追加算力大礼包 (Credits)' : 'Booster Size'}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRequestedAmount(num)}
                      className={`py-2 rounded-xl border text-xs font-bold font-mono transition cursor-pointer ${
                        requestedAmount === num
                          ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                          : 'bg-slate-900 border-slate-850 text-slate-400'
                      }`}
                    >
                      +{num} {isZh ? '个创意' : 'Crs'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold">{isZh ? '拟出海业务背景及申请理由' : 'Enterprise Rationale'}</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isZh ? "描述您的出海竞品诉求（例如：我们是智能宠物碗品牌，希望适配北美Tiktok，需要10次创意额度...）" : "Type your scaling context..."}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/40 resize-none font-sans"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-850/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 hover:text-slate-200 cursor-pointer text-slate-400 font-bold transition"
                >
                  {isZh ? '取消' : 'Dismiss'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 cursor-pointer text-slate-950 font-black flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/10 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isZh ? '提交申请' : 'Request Booster'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// SUB-COMPONENT: LOGIN & REGISTRATION OVERLAY
// =============================================================
export function AuthModal({
  isOpen,
  onClose,
  view,
  setView,
  onLogin,
  onRegister,
  onGuestLogin,
  isZh
}: {
  isOpen: boolean;
  onClose: () => void;
  view: 'login' | 'signup' | 'profile';
  setView: (v: 'login' | 'signup' | 'profile') => void;
  onLogin: (email: string) => { success: boolean; error?: string };
  onRegister: (name: string, email: string, businessDomain: string, purpose: string) => { success: boolean; error?: string };
  onGuestLogin: () => void;
  isZh: boolean;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('ebike');
  const [customDomain, setCustomDomain] = useState('');
  const [purpose, setPurpose] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Verification Code state loops
  const [signupStep, setSignupStep] = useState<'profile' | 'otp'>('profile');
  const [loginStep, setLoginStep] = useState<'email' | 'otp'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Sync and reset internal view steps
  useEffect(() => {
    setSignupStep('profile');
    setLoginStep('email');
    setOtpCode('');
    setSentOtp('');
    setErrorMsg('');
    setCountdown(0);
  }, [view, isOpen]);

  // Countdown tick
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  // Trigger signup OTP
  const handleRequestRegisterOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const finalDomain = domain === 'custom' ? customDomain : domain;
    if (!name || !email || !finalDomain || !purpose) {
      setErrorMsg(isZh ? '请将出海商家资料填写完整。' : 'Please complete all registration fields.');
      return;
    }

    // Generate random 6 digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(code);
    setSignupStep('otp');
    setCountdown(60);
  };

  // Verify and submit registration
  const handleRegisterVerifyAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode.trim() !== sentOtp) {
      setErrorMsg(isZh ? '激活码校验不匹配，请输入框上模拟接收的 6 位验证码。' : 'Incorrect activation code entered.');
      return;
    }

    const finalDomain = domain === 'custom' ? customDomain : domain;
    const res = onRegister(name, email, finalDomain, purpose);
    if (res.success) {
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        onClose();
        // Reset states
        setName('');
        setEmail('');
        setCustomDomain('');
        setPurpose('');
        setSignupStep('profile');
      }, 1500);
    } else {
      setErrorMsg(res.error || '');
    }
  };

  // Trigger passwordless login OTP
  const handleRequestLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg(isZh ? '请输入注册绑定的邮箱。' : 'Please enter registered email.');
      return;
    }

    // Generate random 6 digit login OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtp(code);
    setLoginStep('otp');
    setCountdown(60);
  };

  // Verify login code
  const handleLoginVerifyAndSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode.trim() !== sentOtp) {
      setErrorMsg(isZh ? '验证码校验错误，请输入绿底条上的 6 位数字激活登录。' : 'Incorrect verification code.');
      return;
    }

    const res = onLogin(email);
    if (res.success) {
      onClose();
      setEmail('');
      setLoginStep('email');
    } else {
      setErrorMsg(res.error || '');
    }
  };

  const loadPresetAccount = (targetEmail: string) => {
    setEmail(targetEmail);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0b1220] border border-cyan-500/20 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 font-bold transition duration-200"
        >
          ✕
        </button>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-5">
          <div className="text-center space-y-1.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-900 shadow-md shadow-cyan-500/10 mx-auto">
              {view === 'login' ? <Key className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
            </div>
            <h3 className="text-lg font-black text-white mt-3">
              {view === 'login' ? (isZh ? '出海商户身份登录' : 'Client Access Port') : (isZh ? '新商户多层激活建档' : 'Register Merchant Profile')}
            </h3>
            <p className="text-slate-400 text-xs font-sans">
              {isZh 
                ? 'CultureOS 提供管理员全局审批与普通商家的配额算力保障。' 
                : 'Interactive sandbox featuring mock mail service handles fast OTP.'}
            </p>
          </div>

          {regSuccess ? (
            <div className="text-center py-8 space-y-3 animate-fade-in">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
              <p className="text-sm font-bold text-white">{isZh ? '商家激活建档成功！' : 'Client Activated Successfully!'}</p>
              <p className="text-xs text-slate-400">{isZh ? '系统已自动核发 5 次免费创意体验配额，已为您进入智能工作台。' : '5 Trial credits assigned to your active panel.'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Error alerts */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-2 animate-shake text-xs">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Simulated Mailbox Alert / Floating OTP tray */}
              {sentOtp && (signupStep === 'otp' || loginStep === 'otp') && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-1 font-mono">
                  <div className="flex items-center gap-2 font-bold font-sans">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>📩 {isZh ? '【系统虚拟邮箱激活中心】' : '【CultureOS Verification Mailbox】'}</span>
                  </div>
                  <p className="text-slate-200">
                    {isZh ? '一封带有 6 位数字验证码的激活邮件已成功发送。模拟激活码为：' : 'Assigned secure test OTP verification token is: '}
                    <span className="text-emerald-400 font-extrabold text-sm underline block mt-0.5 mt-1">{sentOtp}</span>
                  </p>
                </div>
              )}

              {/* 1. LOGIN MODE VIEWS */}
              {view === 'login' && (
                <div className="space-y-3.5">
                  {loginStep === 'email' ? (
                    <form onSubmit={handleRequestLoginOtp} className="space-y-3.5 text-xs font-sans">
                      <div className="space-y-1.5">
                        <label className="text-slate-400 font-bold">{isZh ? '账号注册邮箱' : 'Account Email'}</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 text-slate-500 w-4 h-4" />
                          <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="请输入绑定的企业邮箱"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-cyan-500/40 font-mono transition"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 font-extrabold cursor-pointer text-slate-950 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isZh ? '获取邮箱登录验证码' : 'Send Verification OTP'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleLoginVerifyAndSubmit} className="space-y-3.5 text-xs font-sans">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[#94a3b8] font-bold">{isZh ? '输入 6 位数邮箱验证码' : 'Verification OTP Code'}</label>
                        <input
                          required
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="******"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none text-center font-mono text-lg font-black tracking-widest focus:border-cyan-500"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setLoginStep('email'); setSentOtp(''); }}
                          className="px-4 py-3 rounded-xl border border-slate-800 hover:text-slate-200 cursor-pointer text-slate-400 font-bold transition text-xs"
                        >
                          {isZh ? '返回' : 'Back'}
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 font-extrabold cursor-pointer text-slate-950 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 transition text-xs"
                        >
                          <LogIn className="w-3.5 h-3.5 text-slate-950" />
                          <span>{isZh ? '验证并激活账号登录' : 'Verify & Login'}</span>
                        </button>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          disabled={countdown > 0}
                          onClick={() => {
                            const code = Math.floor(100000 + Math.random() * 900000).toString();
                            setSentOtp(code);
                            setCountdown(60);
                          }}
                          className="text-[10px] text-slate-450 hover:text-cyan-400 disabled:opacity-50 cursor-pointer"
                        >
                          {countdown > 0 ? (isZh ? `重新发送 (${countdown}s)` : `Resend in ${countdown}s`) : (isZh ? '重新获取验证码' : 'Resend Code')}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Seed Preset Accounts Info Tip */}
                  <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-900 text-[10px] text-slate-400 font-sans leading-relaxed">
                    <span className="text-amber-400 font-bold block mb-1">💡 {isZh ? '系统演示环境预设测试账号：' : 'Sandbox Demo Accounts:'}</span>
                    <ul className="list-disc pl-4 space-y-1 font-mono text-slate-300">
                      <li>{isZh ? '标准演示商户：' : 'Merchant Standard Account: '}demo@cultureos.com</li>
                      <li>{isZh ? '系统超级管理员：' : 'Super Administrator Account: '}admin@cultureos.com</li>
                    </ul>
                    <p className="mt-2.5 opacity-80 text-[9.5px]">
                      {isZh ? '请在上方账号邮箱字段中【手动输入】对应地址并提交。系统将自动向您在下方呈现专门生成的 6 位数字验证码，以供极速验证登录。' : 'Please manually enter either account address above. The system dynamic mailbox will intercept the routing and output the corresponding 6-digit code for activation.'}
                    </p>
                  </div>
                </div>
              )}

              {/* 2. SIGNUP MODE VIEWS */}
              {view !== 'login' && (
                <div className="space-y-3.5">
                  {signupStep === 'profile' ? (
                    <form onSubmit={handleRequestRegisterOtp} className="space-y-3 text-xs font-sans">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold">{isZh ? '真实姓名 / 企业主体' : 'Name / Company'}</label>
                        <input
                          required
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={isZh ? "张三 / 智能航海科技" : "E.g. James / Oceanic Marine"}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500/40 font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold">{isZh ? '企业工作邮箱 (用以接收激活码)' : 'Work Email'}</label>
                        <input
                          required
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="client@company.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500/40 font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold">{isZh ? '产品主营垂直大类' : 'Product Category'}</label>
                        <select
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500/40 cursor-pointer"
                        >
                          <option value="pet_tech">{isZh ? "🧸 智能温控宠物电器" : "Pet Tech Accessories"}</option>
                          <option value="ebike">{isZh ? "⚡ 强续航低碳智能电动车 (E-Bike)" : "Carbon Low E-Bike"}</option>
                          <option value="herbal_tea">{isZh ? "🍵 东方古方高浓缩草本茶" : "Herbal Oriental Tea"}</option>
                          <option value="custom">{isZh ? "❖ 其它品类 (手动输入个性定制)" : "Custom Enterprise Category"}</option>
                        </select>
                      </div>

                      {domain === 'custom' && (
                        <div className="space-y-1 animate-fade-in">
                          <label className="text-slate-450">{isZh ? '个性大类简述' : 'Custom Category'}</label>
                          <input
                            required
                            type="text"
                            value={customDomain}
                            onChange={(e) => setCustomDomain(e.target.value)}
                            placeholder="降噪耳机 / 恒温睡袋"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold">{isZh ? '核心业务需求及全球化目标' : 'Global Rationale'}</label>
                        <textarea
                          required
                          rows={2}
                          value={purpose}
                          onChange={(e) => setPurpose(e.target.value)}
                          placeholder={isZh ? "例：攻坚欧美中产减压市场，以更具高级感的话术打入Tiktok流媒体，规避民族促销。" : "e.g., Reach EU urban young professionals with rich branding assets to boost CTR"}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-100 focus:outline-none focus:border-cyan-500/40 resize-none font-sans"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 mt-1.5 bg-cyan-500 hover:bg-cyan-600 font-extrabold cursor-pointer text-slate-950 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isZh ? '发送邮箱注册激活码' : 'Send Activation Code'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleRegisterVerifyAndSubmit} className="space-y-3.5 text-xs font-sans">
                      <div className="space-y-2 text-left">
                        <label className="text-[#94a3b8] font-bold">
                          {isZh ? '验证您的工作邮箱并激活账号' : 'Verify & Activate Your Email'}
                        </label>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-sans mt-0.5">
                          {isZh ? `我们已模拟向 ${email} 递送了企业秘钥激活邮件，请输写下方的 6 位激活秘钥完成注册和 5 额度兑换。` : `We simulated sending an activation token to ${email}.`}
                        </p>
                        <input
                          required
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="******"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mt-2 text-slate-100 focus:outline-none text-center font-mono text-lg font-black tracking-widest focus:border-cyan-500"
                        />
                      </div>

                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => { setSignupStep('profile'); setSentOtp(''); }}
                          className="px-4 py-3 rounded-xl border border-slate-800 hover:text-slate-200 cursor-pointer text-slate-400 font-bold transition text-xs"
                        >
                          {isZh ? '返回修改' : 'Back'}
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-600 font-extrabold cursor-pointer text-slate-950 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/10 transition text-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isZh ? '提交激活码并即刻启用' : 'Submit Code & Register'}</span>
                        </button>
                      </div>

                      <div className="text-center">
                        <button
                          type="button"
                          disabled={countdown > 0}
                          onClick={() => {
                            const code = Math.floor(100000 + Math.random() * 900000).toString();
                            setSentOtp(code);
                            setCountdown(60);
                          }}
                          className="text-[10px] text-slate-450 hover:text-cyan-400 disabled:opacity-50 cursor-pointer"
                        >
                          {countdown > 0 ? (isZh ? `重新发送 (${countdown}s)` : `Resend in ${countdown}s`) : (isZh ? '重新获取激活码' : 'Resend Code')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom direct Guest Explore Button */}
              <div className="pt-3 border-t border-slate-900 text-center select-none space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    onGuestLogin();
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 font-bold text-amber-300 text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow"
                >
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>{isZh ? '👁️ 以游客身份免注册直接看 Demo' : 'Explore Demo Immediately as Guest'}</span>
                </button>
                <p className="text-[10px] text-slate-500 max-w-[280px] mx-auto font-sans leading-relaxed">
                  {isZh ? '游客具有完整的视图浏览权限，无需填写任何账户信息或验证；但无法执行流程演算生成等操作。' : 'Guest has read-only privileges.'}
                </p>
              </div>

              {/* View Switcher toggle */}
              <div className="text-center pt-2 select-none border-t border-slate-950 text-[11px]">
                {view === 'login' ? (
                  <p className="text-slate-400">
                    {isZh ? '还没有商户账号？' : 'First time merchant? '}
                    <button
                      type="button"
                      onClick={() => setView('signup')}
                      className="text-cyan-400 font-bold hover:underline cursor-pointer ml-1"
                    >
                      {isZh ? '免费建档/注册' : 'Create Profile'}
                    </button>
                  </p>
                ) : (
                  <p className="text-slate-400">
                    {isZh ? '已有激活账号？' : 'Returning player? '}
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-cyan-400 font-bold hover:underline cursor-pointer ml-1"
                    >
                      {isZh ? '直接邮箱验证登录' : 'Sign In Now'}
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// =============================================================
// SUB-COMPONENT: FULL ADMINISTRATOR GLOBALS MANAGEMENT DASHBOARD
// =============================================================
export function AdminDashboardView({
  usersList,
  auditLogs,
  requests,
  onRecharge,
  onProcessRequest,
  isZh
}: {
  usersList: UserProfile[];
  auditLogs: QuotaAuditLog[];
  requests: QuotaRequest[];
  onRecharge: (userId: string, amount: number) => void;
  onProcessRequest: (requestId: string, approve: boolean) => void;
  isZh: boolean;
}) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'requests' | 'audit'>('users');
  const [rechargeAmounts, setRechargeAmounts] = useState<{[key: string]: number}>({});

  const handleChargeSubmit = (userId: string) => {
    const amount = rechargeAmounts[userId] || 5;
    onRecharge(userId, amount);
  };

  const handleAmtChange = (userId: string, val: number) => {
    setRechargeAmounts(prev => ({ ...prev, [userId]: val }));
  };

  return (
    <div className="space-y-6">
      
      {/* Intro Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-450 uppercase font-black">{isZh ? '系统总授权商家数' : 'Merchant Entities'}</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{usersList.length}</p>
          <span className="text-[10px] text-slate-500 font-sans block">{isZh ? '已分离的客户角色与沙盒隔离系统' : 'Isolated client-sandboxing records.'}</span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-450 uppercase font-black">{isZh ? '待处理扩容申请' : ' booser requests'}</span>
            <Clock className="w-4 h-4 text-amber-405 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-white">
            {requests.filter(r => r.status === 'pending').length}
          </p>
          <span className="text-[10px] text-slate-500 font-sans block">{isZh ? '亟待审批充值的爆款出海商户' : 'Awaiting super booster allocation.'}</span>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-450 uppercase font-black">{isZh ? '已扣减算力次数' : 'Credits Used'}</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">
            {auditLogs.filter(l => l.amount < 0).length}
          </p>
          <span className="text-[10px] text-slate-500 font-sans block">{isZh ? '包含视频脚本、霍夫斯泰德与RAG自进化' : 'Aggregated production operations.'}</span>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-[#141d2f]/40 border border-amber-500/10 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-400 uppercase font-black">{isZh ? '系统运行状态' : 'SYSTEM HEALTH'}</span>
            <Shield className="w-4 h-4 text-amber-450 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-white">NORMAL</p>
          <span className="text-[10px] text-slate-500 font-sans block">{isZh ? '沙盒与安全规则链正在运行' : 'API proxy is encrypted.'}</span>
        </div>
      </div>

      {/* Internal Navigation tabs */}
      <div className="flex border-b border-slate-800/60 pb-3 gap-4">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20 shadow shadow-cyan-500/5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isZh ? '商户档案与算力管控' : 'Registered Merchant Rosters'}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('requests')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative ${
            activeSubTab === 'requests'
              ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20 shadow shadow-cyan-500/5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isZh ? '体验额度追加审批' : 'Booster Applications'}</span>
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white min-w-4 h-4 rounded-full flex items-center justify-center font-black font-mono text-[9px] animate-pulse px-1">
              {requests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'audit'
              ? 'bg-[#14233c] text-cyan-300 border border-cyan-500/20 shadow shadow-cyan-500/5'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>{isZh ? '系统算力调度审计日志' : 'Operations Audit Records'}</span>
        </button>
      </div>

      {/* Sub Tabs views */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-100">{isZh ? "全局客户档案控制面板" : "Global User Registries"}</h4>
                <p className="text-[11px] text-slate-500">{isZh ? "管理员以此平台管理分配给普通用户的免费体验配额、注销或重新赋权。" : "Authorize new trial increments directly inside live state."}</p>
              </div>
            </div>

            {/* List */}
            <div className="border border-slate-800/80 rounded-2xl bg-slate-900/10 overflow-hidden divide-y divide-slate-800/60 font-sans text-xs">
              {usersList.map((usr) => (
                <div key={usr.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-950/20 transition">
                  <div className="space-y-1.5 max-w-md">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-white text-sm">{usr.name}</span>
                      <span className="font-mono text-slate-500 text-[10px]">{usr.email}</span>
                      {usr.role === 'admin' ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-400 font-extrabold uppercase">SUPER ADMIN</span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/15 text-[9px] font-mono text-cyan-400 font-black">CLIENT</span>
                      )}
                    </div>
                    {usr.businessDomain && (
                      <p className="text-slate-400 text-xs">
                        {isZh ? '主营：' : 'Vertical: '} <span className="text-slate-300 font-sans">{usr.businessDomain}</span>
                      </p>
                    )}
                    {usr.purpose && (
                      <p className="text-slate-400 text-xs">
                        {isZh ? '全球诉求：' : 'Core Goal: '} <span className="text-slate-400 italic font-sans">{usr.purpose}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-slate-550 font-mono">
                      {isZh ? '注册时间：' : 'Joined: '} {usr.regDate}
                    </p>
                  </div>

                  {/* Quota controller */}
                  <div className="flex items-center gap-4">
                    {usr.role !== 'admin' ? (
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-slate-400 font-mono text-xs">{isZh ? '当前余额：' : 'Credits Remaining:'}</span>
                          <span className={`font-mono text-sm font-black ${usr.remainingQuota <= 0 ? 'text-red-400' : 'text-cyan-400'}`}>{usr.remainingQuota}</span>
                          <span className="text-slate-500 font-mono">/ {usr.maxQuota}</span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex items-center gap-2 mt-1">
                          <select
                            onChange={(e) => handleAmtChange(usr.id, parseInt(e.target.value))}
                            className="bg-slate-900 border border-slate-800 text-[10px] rounded px-1.5 py-1 text-slate-200 focus:outline-none"
                            defaultValue={5}
                          >
                            <option value={5}>+5 Credits</option>
                            <option value={10}>+10 Credits</option>
                            <option value={20}>+20 Credits</option>
                          </select>
                          <button
                            onClick={() => handleChargeSubmit(usr.id)}
                            className="bg-cyan-500/25 border border-cyan-500/35 text-cyan-300 px-3 py-1 rounded text-[10px] font-black cursor-pointer hover:bg-cyan-500/40 active:opacity-80 transition"
                          >
                            {isZh ? '立即充值' : 'Recharge'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-slate-500 font-mono text-[10px] uppercase">
                        {isZh ? '♾️ 无限制管理员算力' : '♾️ UNLIMITED CAPACITY'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSubTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4 font-sans text-xs"
          >
            <div className="space-y-0.5 pb-2">
              <h4 className="text-sm font-bold text-slate-100">{isZh ? "商家扩容充值申请处理队列" : "Quota Booster Requests Queue"}</h4>
              <p className="text-[11px] text-slate-500">{isZh ? "普通商家额度消耗完毕后提交的追加算力大礼包申请，会在此通过安全审计实时呈报，可对其进行一键审批发放。" : "Approve client requests instantly to credit live limits."}</p>
            </div>

            {requests.length === 0 ? (
              <div className="border border-dashed border-slate-800 p-8 rounded-2xl text-center text-slate-500">
                {isZh ? '目前没有任何追加算力申请' : 'Clear! No pending applications found.'}
              </div>
            ) : (
              <div className="space-y-3.5">
                {requests.map((r) => (
                  <div key={r.id} className="border border-slate-800/80 rounded-2xl bg-slate-900/30 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{r.userName}</span>
                          <span className="text-[10px] font-mono text-slate-500">({r.userEmail})</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">申请提交时间：{r.timestamp}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-mono font-bold bg-[#14233c] px-2 py-0.5 rounded text-[10px]">
                          请求追加: +{r.requestedAmount} Credits
                        </span>
                        {r.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-bold">待审批</span>
                        ) : r.status === 'approved' ? (
                          <span className="px-2 py-0.5 rounded bg-green-500/10 border border-green-500/25 text-green-400 text-[10px] font-bold">已批准通过</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-bold">已驳回</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-900">
                      <p className="text-slate-300 leading-relaxed font-sans italic">“{r.message}”</p>
                    </div>

                    {r.status === 'pending' && (
                      <div className="flex justify-end gap-3.5 pt-1">
                        <button
                          onClick={() => onProcessRequest(r.id, false)}
                          className="px-4 py-2 border border-slate-800 rounded-xl hover:text-rose-400 cursor-pointer text-slate-400 font-bold transition text-[11px]"
                        >
                          {isZh ? '驳回申请' : 'Deny Application'}
                        </button>
                        <button
                          onClick={() => onProcessRequest(r.id, true)}
                          className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:opacity-90 active:opacity-85 text-slate-950 font-black cursor-pointer rounded-xl flex items-center gap-1 transition shadow-md shadow-amber-500/10 text-[11px]"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isZh ? '确认发放、立即扩容' : 'Grant Booster'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeSubTab === 'audit' && (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-100">{isZh ? "全局算力分配审计跟踪器" : "System Operations Logs"}</h4>
              <p className="text-[11px] text-slate-500">{isZh ? "实时记录普通用户与管理员在系统内核中的高危算力扣减和恢复操作，确保算力无损耗可追溯。" : "Secure immutable trail for account usage."}</p>
            </div>

            {/* Logs card */}
            <div className="border border-slate-800/80 rounded-2xl bg-slate-900/10 overflow-hidden text-xs">
              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-800/40 font-mono">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-slate-950/20 transition text-[11px]">
                    <span className="text-slate-550 select-none flex-shrink-0">[{log.timestamp}]</span>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">{log.userEmail}</span>
                        <span className="text-slate-500 select-none">|</span>
                        <span className="text-slate-200">{log.action}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <span className={`font-bold px-2 py-0.5 rounded-lg border font-mono ${
                        log.amount < 0 
                          ? 'bg-rose-500/5 border-rose-500/15 text-rose-450' 
                          : 'bg-emerald-500/5 border-emerald-500/15 text-emerald-450'
                      }`}>
                        {log.amount > 0 ? `+${log.amount}` : log.amount}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-1 font-sans">{isZh ? '余额' : 'Remain'}: {log.remainingAfter}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
