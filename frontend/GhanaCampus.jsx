import { useState, useEffect, useCallback, createContext, useContext, useMemo } from "react";
import {
  IoGridOutline, IoPeopleOutline, IoClipboardOutline, IoBarChartOutline,
  IoDocumentTextOutline, IoSchoolOutline, IoTimeOutline, IoCheckmarkCircleOutline,
  IoWalletOutline, IoChatbubbleEllipsesOutline, IoSettingsOutline, IoCalendarOutline,
  IoCardOutline, IoFolderOutline, IoNotificationsOutline, IoSearchOutline,
  IoLogOutOutline, IoMenuOutline, IoPersonCircleOutline, IoSunnyOutline,
  IoMoonOutline, IoRibbonOutline, IoCreateOutline, IoCalendarClearOutline,
  IoPersonAddOutline, IoHelpBuoyOutline, IoListCircleOutline,
  IoMailOutline, IoLockClosedOutline, IoChevronBackOutline, IoLogInOutline,
  IoEyeOutline, IoEyeOffOutline
} from "react-icons/io5";
import { supabase } from "./src/lib/supabaseClient.js";

// SETTINGS CONTEXT
const DEFAULT_SETTINGS = {
  systemName: "Campus Ghana", academicYear: "2023/2024", currentTerm: "Second Term",
  selectionDeadline: "2024-05-15", maxChoices: 7, schoolRegion: "All Regions",
  allowChanges: true, studentPortalOpen: true, emailNotifs: true, smsNotifs: false,
  maintenanceMode: false, showResultsToStudents: true, autoApproveSelections: false,
  locale: "en-GH", timezone: "Africa/Accra", currency: "GHS",
  supportEmail: "support@campusghana.edu.gh", supportPhone: "0240000000",
  sessionTimeoutMins: 30, passwordMinLength: 8, lockoutAttempts: 5,
  twoFactorAdmins: false, enforcePasswordRotation: false,
  backupFrequency: "daily", backupTime: "02:00", auditLogsEnabled: true,
  auditRetentionDays: 180, apiRateLimitPerMin: 120,
};
const SettingsContext = createContext({ cfg: DEFAULT_SETTINGS, updateCfg: () => {} });

// GHANA GRADES
const getGrade = (score) => {
  if (score == null) return { grade: "-", color: "#94a3b8", bg: "#f1f5f9" };
  if (score >= 80) return { grade: "A1", color: "#14532d", bg: "#dcfce7" };
  if (score >= 70) return { grade: "B2", color: "#1e3a8a", bg: "#dbeafe" };
  if (score >= 60) return { grade: "B3", color: "#0c4a6e", bg: "#e0f2fe" };
  if (score >= 55) return { grade: "C4", color: "#78350f", bg: "#fef3c7" };
  if (score >= 50) return { grade: "C5", color: "#7c2d12", bg: "#ffedd5" };
  if (score >= 45) return { grade: "C6", color: "#7f1d1d", bg: "#fee2e2" };
  if (score >= 40) return { grade: "D7", color: "#4a044e", bg: "#fdf4ff" };
  if (score >= 30) return { grade: "E8", color: "#1e1b4b", bg: "#eef2ff" };
  return { grade: "F9", color: "#374151", bg: "#f3f4f6" };
};

// SAMPLE DATA
const SUBJECTS = ["English Language","Mathematics","Integrated Science","Social Studies","Religious & Moral Ed","Home Language","French","Creative Arts","Career Technology","Computing"];
const GHANA_REGIONS = ["Greater Accra","Ashanti","Western","Central","Eastern","Volta","Northern","Upper East","Upper West","Bono","Oti","Ahafo","Bono East","North East","Savannah","Western North"];
const SCHOOLS_DATA = [
  { id:1, name:"Achimota School", region:"Greater Accra", category:"A", cutoff:8, slots:300 },
  { id:2, name:"Wesley Girls' High School", region:"Central", category:"A", cutoff:6, slots:250 },
  { id:3, name:"Prempeh College", region:"Ashanti", category:"A", cutoff:7, slots:280 },
  { id:4, name:"St. Augustine's College", region:"Central", category:"B", cutoff:9, slots:200 },
  { id:5, name:"Holy Child School", region:"Central", category:"B", cutoff:10, slots:180 },
  { id:6, name:"Kumasi Academy", region:"Ashanti", category:"B", cutoff:12, slots:220 },
  { id:7, name:"GSTS Takoradi", region:"Western", category:"C", cutoff:14, slots:350 },
  { id:8, name:"Tamale SHS", region:"Northern", category:"C", cutoff:15, slots:400 },
];
const STUDENTS_DATA = [
  { id:1, full_name:"Kwame Asante", index:"2024001", class:"JHS 3A", region:"Ashanti", aggregate:8, status:"confirmed" },
  { id:2, full_name:"Abena Mensah", index:"2024002", class:"JHS 3A", region:"Greater Accra", aggregate:12, status:"pending" },
  { id:3, full_name:"Kofi Boateng", index:"2024003", class:"JHS 3B", region:"Central", aggregate:6, status:"confirmed" },
  { id:4, full_name:"Akosua Frimpong", index:"2024004", class:"JHS 3B", region:"Western", aggregate:15, status:"pending" },
  { id:5, full_name:"Yaw Darko", index:"2024005", class:"JHS 3C", region:"Volta", aggregate:10, status:"confirmed" },
];
const SCORES_DATA = STUDENTS_DATA.map(s => ({
  student_id: s.id, name: s.full_name,
  scores: Object.fromEntries(SUBJECTS.map(sub => [sub, Math.floor(Math.random()*50)+40]))
}));
const ATTENDANCE_DATA = Array.from({length:20}, (_,i) => ({
  id:i+1, date: new Date(Date.now() - i*86400000*1.5).toISOString().split("T")[0],
  status: Math.random() > 0.15 ? "Present" : "Absent"
}));
const ANNOUNCEMENTS = [
  { id:1, title:"BECE Registration Open", body:"All JHS 3 students should complete BECE registration by April 30, 2024.", date:"2024-04-10", type:"urgent" },
  { id:2, title:"School Selection Window", body:"Students can now select up to 6 secondary schools. Deadline: May 15, 2024.", date:"2024-04-08", type:"info" },
  { id:3, title:"Mid-term Break", body:"School resumes on Monday, April 22, 2024. Enjoy your break!", date:"2024-04-05", type:"notice" },
];
const FEES_DATA = [
  { id:1, term:"First Term 2024", amount:350, paid:350, date:"2024-01-15", status:"paid" },
  { id:2, term:"Second Term 2024", amount:350, paid:200, date:"2024-04-02", status:"partial" },
  { id:3, term:"Third Term 2024", amount:350, paid:0, date:null, status:"unpaid" },
];
const FINANCE_DATA = { income: 125000, expenses: 89000, fees_collected: 98000, outstanding: 27000 };
const TEACHERS_DATA = [
  { id:1, name:"Mr. Kwesi Adjei", subject:"Mathematics", class:"JHS 3A,3B", phone:"0244123456" },
  { id:2, name:"Mrs. Ama Owusu", subject:"English Language", class:"JHS 3A,3C", phone:"0244234567" },
  { id:3, name:"Mr. Baffour Dankwah", subject:"Science", class:"JHS 3B,3C", phone:"0244345678" },
];
const EVENTS_DATA = [
  { id:1, title:"BECE Mock Exams", date:"2024-04-22", type:"exam", desc:"Three-day mock examination for JHS 3" },
  { id:2, title:"PTA Meeting", date:"2024-04-28", type:"meeting", desc:"Parents & teachers Q1 review" },
  { id:3, title:"Sports Day", date:"2024-05-10", type:"event", desc:"Annual inter-house sports competition" },
];

const getSessionUserEmail = () => {
  return globalThis.__campus_user_email || "demo@campus.local";
};

const APP_SESSION_KEY = "campus_portal_session";
let appSessionMemory = null;
const readAppSession = () => {
  if (appSessionMemory) return appSessionMemory;
  try {
    const raw = sessionStorage.getItem(APP_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.authSource === "custom" ? parsed : null;
  } catch {
    return null;
  }
};
const writeAppSession = (session) => {
  appSessionMemory = session || null;
  try {
    if (session?.authSource === "custom") {
      sessionStorage.setItem(APP_SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(APP_SESSION_KEY);
    }
  } catch {}
};

const ADMIN_TAB_KEY = "admin_active_tab";
const STUDENT_TAB_KEY = "student_active_tab";
const tabMemory = {
  [ADMIN_TAB_KEY]: "dashboard",
  [STUDENT_TAB_KEY]: "dashboard",
};
const readStoredTab = (key, fallback) => {
  try {
    return sessionStorage.getItem(key) || tabMemory[key] || fallback;
  } catch {
    return tabMemory[key] || fallback;
  }
};
const writeStoredTab = (key, value) => {
  tabMemory[key] = value;
  try {
    sessionStorage.setItem(key, value);
  } catch {}
};

let profilesTableAvailable = true;
const isProfilesTableMissingError = (error) => {
  if (!error) return false;
  const msg = String(error.message || "").toLowerCase();
  return error.status === 404 || error.code === "PGRST205" || error.code === "42P01" || msg.includes("profiles");
};
const isMissingColumnError = (error) => {
  if (!error) return false;
  const msg = String(error.message || "").toLowerCase();
  return error.code === "PGRST204" || error.code === "42703" || msg.includes("column");
};
const normalizeSchoolRow = (s, i = 0) => ({
  id: s?.id ?? i + 1,
  name: s?.name || s?.school_name || "Unnamed School",
  region: s?.region || "Unknown",
  category: String(s?.category || "C"),
  cutoff: Number(s?.cutoff ?? s?.cut_off ?? 0),
  slots: Number(s?.slots ?? s?.capacity ?? 0),
});
const resolveStudentPhotoUrl = (student) => {
  if (!student || typeof student !== "object") return "";
  const candidates = [
    student.photo_url,
    student.profile_photo_url,
    student.avatar_url,
    student.image_url,
    student.profile_image,
    student.profile_picture,
    student.picture_url,
    student.photo,
    student.avatar,
  ];
  const selected = candidates.find((value) => typeof value === "string" && value.trim());
  return selected ? selected.trim() : "";
};
const sortSchoolsByCategory = (schools) => {
  const order = { A: 0, B: 1, C: 2 };
  return [...schools].sort((left, right) => {
    const categoryDiff = (order[left?.category] ?? 99) - (order[right?.category] ?? 99);
    if (categoryDiff !== 0) return categoryDiff;
    return String(left?.name || "").localeCompare(String(right?.name || ""));
  });
};
const sortStudentsByIndex = (students) => {
  return [...(students || [])].sort((left, right) => {
    const leftIndex = String(left?.index || left?.index_number || "").trim();
    const rightIndex = String(right?.index || right?.index_number || "").trim();
    const leftNumber = Number(leftIndex);
    const rightNumber = Number(rightIndex);
    const leftIsNumeric = Number.isFinite(leftNumber) && leftIndex !== "";
    const rightIsNumeric = Number.isFinite(rightNumber) && rightIndex !== "";

    if (leftIsNumeric && rightIsNumeric && leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }

    return leftIndex.localeCompare(rightIndex, undefined, { numeric: true, sensitivity: "base" });
  });
};
const sortRecordsByStudentIndex = (rows) => {
  return [...(rows || [])].sort((left, right) => {
    const leftIndex = String(left?.index || left?.index_number || "").trim();
    const rightIndex = String(right?.index || right?.index_number || "").trim();
    const leftNumber = Number(leftIndex);
    const rightNumber = Number(rightIndex);
    const leftIsNumeric = Number.isFinite(leftNumber) && leftIndex !== "";
    const rightIsNumeric = Number.isFinite(rightNumber) && rightIndex !== "";

    if (leftIsNumeric && rightIsNumeric && leftNumber !== rightNumber) {
      return leftNumber - rightNumber;
    }

    const byIndex = leftIndex.localeCompare(rightIndex, undefined, { numeric: true, sensitivity: "base" });
    if (byIndex !== 0) return byIndex;

    return String(left?.studentName || left?.full_name || left?.user_email || "").localeCompare(
      String(right?.studentName || right?.full_name || right?.user_email || ""),
    );
  });
};
const sortTableRowsForDisplay = (tableName, rows) => {
  if (!Array.isArray(rows) || !rows.length) return [];
  if (tableName === "students") return sortStudentsByIndex(rows);

  const hasStudentIndex = rows.some((row) => row && (row.index_number != null || row.index != null));
  if (hasStudentIndex) return sortRecordsByStudentIndex(rows);

  return rows;
};
const hasRealTableError = (tableInfo) => !!(tableInfo?.error && tableInfo.error !== "Not loaded yet");
const normalizeSelectionList = (row) => {
  if (!row) return [];
  const raw = row.selections || row.selected_schools || [];
  if (!Array.isArray(raw)) return [];
  return raw.map((x, i) => ({
    id: x.school_id || x.id || `${i + 1}`,
    name: x.school_name || x.name || "Unknown School",
    region: x.region || "Unknown",
    category: x.category || "C",
    cutoff: Number(x.cutoff ?? x.cut_off ?? 0),
    rank: Number(x.rank ?? i + 1),
  }));
};
const normalizeTeacherRow = (teacher, i = 0) => ({
  id: teacher?.id ?? i + 1,
  name: teacher?.name || teacher?.full_name || "Unknown Teacher",
  subject: teacher?.subject || teacher?.department || "General",
  class: teacher?.class || teacher?.classes || teacher?.assigned_class || "-",
  phone: teacher?.phone || teacher?.contact || "-",
});
const normalizeFeeRow = (fee, i = 0) => ({
  id: fee?.id ?? i + 1,
  student_id: fee?.student_id || fee?.studentId || null,
  index_number: fee?.index_number || fee?.index || null,
  term: fee?.term || fee?.semester || `Term ${i + 1}`,
  amount: Number(fee?.amount ?? fee?.total ?? 0),
  paid: Number(fee?.paid ?? fee?.amount_paid ?? 0),
  status: fee?.status || (Number(fee?.paid ?? 0) >= Number(fee?.amount ?? 0) ? "paid" : Number(fee?.paid ?? 0) > 0 ? "partial" : "unpaid"),
  date: fee?.date || fee?.payment_date || fee?.updated_at || fee?.created_at || null,
  created_at: fee?.created_at || null,
  updated_at: fee?.updated_at || null,
});
const normalizeEventRow = (event, i = 0) => ({
  id: event?.id ?? i + 1,
  title: event?.title || event?.name || "Untitled",
  date: event?.event_date || event?.date || event?.created_at || "",
  type: event?.type || "event",
  desc: event?.description || event?.desc || "",
});
const normalizeScoreRow = (row, studentsMap, i = 0) => {
  const student = studentsMap.get(String(row?.student_id || "")) || studentsMap.get(String(row?.index_number || "")) || null;
  return {
    id: row?.id ?? i + 1,
    studentName: student?.full_name || row?.student_name || "Student",
    index: row?.index_number || student?.index || student?.index_number || "-",
    className: student?.class || student?.class_name || "-",
    subject: row?.subject || "General",
    score: Number(row?.score ?? 0),
    examType: row?.exam_type || "test",
    term: row?.term || "-",
  };
};
const normalizeResultRow = (row, studentsMap, i = 0) => {
  const student = studentsMap.get(String(row?.student_id || "")) || studentsMap.get(String(row?.index_number || "")) || null;
  return {
    id: row?.id ?? i + 1,
    studentName: student?.full_name || row?.student_name || "Student",
    index: row?.index_number || student?.index || student?.index_number || "-",
    averageScore: Number(row?.average_score ?? 0),
    aggregate: Number(row?.aggregate ?? student?.aggregate ?? 0),
    grade: row?.grade || getGrade(Number(row?.average_score ?? 0)).grade,
    rank: Number(row?.rank ?? i + 1),
    term: row?.term || "-",
    remarks: row?.remarks || "",
  };
};
const summarizeSelectionRecord = (row, studentsMap) => {
  const picks = normalizeSelectionList(row);
  const student = studentsMap.get(String(row?.student_id || "")) || studentsMap.get(String(row?.index_number || "")) || null;
  const first = picks[0] || null;
  const second = picks[1] || null;
  const isApproved = !!row?.approved || String(row?.status || "").toLowerCase() === "confirmed";
  const normalizedStatus = isApproved ? "confirmed" : String(row?.status || "pending").toLowerCase();
  return {
    id: row?.id,
    studentName: student?.full_name || student?.name || row?.student_name || row?.user_email || "Student",
    user_email: row?.user_email || student?.email || "student@campus.local",
    index_number: row?.index_number || student?.index || student?.index_number || "-",
    aggregate: row?.aggregate ?? student?.aggregate ?? "-",
    first: first?.name || "-",
    second: second?.name || "-",
    placedAt: first?.name || "-",
    category: first?.category || "C",
    reviewedAt: row?.reviewed_at || row?.updated_at || row?.created_at || null,
    status: normalizedStatus,
    approved: isApproved,
  };
};
const resolveActivityTimestamp = (...values) => {
  for (const value of values) {
    if (!value) continue;
    const time = new Date(value).getTime();
    if (Number.isFinite(time)) return time;
  }
  return null;
};
const formatActivityTime = (value) => {
  const time = resolveActivityTimestamp(value);
  if (time == null) return "";

  const diffMs = Date.now() - time;
  const absDiffMs = Math.abs(diffMs);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absDiffMs < hour) {
    const minutes = Math.max(1, Math.round(absDiffMs / minute));
    return diffMs >= 0 ? `${minutes}m ago` : `in ${minutes}m`;
  }
  if (absDiffMs < day) {
    const hours = Math.max(1, Math.round(absDiffMs / hour));
    return diffMs >= 0 ? `${hours}h ago` : `in ${hours}h`;
  }
  if (absDiffMs < 7 * day) {
    const days = Math.max(1, Math.round(absDiffMs / day));
    return diffMs >= 0 ? `${days}d ago` : `in ${days}d`;
  }
  return new Date(time).toLocaleDateString();
};
const buildRecentActivity = ({ students, selections, fees, events }) => {
  const items = [];

  (students || []).forEach((student) => {
    const timestamp = resolveActivityTimestamp(student?.created_at, student?.updated_at);
    if (timestamp == null) return;
    items.push({
      id: `student-${student?.id || student?.index || Math.random()}`,
      text: `New student enrolled: ${student?.full_name || student?.name || "Student"}`,
      time: timestamp,
      dot: "#1d4ed8",
    });
  });

  (selections || []).forEach((selection) => {
    const timestamp = resolveActivityTimestamp(selection?.reviewedAt, selection?.reviewed_at, selection?.updated_at, selection?.created_at);
    if (timestamp == null) return;
    const approved = String(selection?.status || "").toLowerCase() === "confirmed" || !!selection?.approved;
    items.push({
      id: `selection-${selection?.id || selection?.index_number || Math.random()}`,
      text: approved
        ? `${selection?.studentName || "Student"} placement confirmed`
        : `${selection?.studentName || "Student"} submitted school selection`,
      time: timestamp,
      dot: approved ? "#16a34a" : "#d97706",
    });
  });

  (fees || []).forEach((fee) => {
    const timestamp = resolveActivityTimestamp(fee?.date, fee?.updated_at, fee?.created_at);
    if (timestamp == null || Number(fee?.paid || 0) <= 0) return;
    items.push({
      id: `fee-${fee?.id || fee?.index_number || Math.random()}`,
      text: `Fee payment recorded for ${fee?.index_number || fee?.term || "student"}`,
      time: timestamp,
      dot: "#0f9f6e",
    });
  });

  (events || []).forEach((event) => {
    const timestamp = resolveActivityTimestamp(event?.updated_at, event?.created_at);
    if (timestamp == null) return;
    items.push({
      id: `event-${event?.id || Math.random()}`,
      text: `Event updated: ${event?.title || event?.name || "Untitled event"}`,
      time: timestamp,
      dot: "#7c3aed",
    });
  });

  return items
    .sort((left, right) => right.time - left.time)
    .slice(0, 4)
    .map((item) => ({ ...item, timeLabel: formatActivityTime(item.time) }));
};
const fetchStudentSelection = async ({ userEmail, studentData }) => {
  if (!supabase) return null;

  const tries = [];
  if (studentData?.id) {
    tries.push(() => supabase.from("school_selections").select("*").eq("student_id", studentData.id).order("created_at", { ascending: false }).limit(1).maybeSingle());
    tries.push(() => supabase.from("school_selections").select("*").eq("student_id", String(studentData.id)).order("created_at", { ascending: false }).limit(1).maybeSingle());
  }
  if (studentData?.index_number || studentData?.index) {
    const idx = studentData.index_number || studentData.index;
    tries.push(() => supabase.from("school_selections").select("*").eq("index_number", idx).order("created_at", { ascending: false }).limit(1).maybeSingle());
  }
  if (userEmail) {
    tries.push(() => supabase.from("school_selections").select("*").eq("user_email", userEmail).order("created_at", { ascending: false }).limit(1).maybeSingle());
  }

  for (const run of tries) {
    const { data, error } = await run();
    if (error) {
      if (isMissingColumnError(error)) continue;
      continue;
    }
    if (data) return data;
  }
  return null;
};

// ICONS
const ICON_MAP = {
  dashboard: IoGridOutline, students: IoPeopleOutline, scores: IoClipboardOutline,
  analytics: IoBarChartOutline, results: IoDocumentTextOutline, schools: IoSchoolOutline,
  pending: IoTimeOutline, confirmed: IoCheckmarkCircleOutline, finance: IoWalletOutline,
  chat: IoChatbubbleEllipsesOutline, settings: IoSettingsOutline, attendance: IoCalendarOutline,
  fees: IoCardOutline, docs: IoFolderOutline, bell: IoNotificationsOutline, search: IoSearchOutline,
  logout: IoLogOutOutline, menu: IoMenuOutline, profile: IoPersonCircleOutline, sun: IoSunnyOutline, moon: IoMoonOutline,
  teachers: IoRibbonOutline, grading: IoCreateOutline, events: IoCalendarClearOutline,
  enroll: IoPersonAddOutline, support: IoHelpBuoyOutline, selection: IoListCircleOutline,
  email: IoMailOutline, lock: IoLockClosedOutline, back: IoChevronBackOutline, signin: IoLogInOutline,
  eye: IoEyeOutline, eyeOff: IoEyeOffOutline,
};
const Ico = ({ name, size=18, color="currentColor", ...rest }) => {
  const L = ICON_MAP[name] || IoGridOutline;
  return <L size={size} color={color} {...rest}/>;
};

// STYLES
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
  :root {
    --primary: #1a56db; --primary-d: #1e3a8a; --primary-l: #dbeafe;
    --accent: #0891b2; --success: #16a34a; --warning: #d97706; --danger: #dc2626;
    --bg: #eef2ff; --surface: #fff; --border: #e2e8f0;
    --text: #0f172a; --text2: #475569; --text3: #94a3b8;
    --sidebar-w: 252px; --topbar-h: 66px;
    --font: 'Sora', sans-serif;
    --radius: 12px;
    --shadow: 0 2px 8px rgba(0,0,0,.07), 0 4px 16px rgba(26,86,219,.07);
  }
  body.dark-mode {
    --bg: #0b1220;
    --surface: #0f172a;
    --border: #23324a;
    --text: #e2e8f0;
    --text2: #cbd5e1;
    --text3: #94a3b8;
    --shadow: 0 10px 30px rgba(2,6,23,.45);
  }
  * { box-sizing: border-box; margin:0; padding:0; }
  body { font-family: var(--font); background: var(--bg); color: var(--text); overflow-x:hidden; -webkit-text-size-adjust:100%; }
  img { max-width:100%; height:auto; }
  input, select, textarea, button { font-family: var(--font); }
  
  .app { display:flex; flex-direction:column; min-height:100vh; }
  
  /* LANDING */
  .landing { min-height:100vh; display:flex; align-items:center; justify-content:center;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1a56db 100%); padding:20px; }
  .landing-box { background:#fff; border-radius:24px; padding:30px 28px; max-width:420px; width:100%;
    box-shadow:0 24px 80px rgba(0,0,0,.3); text-align:center; }
  .landing .brand-btn { width:100%; margin:0 auto; }
  .landing-logo { width:66px; height:66px; border-radius:16px; margin:0 auto 14px; overflow:hidden; }
  .landing-logo img { width:100%; height:100%; object-fit:cover; }
  .landing-title { font-size:1.75rem; font-weight:800; color:#0f172a; margin-bottom:4px; }
  .landing-sub { color:#64748b; margin-bottom:20px; font-size:.92rem; }
  .portal-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:8px; }
  .portal-btn { padding:16px 14px; border-radius:14px; border:2px solid #e2e8f0; background:#f8fafc;
    cursor:pointer; transition:all .2s; text-align:center; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .portal-btn:hover { border-color:var(--primary); background:var(--primary-l); transform:translateY(-2px); }
  .portal-btn-icon { font-size:1.45rem; margin-bottom:6px; }
  .portal-btn-label { font-weight:700; color:#0f172a; font-size:.95rem; text-align:center; }
  .portal-btn-sub { font-size:.78rem; color:#64748b; text-align:center; }

  .modal-backdrop { position:fixed; inset:0; background:rgba(15,23,42,.52); display:flex; align-items:center; justify-content:center; padding:20px; z-index:1200; }
  .modal-card { width:min(640px, 100%); max-height:85vh; overflow:auto; background:#fff; border-radius:20px; box-shadow:0 24px 80px rgba(15,23,42,.28); padding:24px; }
  .modal-head { display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:18px; }
  .modal-title { font-size:1.2rem; font-weight:800; color:#0f172a; }
  .modal-sub { font-size:.86rem; color:#64748b; margin-top:4px; }
  .modal-close { border:none; background:#eef2ff; color:#1e3a8a; width:36px; height:36px; border-radius:10px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:18px; }
  
  /* LOGIN */
  .login-form { display:flex; flex-direction:column; gap:12px; }
  .login-back { background:none; border:none; color:#1a56db; font-family:var(--font); cursor:pointer; font-size:.9rem; margin-bottom:4px; text-align:left; font-weight:600; display:flex; align-items:center; gap:6px; }
  .auth-input-wrap { position:relative; display:flex; align-items:center; }
  .auth-input-icon { position:absolute; left:12px; display:flex; align-items:center; justify-content:center; pointer-events:none; }
  .auth-pwd-toggle { position:absolute; right:10px; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; padding:4px; }
  .form-input { width:100%; padding:10px 12px; border:2px solid #e2e8f0; border-radius:10px;
    font-family:var(--font); font-size:.95rem; outline:none; transition:border-color .2s; }
  .auth-input-wrap .form-input { padding-left:40px; }
  .auth-input-wrap .form-input[type="password"], .auth-input-wrap .form-input[data-has-toggle="true"] { padding-right:40px; }
  .form-input:focus { border-color:var(--primary); }
  .btn-primary { width:100%; padding:11px 14px; background:linear-gradient(135deg,#1a56db,#1e3a8a);
    color:#fff; border:none; border-radius:10px; font-family:var(--font); font-weight:700;
    font-size:1rem; cursor:pointer; transition:opacity .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn-primary:hover { opacity:.9; }
  .demo-hint { font-size:.78rem; color:#94a3b8; margin-top:4px; }
  
  /* TOPBAR */
  .topbar { position:fixed; top:0; left:0; right:0; z-index:100; height:var(--topbar-h);
    background:linear-gradient(135deg,#1a56db 0%,#1e3a8a 100%);
    display:flex; align-items:center; justify-content:space-between; padding:0 20px;
    box-shadow:0 2px 20px rgba(26,86,219,.4); }
  .topbar-left { display:flex; align-items:center; gap:12px; flex:1; min-width:0; }
  .topbar-logo { width:60px; height:60px; border-radius:14px; overflow:hidden; border:2px solid rgba(255,255,255,.3); }
  .brand-btn { background:none; border:none; padding:0; cursor:pointer; display:flex; align-items:center; justify-content:center; }
  .topbar-logo img { width:100%; height:100%; object-fit:cover; }
  .topbar-name { color:#fff; font-weight:800; font-size:1rem; }
  .topbar-search { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,.15);
    border:1px solid rgba(255,255,255,.25); border-radius:8px; padding:0 12px; flex:1 1 52vw; max-width:none; min-width:320px; margin-left:4px; }
  .topbar-search input { background:none; border:none; outline:none; color:#fff; font-family:var(--font);
    font-size:.875rem; width:100%; padding:8px 0; }
  .topbar-search input::placeholder { color:rgba(255,255,255,.6); }
  .topbar-right { display:flex; align-items:center; gap:8px; }
  .topbar-actions {
    display:flex;
    align-items:center;
    gap:0;
    background:rgba(255,255,255,.14);
    border:1px solid rgba(255,255,255,.22);
    border-radius:12px;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.08);
    overflow:hidden;
  }
  .topbar-btn { background:transparent; border:none;
    color:#fff; width:36px; height:36px; border-radius:8px; cursor:pointer; display:flex;
    align-items:center; justify-content:center; position:relative; transition:background .2s; }
  .topbar-actions .topbar-btn { border-radius:0; }
  .topbar-actions .topbar-btn + .topbar-btn { box-shadow:-1px 0 0 rgba(255,255,255,.14); }
  .topbar-btn:hover { background:rgba(255,255,255,.25); }
  .notif-badge { position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff;
    border-radius:99px; font-size:.6rem; font-weight:700; width:16px; height:16px;
    display:flex; align-items:center; justify-content:center; }
  .topbar-avatar { width:36px; height:36px; border-radius:8px; background:rgba(255,255,255,.2);
    border:2px solid rgba(255,255,255,.3); color:#fff; display:flex; align-items:center;
    justify-content:center; font-weight:700; font-size:.8rem; cursor:pointer; }
  .menu-btn { background:none; border:none; color:#fff; cursor:pointer; display:flex;
    align-items:center; justify-content:center; padding:4px; }

  body.dark-mode .topbar-actions {
    background:rgba(15,23,42,.2);
    border-color:rgba(191,219,254,.16);
    box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
  }
  body.dark-mode .topbar-actions .topbar-btn + .topbar-btn { box-shadow:-1px 0 0 rgba(191,219,254,.1); }
  body.dark-mode .sidebar {
    background: linear-gradient(180deg, #0f172a 0%, #111b2f 100%);
    border-right-color: #1e2b42;
  }
  body.dark-mode .sidebar-brand { border-bottom-color: #1e2b42; }
  body.dark-mode .sidebar-section { color:#7f91ad; }
  body.dark-mode .nav-item { color:#cbd5e1; }
  body.dark-mode .nav-item:hover { background:#1a2740; color:#dbeafe; }
  body.dark-mode .nav-item.active {
    background: linear-gradient(135deg,#1d4ed8,#1e3a8a);
    color:#eff6ff;
    box-shadow: inset 0 0 0 1px #3b82f6;
  }
  body.dark-mode .nav-item.active::before { background:#93c5fd; }
  body.dark-mode .card,
  body.dark-mode .stat-card,
  body.dark-mode .results-panel,
  body.dark-mode .student-profile-card,
  body.dark-mode .selection-card,
  body.dark-mode .modal-card {
    background:#0f172a;
    border-color:#23324a;
  }
  body.dark-mode th {
    background:#111d31;
    color:#a8bddc;
    border-bottom-color:#23324a;
  }
  body.dark-mode td { color:#dbe7f8; border-bottom-color:#1f2c43; }
  body.dark-mode tr:hover td { background:#121f34; }
  body.dark-mode .form-control,
  body.dark-mode .form-input {
    background:#0b1324;
    border-color:#2a3a54;
    color:#e2e8f0;
  }
  body.dark-mode .form-control:focus,
  body.dark-mode .form-input:focus { border-color:#60a5fa; }
  body.dark-mode .form-label { color:#cbd5e1; }
  body.dark-mode .topbar-search {
    background: rgba(15,23,42,.45);
    border-color: rgba(148,163,184,.35);
  }
  body.dark-mode .topbar-search input::placeholder { color:rgba(191,219,254,.7); }
  body.dark-mode .topbar-search input { color:#e2e8f0; }
  body.dark-mode .bottom-nav {
    background: linear-gradient(180deg,#0f172a 0%,#111b2f 100%);
    border-top-color:#1e2b42;
  }
  body.dark-mode .bottom-nav-item { color:#9fb2cf; }
  body.dark-mode .bottom-nav-item:hover { background:#1a2740; }
  body.dark-mode .bottom-nav-item.active {
    color:#dbeafe;
    background: linear-gradient(135deg,rgba(29,78,216,.28),rgba(30,58,138,.22));
    box-shadow: inset 0 0 0 1px rgba(59,130,246,.35);
  }
  body.dark-mode .alert-info { background:#10233d; color:#bfdbfe; border-color:#1e3a8a; }
  body.dark-mode .alert-warning { background:#3a2c10; color:#fde68a; border-color:#a16207; }
  body.dark-mode .alert-success { background:#10261b; color:#bbf7d0; border-color:#166534; }
  body.dark-mode .alert-danger { background:#3b1317; color:#fecaca; border-color:#b91c1c; }
  body.dark-mode .student-profile-row { background:#0b1324; border-color:#23324a; }
  body.dark-mode .student-profile-row span { color:#e2e8f0; }
  body.dark-mode .student-profile-help,
  body.dark-mode .page-sub,
  body.dark-mode .stat-sub { color:#94a3b8; }
  
  /* SHELL */
  .shell { display:flex; padding-top:var(--topbar-h); min-height:100vh; }
  .sidebar { width:var(--sidebar-w); background:linear-gradient(180deg,#ffffff 0%,#f8fbff 100%); border-right:1px solid #dbe5f3;
    position:fixed; top:var(--topbar-h); bottom:0; left:0; overflow-y:auto; z-index:90;
    transition:transform .25s ease; padding:10px 10px 16px; scrollbar-width:thin; scrollbar-color:#c9d6ea transparent; }
  .sidebar::-webkit-scrollbar { width:8px; }
  .sidebar::-webkit-scrollbar-track { background:transparent; }
  .sidebar::-webkit-scrollbar-thumb { background:#c9d6ea; border-radius:99px; }
  .sidebar::-webkit-scrollbar-thumb:hover { background:#adc1de; }
  .sidebar.closed { transform:translateX(-100%); }
  .sidebar-brand { width:100%; padding:14px 12px 18px; border-bottom:1px solid #e6edf7; margin-bottom:8px; display:flex; align-items:center; justify-content:center; }
  .sidebar-brand img { width:64px; height:64px; border-radius:14px; border:2px solid #dbeafe; box-shadow:0 8px 20px rgba(30,58,138,.12); }
  .sidebar-section { font-size:.7rem; font-weight:700; color:#94a3b8; letter-spacing:.8px;
    text-transform:uppercase; padding:14px 12px 6px; }
  .nav-item { display:flex; align-items:center; gap:12px; width:100%; padding:11px 12px; margin:3px 0;
    background:none; border:none; cursor:pointer; font-family:var(--font); font-size:.875rem;
    color:#334155; border-radius:12px; transition:all .2s; text-align:left; position:relative; }
  .nav-item:hover { background:#eef5ff; color:var(--primary); transform:translateX(2px); }
  .nav-item.active { background:linear-gradient(135deg,#e8f1ff,#dbeafe); color:var(--primary); font-weight:700; box-shadow:inset 0 0 0 1px #c7ddff; }
  .nav-item.active::before { content:''; position:absolute; left:4px; top:8px; bottom:8px; width:4px; background:var(--primary); border-radius:99px; }
  .nav-item-icon { flex-shrink:0; }
  .nav-item-label { font-size:.9rem; letter-spacing:.1px; }
  .nav-item-badge { margin-left:auto; background:#ef4444; color:#fff; border-radius:99px;
    font-size:.65rem; font-weight:700; padding:2px 7px; }
  .nav-item:not(.active) svg { opacity:.88; }
  .nav-item:hover svg, .nav-item.active svg { opacity:1; transition:opacity .15s; filter:drop-shadow(0 1px 2px rgba(30,58,138,.18)); }
  .bottom-nav-item svg { opacity:.9; transition:opacity .15s, filter .15s; }
  .bottom-nav-item:hover svg, .bottom-nav-item.active svg { opacity:1; filter:drop-shadow(0 1px 2px rgba(30,58,138,.18)); }
  
  .main { flex:1; margin-left:var(--sidebar-w); padding:24px; min-height:calc(100vh - var(--topbar-h)); overflow-x:hidden; }
  .main.full { margin-left:0; }
  
  /* CARDS & LAYOUT */
  .card { background:#fff; border-radius:var(--radius); border:1px solid var(--border); box-shadow:var(--shadow); }
  .card-padded { padding:20px; }
  .page-header { background:linear-gradient(135deg,#1e293b,#0f172a); border-radius:var(--radius); padding:24px 28px; margin-bottom:24px; color:#fff; }
  .page-title { font-size:1.75rem; font-weight:800; }
  .page-sub { color:#94a3b8; margin-top:4px; font-size:.9rem; }
  
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:24px; }
  .stat-card { background:#fff; border-radius:var(--radius); border:1px solid var(--border); padding:20px; box-shadow:var(--shadow); }
  .stat-label { font-size:.78rem; color:var(--text3); font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
  .stat-value { font-size:1.8rem; font-weight:800; color:var(--text); }
  .stat-sub { font-size:.78rem; color:var(--text3); margin-top:4px; }
  .stat-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; }
  .dashboard-stat-card {
    position:relative;
    overflow:hidden;
    background:linear-gradient(155deg,var(--dash-bg-start,#eff6ff) 0%, var(--dash-bg-end,#dbeafe) 100%);
    border-color:var(--dash-border, rgba(148,163,184,.24));
    box-shadow:0 14px 28px -24px var(--dash-shadow, rgba(30,41,59,.18));
  }
  .dashboard-stat-card::before {
    content:"";
    position:absolute;
    inset:auto -10% -42% auto;
    width:120px;
    height:120px;
    border-radius:50%;
    background:radial-gradient(circle, var(--dash-glow, rgba(255,255,255,.38)) 0%, rgba(255,255,255,0) 68%);
    pointer-events:none;
  }
  .dashboard-stat-card::after {
    content:"";
    position:absolute;
    inset:0;
    background:linear-gradient(180deg, rgba(255,255,255,.14), rgba(255,255,255,0) 38%);
    pointer-events:none;
  }
  .dashboard-stat-card .stat-value {
    letter-spacing:-.03em;
    text-wrap:balance;
    font-size:2rem;
    line-height:1;
  }
  .dashboard-stat-card .stat-icon {
    background:rgba(255,255,255,.56) !important;
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.45);
    backdrop-filter:blur(4px);
  }
  .dashboard-stat-card .stat-label,
  .dashboard-stat-card .stat-value,
  .dashboard-stat-card .stat-sub {
    color:var(--dash-text, #0f172a) !important;
    position:relative;
    z-index:1;
  }
  .dashboard-stat-card .stat-label {
    opacity:.72;
    letter-spacing:.11em;
    margin-bottom:10px;
  }
  .dashboard-stat-card .stat-sub {
    opacity:.78;
    margin-top:8px;
    max-width:22ch;
    line-height:1.35;
  }
  body.dark-mode .dashboard-stat-card {
    border-color:rgba(96,165,250,.18);
    box-shadow:0 18px 32px -24px rgba(2,6,23,.72);
  }
  body.dark-mode .dashboard-stat-card .stat-icon {
    background:rgba(15,23,42,.22) !important;
    box-shadow:inset 0 0 0 1px rgba(191,219,254,.12);
  }
  
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .grid3 { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  
  /* TABLE */
  .table-wrap { overflow-x:auto; border-radius:var(--radius); }
  table { width:100%; border-collapse:collapse; font-size:.875rem; }
  th { background:#f8fafc; padding:10px 14px; text-align:left; font-weight:700; color:var(--text2); font-size:.78rem; text-transform:uppercase; letter-spacing:.5px; border-bottom:2px solid var(--border); }
  .students-table thead th {
    background:linear-gradient(180deg,#eff6ff 0%, #dbeafe 100%);
    color:#1e3a8a;
    border-bottom:1px solid #bfdbfe;
    padding:14px 14px 12px;
    vertical-align:bottom;
  }
  .students-table thead th:first-child { border-top-left-radius:14px; }
  .students-table thead th:last-child { border-top-right-radius:14px; }
  .students-th-label {
    display:inline-flex;
    align-items:center;
    min-height:32px;
    padding:6px 10px;
    border-radius:999px;
    background:rgba(255,255,255,.72);
    box-shadow:inset 0 0 0 1px rgba(147,197,253,.9);
    font-size:.72rem;
    font-weight:800;
    letter-spacing:.08em;
  }
  .students-table thead th[data-col="aggregate"] .students-th-label {
    background:rgba(254,243,199,.8);
    box-shadow:inset 0 0 0 1px rgba(245,158,11,.35);
    color:#92400e;
  }
  .students-table thead th[data-col="aggregate"] { text-align:center; }
  .students-table thead th[data-col="aggregate"] .students-th-label { justify-content:center; }
  .students-table thead th[data-col="student-id"] { text-align:center; }
  .students-table thead th[data-col="student-id"] .students-th-label { justify-content:center; }
  .students-table td.students-id-cell { text-align:center; color:#94a3b8; font-family:monospace; }
  .students-table td.students-aggregate-cell { text-align:center; }
  body.dark-mode .students-table thead th {
    background:linear-gradient(180deg,#122033 0%, #16263d 100%);
    color:#bfdbfe;
    border-bottom-color:#29405f;
  }
  body.dark-mode .students-th-label {
    background:rgba(15,23,42,.72);
    box-shadow:inset 0 0 0 1px rgba(59,130,246,.35);
    color:#dbeafe;
  }
  body.dark-mode .students-table thead th[data-col="aggregate"] .students-th-label {
    background:rgba(120,53,15,.22);
    box-shadow:inset 0 0 0 1px rgba(245,158,11,.25);
    color:#fde68a;
  }
  td { padding:12px 14px; border-bottom:1px solid #f1f5f9; color:var(--text); }
  tr:last-child td { border-bottom:none; }
  tr:hover td { background:#f9fbff; }
  
  /* BADGE */
  .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:99px; font-size:.72rem; font-weight:700; }
  .badge-success { background:#dcfce7; color:#16a34a; }
  .badge-warning { background:#fef9c3; color:#d97706; }
  .badge-danger { background:#fee2e2; color:#dc2626; }
  .badge-blue { background:#dbeafe; color:#1e40af; }
  .badge-gray { background:#f1f5f9; color:#64748b; }
  
  /* FORM */
  .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .form-group { display:flex; flex-direction:column; gap:6px; }
  .form-label { font-weight:600; font-size:.85rem; color:#374155; }
  .form-control { padding:10px 12px; border:2px solid #e2e8f0; border-radius:8px;
    font-family:var(--font); font-size:.9rem; outline:none; transition:border-color .2s; background:#fff; }
  .form-control:focus { border-color:var(--primary); }
  .btn { padding:10px 20px; border-radius:8px; font-family:var(--font); font-weight:700;
    font-size:.875rem; cursor:pointer; border:none; transition:all .2s; display:inline-flex; align-items:center; gap:6px; }
  .btn-sm { padding:7px 14px; font-size:.8rem; }
  .btn-blue { background:var(--primary); color:#fff; }
  .btn-blue:hover { background:var(--primary-d); }
  .btn-red { background:#dc2626; color:#fff; }
  .btn-green { background:#16a34a; color:#fff; }
  .btn-outline { background:#fff; border:2px solid var(--border); color:var(--text2); }
  .btn-outline:hover { border-color:var(--primary); color:var(--primary); }
  
  /* PROFILE CARD */
  .profile-header { display:flex; align-items:center; gap:20px; padding:24px; background:linear-gradient(135deg,#1e3a8a,#1a56db); color:#fff; border-radius:var(--radius); margin-bottom:20px; }
  .profile-avatar { width:80px; height:80px; border-radius:16px; background:rgba(255,255,255,.2);
    display:flex; align-items:center; justify-content:center; font-size:2rem; font-weight:800;
    border:3px solid rgba(255,255,255,.4); color:#fff; flex-shrink:0; }
  .profile-name { font-size:1.4rem; font-weight:800; }
  .profile-role { opacity:.8; font-size:.875rem; margin-top:4px; }
  .student-profile-shell { display:grid; gap:16px; }
  .student-profile-hero {
    background:linear-gradient(135deg,#0f172a,#1e3a8a 55%,#2563eb);
    color:#fff;
    border-radius:16px;
    border:1px solid rgba(148,163,184,.25);
    box-shadow:0 20px 38px rgba(15,23,42,.22);
    padding:20px;
    display:grid;
    grid-template-columns:auto 1fr auto;
    gap:16px;
    align-items:center;
  }
  .student-profile-avatar {
    width:74px;
    height:74px;
    border-radius:18px;
    border:2px solid rgba(255,255,255,.45);
    background:linear-gradient(135deg,rgba(255,255,255,.26),rgba(255,255,255,.08));
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:1.5rem;
    font-weight:800;
    letter-spacing:.6px;
  }
  .student-profile-title { font-size:1.35rem; font-weight:800; letter-spacing:.2px; }
  .student-profile-meta { margin-top:4px; color:rgba(226,232,240,.9); font-size:.86rem; }
  .student-profile-pill {
    display:inline-flex;
    align-items:center;
    gap:6px;
    background:rgba(148,163,184,.22);
    border:1px solid rgba(226,232,240,.28);
    border-radius:999px;
    padding:5px 10px;
    font-size:.74rem;
    font-weight:700;
    color:#e2e8f0;
    margin-top:10px;
  }
  .student-profile-term {
    text-align:right;
    background:rgba(255,255,255,.12);
    border:1px solid rgba(226,232,240,.26);
    border-radius:12px;
    padding:10px 12px;
    min-width:180px;
  }
  .student-profile-term small { display:block; font-size:.73rem; color:#cbd5e1; margin-bottom:4px; }
  .student-profile-term strong { display:block; font-size:.98rem; }
  .student-profile-grid { display:grid; grid-template-columns:2fr 1.1fr; gap:16px; }
  .student-profile-card { background:#fff; border:1px solid var(--border); border-radius:14px; box-shadow:var(--shadow); }
  .student-profile-card-head {
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
    border-bottom:1px solid #e2e8f0;
    padding:14px 16px;
  }
  .student-profile-card-head h3 { font-size:.92rem; font-weight:800; color:#0f172a; }
  .student-profile-card-body { padding:14px 16px; }
  .student-profile-list { display:grid; gap:10px; }
  .student-profile-row {
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap:12px;
    padding:10px 12px;
    border-radius:10px;
    background:#f8fafc;
    border:1px solid #e2e8f0;
  }
  .student-profile-row label { font-size:.74rem; text-transform:uppercase; letter-spacing:.5px; color:#64748b; font-weight:700; }
  .student-profile-row span { font-size:.9rem; font-weight:700; color:#0f172a; text-align:right; }
  .student-profile-kpis { display:grid; grid-template-columns:1fr; gap:10px; }
  .student-profile-kpi {
    border-radius:12px;
    padding:12px;
    border:1px solid #e2e8f0;
  }
  .student-profile-kpi label { display:block; font-size:.72rem; text-transform:uppercase; letter-spacing:.45px; font-weight:700; margin-bottom:6px; }
  .student-profile-kpi strong { display:block; font-size:1rem; font-weight:800; }
  .student-profile-kpi small { display:block; font-size:.76rem; margin-top:4px; }
  .student-profile-help { margin-top:10px; font-size:.82rem; color:#64748b; line-height:1.45; }
  
  /* GRADE CHIP */
  .grade-chip { display:inline-flex; align-items:center; justify-content:center; min-width:48px;
    padding:3px 10px; border-radius:8px; font-weight:700; font-size:.85rem; }

  /* RESULTS VISUALS */
  .results-visual-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:16px; margin-bottom:16px; }
  .results-panel { background:#fff; border-radius:var(--radius); border:1px solid var(--border); box-shadow:var(--shadow); padding:16px; }
  .results-panel h3 { font-size:.9rem; font-weight:800; color:#0f172a; margin-bottom:12px; }
  .results-donut { width:138px; height:138px; border-radius:50%; margin:0 auto; display:flex; align-items:center; justify-content:center; position:relative; }
  .results-donut::after { content:""; position:absolute; width:86px; height:86px; border-radius:50%; background:#fff; box-shadow:inset 0 0 0 1px #e2e8f0; }
  .results-donut-center { position:relative; z-index:1; text-align:center; }
  .results-donut-center strong { display:block; font-size:1.2rem; color:#0f172a; }
  .results-donut-center span { font-size:.72rem; color:#64748b; }
  .results-legend { margin-top:12px; display:grid; gap:6px; }
  .results-legend-item { display:flex; align-items:center; justify-content:space-between; font-size:.78rem; color:#334155; }
  .results-legend-item b { font-weight:700; }
  .results-dot { width:10px; height:10px; border-radius:50%; margin-right:8px; display:inline-block; }
  .results-bars { display:grid; gap:8px; }
  .results-bar-row { display:grid; grid-template-columns:88px 1fr 44px; align-items:center; gap:10px; font-size:.76rem; }
  .results-bar-track { height:10px; border-radius:99px; background:#e2e8f0; overflow:hidden; }
  .results-bar-fill { height:100%; border-radius:99px; }
  .results-line-chart { width:100%; height:170px; }
  .results-line-chart polyline { fill:none; stroke:#1d4ed8; stroke-width:3; stroke-linecap:round; stroke-linejoin:round; }
  .results-line-chart .area { fill:url(#resultsLineFill); stroke:none; opacity:.9; }
  .results-line-chart .point { fill:#1d4ed8; stroke:#fff; stroke-width:2; }
  .results-axis-labels { display:flex; justify-content:space-between; margin-top:8px; font-size:.72rem; color:#64748b; }
  
  /* PROGRESS */
  .progress { background:#e2e8f0; border-radius:99px; height:8px; overflow:hidden; }
  .progress-bar { height:100%; border-radius:99px; transition:width .4s; }
  
  /* ATTENDANCE CIRCLE */
  .att-circle { width:80px; height:80px; border-radius:50%; display:flex; flex-direction:column;
    align-items:center; justify-content:center; font-weight:800; font-size:1.1rem; }
  
  /* SELECTION */
  .selection-card { border:2px solid var(--border); border-radius:var(--radius); padding:14px 16px;
    cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:12px; background:#fff; }
  .selection-card:hover { border-color:var(--primary); background:var(--primary-l); }
  .selection-card.selected { border-color:var(--primary); background:#eff6ff; }
  .cat-badge { width:28px; height:28px; border-radius:8px; display:flex; align-items:center;
    justify-content:center; font-weight:800; font-size:.8rem; flex-shrink:0; }
  .cat-A { background:#fef3c7; color:#92400e; }
  .cat-B { background:#dbeafe; color:#1e40af; }
  .cat-C { background:#dcfce7; color:#166534; }
  
  /* ALERT */
  .alert { padding:12px 16px; border-radius:var(--radius); font-size:.875rem; margin-bottom:16px; }
  .alert-success { background:#dcfce7; color:#16a34a; border:1px solid #bbf7d0; }
  .alert-warning { background:#fef9c3; color:#854d0e; border:1px solid #fde68a; }
  .alert-danger { background:#fee2e2; color:#dc2626; border:1px solid #fecaca; }
  .alert-info { background:#dbeafe; color:#1e40af; border:1px solid #bfdbfe; }
  
  /* CHAT */
  .chat-msg { padding:10px 14px; border-radius:12px; max-width:70%; margin-bottom:8px; font-size:.9rem; }
  .chat-msg.mine { background:var(--primary); color:#fff; margin-left:auto; }
  .chat-msg.theirs { background:#f1f5f9; color:var(--text); }
  
  /* MOBILE */
  .bottom-nav { display:none; position:fixed; bottom:0; left:0; right:0;
    background:linear-gradient(180deg,#ffffff 0%,#f8fbff 100%);
    border-top:1px solid #dbe5f3; z-index:100; padding:5px 7px; height:60px;
    box-shadow:0 -6px 14px rgba(15,23,42,.06); }
  .bottom-nav-grid { display:grid; height:100%; gap:4px; }
  .bottom-nav-item { display:flex; flex-direction:column; align-items:center; justify-content:center;
    background:none; border:none; cursor:pointer; font-family:var(--font); font-size:.64rem;
    color:#64748b; gap:1px; border-radius:8px; transition:all .2s; position:relative; }
  .bottom-nav-item span { font-weight:700; letter-spacing:.1px; }
  .bottom-nav-item:hover { background:#eef5ff; transform:translateY(-1px); }
  .bottom-nav-item.active { color:var(--primary); background:linear-gradient(135deg,rgba(232,241,255,.95),rgba(219,234,254,.8)); box-shadow:inset 0 0 0 1px rgba(199,221,255,.9); }
  .bottom-nav-item.active::before { content:''; position:absolute; left:11px; right:11px; top:4px; height:2px; background:var(--primary); border-radius:99px; opacity:.85; }
  
  .fade-in { animation: fadeIn .3s ease; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  
  .spinner { width:32px; height:32px; border:3px solid #e2e8f0; border-top-color:var(--primary);
    border-radius:50%; animation:spin .7s linear infinite; }
  @keyframes spin { to { transform:rotate(360deg); } }
  
  .sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(15,23,42,.45); z-index:109; }
  @media (max-width:1023px) {
    .sidebar-overlay { display:block; }
  }

  @media (max-width:1023px) {
    .stats-grid { grid-template-columns:1fr 1fr; }
    .main { margin-left:0 !important; }
    .sidebar { transform:translateX(-100%); z-index:110; }
    .sidebar:not(.closed) { transform:translateX(0); box-shadow:4px 0 24px rgba(15,23,42,.18); }
    .bottom-nav { display:block; }
    .main { padding-bottom:80px; }
  }

  @media (max-width:767px) {
    :root { --topbar-h: 58px; }
    .topbar { padding:0 10px; gap:8px; }
    .topbar-left { gap:6px; flex:1; min-width:0; }
    .topbar-search { display:flex; flex:1 1 52vw; min-width:132px; max-width:none; margin-left:4px; padding:0 10px; }
    .topbar-search input { font-size:.8rem; padding:7px 0; }
    .topbar-right { gap:6px; }
    .desktop-only-action { display:none; }
    .bell-mobile-visible { display:flex; }
    .topbar-logo { width:50px; height:50px; }
    .topbar-btn { width:32px; height:32px; }

    .sidebar { width:min(280px,85vw); padding-bottom:80px; }

    .main { padding:14px 10px 82px; }

    .page-header { padding:16px 18px; margin-bottom:16px; }
    .page-title { font-size:1.3rem; }
    .page-sub { font-size:.8rem; }

    .stats-grid { grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px; }
    .stat-card { padding:14px; }
    .stat-value { font-size:1.4rem; }
    .stat-icon { width:34px; height:34px; }

    .grid2, .grid3, .form-grid { grid-template-columns:1fr; gap:10px; }
    .results-visual-grid { grid-template-columns:1fr; }
    .results-donut { width:122px; height:122px; }
    .results-donut::after { width:74px; height:74px; }

    .card-padded { padding:14px; }

    .profile-header { flex-wrap:wrap; gap:14px; padding:18px; }
    .profile-avatar { width:64px; height:64px; font-size:1.6rem; }
    .profile-name { font-size:1.15rem; }
    .student-profile-hero { grid-template-columns:1fr; text-align:left; }
    .student-profile-term { text-align:left; min-width:0; }
    .student-profile-grid { grid-template-columns:1fr; }

    .chat-msg { max-width:88%; }
    .chat-layout { flex-direction:column; }

    .table-wrap { font-size:.8rem; }
    th, td { padding:8px 10px; }

    .btn { padding:9px 14px; font-size:.82rem; }
    .modal-card { padding:16px; border-radius:16px; max-height:92vh; }
    .modal-actions { flex-wrap:wrap; }
    .modal-actions .btn { flex:1; justify-content:center; }

    .landing-box { padding:22px 18px; border-radius:18px; }
    .landing-title { font-size:1.45rem; }
    .portal-btn { padding:13px 10px; }

    .selection-card { padding:11px 12px; }
    .bottom-nav { height:58px; padding:3px 5px; }
    .bottom-nav-item { font-size:.6rem; gap:1px; }
    .bottom-nav-item span { font-size:.58rem; }
  }

  @media (max-width:479px) {
    .stats-grid { grid-template-columns:1fr 1fr; gap:8px; }
    .stat-card { padding:12px; }
    .stat-value { font-size:1.2rem; }
    .stat-label { font-size:.7rem; }

    .page-header { padding:12px 14px; }
    .page-title { font-size:1.15rem; }

    .main { padding:10px 8px 78px; }
    .card-padded { padding:12px; }

    .profile-header { padding:14px; gap:10px; }
    .profile-avatar { width:54px; height:54px; font-size:1.3rem; }
    .profile-name { font-size:1rem; }
    .profile-role { font-size:.78rem; }
    .student-profile-avatar { width:64px; height:64px; font-size:1.2rem; border-radius:14px; }
    .student-profile-title { font-size:1.1rem; }
    .student-profile-meta { font-size:.8rem; }
    .student-profile-card-head, .student-profile-card-body { padding:12px; }
    .student-profile-row { padding:9px 10px; }

    .portal-grid { grid-template-columns:1fr 1fr; gap:8px; }
    .portal-btn { padding:12px 8px; }
    .portal-btn-label { font-size:.85rem; }

    .landing-box { padding:18px 14px; }
    .landing-title { font-size:1.25rem; }
    .landing-logo { width:54px; height:54px; }

    .btn { padding:8px 12px; }
    .btn-sm { padding:6px 10px; font-size:.76rem; }

    .modal-card { padding:12px; }
    .modal-title { font-size:1rem; }

    .topbar { padding:0 10px; }
    .topbar-left { gap:4px; }
    .topbar-search { flex:1 1 48vw; min-width:108px; padding:0 8px; }
    .topbar-search input { font-size:.75rem; }
    .topbar-right { gap:4px; }
    .topbar-actions { border-radius:10px; }
  }

  @media (min-width:1024px) {
    .topbar-left { justify-content:center; }
    .topbar-search {
      flex:0 1 60vw;
      max-width:760px;
      min-width:420px;
      margin-left:16px;
      margin-right:auto;
    }
    .sidebar { transform:translateX(0) !important; }
    .sidebar.closed { transform:translateX(-100%) !important; }
    .main { margin-left:var(--sidebar-w); }
    .main.full { margin-left:0; }
    .menu-btn { display:flex; }
  }

  @media (min-width:1280px) {
    .stats-grid { grid-template-columns:repeat(4,1fr); }
  }
  @media (max-width:480px) {
    .stats-grid { grid-template-columns:1fr; }
    .page-title { font-size:1.3rem; }
  }
`;

// TOPBAR
function Topbar({ user, portal, onLogout, onMenuClick, darkMode, onToggleDark, onOpenNotifications, onOpenProfile, onReloadApp, notificationCount, chatUnread, onOpenChat }) {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const { cfg } = useContext(SettingsContext);
  const initials = user?.name?.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase() || "?";
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={onMenuClick}><Ico name="menu" size={22} color="#fff"/></button>
        <button className="brand-btn" onClick={onReloadApp} title="Reload app">
          <div className="topbar-logo"><img src="https://image2url.com/r2/default/images/1773576400522-25d9d22b-3e79-4a9a-adc2-eae0031fbfe1.png" alt="Campus Ghana"/></div>
        </button>
        <span className="topbar-name" style={{display:"none"}}>{cfg.systemName}</span>
        {showSearch && <div className="topbar-search" style={{marginLeft:8}}>
          <Ico name="search" size={15} color="rgba(255,255,255,.7)"/>
          <input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>}
      </div>
      <div className="topbar-right">
        <div className="topbar-actions">
        <button className="topbar-btn desktop-only-action" onClick={onOpenChat} title="Chat">
          <Ico name="chat" size={17} color="#fff"/>
          {chatUnread > 0 && <span className="notif-badge">{chatUnread}</span>}
        </button>
        <button className="topbar-btn desktop-only-action bell-mobile-visible" onClick={onOpenNotifications} title="Notifications">
          <Ico name="bell" size={17} color="#fff"/>
          {notificationCount > 0 && <span className="notif-badge">{notificationCount}</span>}
        </button>
        <button className="topbar-btn" onClick={() => setShowSearch((v) => !v)} title={showSearch ? "Hide Search" : "Show Search"}>
          <Ico name={showSearch ? "eyeOff" : "eye"} size={17} color="#fff"/>
        </button>
        <button className="topbar-btn" onClick={onToggleDark} title={darkMode ? "Light Mode" : "Dark Mode"}>
          <Ico name={darkMode ? "sun" : "moon"} size={17} color="#fff"/>
        </button>
        <button className="topbar-btn" onClick={onOpenProfile} title="Profile">
          <Ico name="profile" size={17} color="#fff"/>
        </button>
        <button className="topbar-btn" onClick={onLogout} title="Logout"><Ico name="logout" size={17} color="#fff"/></button>
        </div>
      </div>
    </header>
  );
}

// LANDING
function Landing({ onSelect }) {
  const [mode, setMode] = useState(null); // null | 'admin' | 'student'
  const [email, setEmail] = useState(""); const [pwd, setPwd] = useState(""); const [err, setErr] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !pwd) { setErr("Please fill in both fields."); return; }
    if (mode === "student") {
      if (!/^\d{12}$/.test(email)) {
        setErr("Student ID must be exactly 12 digits.");
        return;
      }
      if (!/^\d{10}$/.test(pwd)) {
        setErr("Parent contact must be exactly 10 digits.");
        return;
      }
    }
    setErr("");
    setLoading(true);
    try {
      const payloadUser = { name: mode==="admin"?"Admin User":"Student User", role:mode, email };
      const result = await onSelect(mode, payloadUser, pwd);
      if (!result?.ok) {
        const rawErr = String(result?.error || "");
        const authErr = rawErr.toLowerCase().includes("invalid login credentials")
          ? "Invalid email or password. Create an account first if you are new."
          : (result?.error || "Sign in failed.");
        setErr(authErr);
      }
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  if (mode) return (
    <div className="landing">
      <div className="landing-box">
        <button className="brand-btn" onClick={() => window.location.reload()} title="Reload app">
          <div className="landing-logo"><img src="https://image2url.com/r2/default/images/1773576400522-25d9d22b-3e79-4a9a-adc2-eae0031fbfe1.png" alt="Campus Ghana"/></div>
        </button>
        <div className="landing-title">Sign In</div>
        <div className="landing-sub">{mode==="admin"?"Admin Portal":"Student Portal"}</div>
        <div className="login-form">
          <button className="login-back" onClick={()=>{setMode(null);setErr("");}}><Ico name="back" size={16} color="#1a56db"/> Back</button>
          {err && <div className="alert alert-danger">{err}</div>}
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><Ico name="email" size={18} color="#64748b"/></span>
            <input
              className="form-input"
              placeholder={mode==="admin"?"admin@campus.edu":"12-digit student ID"}
              value={email}
              onChange={e=>{
                const v = e.target.value;
                if (mode === "student") {
                  setEmail(v.replace(/\D/g, "").slice(0, 12));
                } else {
                  setEmail(v);
                }
              }}
              maxLength={mode === "student" ? 12 : 254}
              inputMode={mode === "student" ? "numeric" : "email"}
            />
          </div>
          <div className="auth-input-wrap">
            <span className="auth-input-icon"><Ico name="lock" size={18} color="#64748b"/></span>
            <input
              className="form-input"
              type={showPwd ? "text" : "password"}
              data-has-toggle="true"
              placeholder={mode==="admin"?"Password":"Parent contact"}
              value={pwd}
              onChange={e=>{
                const v = e.target.value;
                if (mode === "student") {
                  setPwd(v.replace(/\D/g, "").slice(0, 10));
                } else {
                  setPwd(v);
                }
              }}
              maxLength={mode === "student" ? 10 : 128}
              inputMode={mode === "student" ? "numeric" : "text"}
            />
            <button
              type="button"
              className="auth-pwd-toggle"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? "Hide password" : "Show password"}
              title={showPwd ? "Hide password" : "Show password"}
            >
              <Ico name={showPwd ? "eyeOff" : "eye"} size={18} color="#64748b"/>
            </button>
          </div>
          <button className="btn-primary" onClick={handle} disabled={loading}><Ico name="signin" size={18} color="#fff"/>{loading ? "Signing In..." : "Sign In"}</button>
          {!supabase && <div className="demo-hint">Demo: use any email + any password</div>}
        </div>
      </div>
    </div>
  );
  return (
    <div className="landing">
      <div className="landing-box">
        <button className="brand-btn" onClick={() => window.location.reload()} title="Reload app">
          <div className="landing-logo"><img src="https://image2url.com/r2/default/images/1773576400522-25d9d22b-3e79-4a9a-adc2-eae0031fbfe1.png" alt="Campus Ghana"/></div>
        </button>
        <div className="landing-title">Campus Ghana</div>
        <div className="landing-sub">School Management & BECE Mock Placement System</div>
        <div className="portal-grid">
          <button className="portal-btn" onClick={()=>setMode("admin")}>
            <div className="portal-btn-icon"><Ico name="schools" size={24} color="#1a56db"/></div>
            <div className="portal-btn-label">Admin</div>
            <div className="portal-btn-sub">Staff & management</div>
          </button>
          <button className="portal-btn" onClick={()=>setMode("student")}>
            <div className="portal-btn-icon"><Ico name="profile" size={24} color="#7c3aed"/></div>
            <div className="portal-btn-label">Student</div>
            <div className="portal-btn-sub">Students & parents</div>
          </button>
        </div>
      </div>
    </div>
  );
}

// DASHBOARD (Admin)
function AdminDashboard({ studentsData, schoolsData, pendingRows, confirmedRows, financeSummary, recentActivity }) {
  const { cfg } = useContext(SettingsContext);
  const schoolCount = schoolsData?.length || SCHOOLS_DATA.length;
  const totalStudents = studentsData?.length || STUDENTS_DATA.length;
  const pendingCount = pendingRows?.length || 0;
  const confirmedCount = confirmedRows?.length || 0;
  const placementCounts = (confirmedRows?.length ? confirmedRows : []).reduce((acc, row) => {
    const cat = String(row.category || "C").toUpperCase();
    if (cat === "A" || cat === "B" || cat === "C") acc[cat] += 1;
    return acc;
  }, { A: 0, B: 0, C: 0 });
  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Academic Year {cfg.academicYear} &mdash; {cfg.currentTerm} &mdash; Welcome back! Here's what's happening today.</div>
      </div>
      <div className="stats-grid">
        {[
          {label:"Total Students",value:String(totalStudents),sub:"Live student records",icon:"students",ic:"#0059ff",bgStart:"#eff5ff",bgEnd:"#9cc2ff",text:"#0039a6",border:"rgba(0,89,255,.22)",glow:"rgba(191,219,254,.98)",shadow:"rgba(0,89,255,.28)"},
          {label:"Pending Selections",value:String(pendingCount),sub:"Awaiting review",icon:"pending",ic:"#ff7a00",bgStart:"#fff4e8",bgEnd:"#ffc47a",text:"#a54800",border:"rgba(255,122,0,.24)",glow:"rgba(255,221,181,.98)",shadow:"rgba(255,122,0,.26)"},
          {label:"Confirmed Mock Placements",value:String(confirmedCount),sub:"Approved mock placements",icon:"confirmed",ic:"#00b86b",bgStart:"#ecfff5",bgEnd:"#92f0c2",text:"#007a46",border:"rgba(0,184,107,.22)",glow:"rgba(187,247,208,.98)",shadow:"rgba(0,184,107,.24)"},
          {label:"Schools Available",value:schoolCount,sub:"Across all regions",icon:"schools",ic:"#c026ff",bgStart:"#fdf0ff",bgEnd:"#efadff",text:"#8610b3",border:"rgba(192,38,255,.22)",glow:"rgba(243,205,255,.98)",shadow:"rgba(192,38,255,.24)"},
        ].map(s=>(
          <div key={s.label} className="stat-card dashboard-stat-card" style={{"--dash-bg-start":s.bgStart,"--dash-bg-end":s.bgEnd,"--dash-accent":s.ic,"--dash-text":s.text,"--dash-border":s.border,"--dash-glow":s.glow,"--dash-shadow":s.shadow}}>
            <div className="stat-icon"><Ico name={s.icon} size={20} color={s.ic}/></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid2" style={{marginBottom:16}}>
        <div className="card card-padded">
          <h3 style={{fontWeight:700,marginBottom:16,fontSize:"1rem",color:"#0f172a"}}>Recent Activity</h3>
          {(recentActivity?.length ? recentActivity : [{ id:"empty", text:"No recent activity available from current records.", timeLabel:"", dot:"#94a3b8" }]).map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<3?"1px solid #f1f5f9":"none"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:a.dot,flexShrink:0}}/>
              <span style={{fontSize:".85rem",flex:1}}>{a.text}</span>
              <span style={{fontSize:".75rem",color:"#94a3b8",flexShrink:0}}>{a.timeLabel}</span>
            </div>
          ))}
        </div>
        <div className="card card-padded">
          <h3 style={{fontWeight:700,marginBottom:16,fontSize:"1rem"}}>Mock Placement Summary</h3>
          {[{cat:"Category A",count:placementCounts.A,color:"#92400e",bg:"#fef3c7"},{cat:"Category B",count:placementCounts.B,color:"#1e40af",bg:"#dbeafe"},{cat:"Category C",count:placementCounts.C,color:"#166534",bg:"#dcfce7"}].map(c=>(
            <div key={c.cat} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontWeight:600,fontSize:".85rem"}}>{c.cat}</span>
                <span style={{color:c.color,fontWeight:700,fontSize:".85rem"}}>{c.count}</span>
              </div>
              <div className="progress"><div className="progress-bar" style={{width:`${confirmedCount ? (c.count/confirmedCount)*100 : 0}%`,background:c.color}}/></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActionStatusModal({ state, onClose }) {
  if (!state?.open) return null;
  const isSuccess = state.type === "success";

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1000);
    return () => clearTimeout(timer);
  }, [onClose, state?.open, state?.type, state?.title, state?.message]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" style={{maxWidth:460}} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head" style={{marginBottom:12}}>
          <div>
            <div className="modal-title" style={{color:isSuccess ? "#166534" : "#991b1b"}}>
              {state.title || (isSuccess ? "Update Successful" : "Update Failed")}
            </div>
            <div className="modal-sub" style={{fontSize:".88rem",marginTop:6,color:"#475569"}}>
              {state.message || (isSuccess ? "Your changes were saved." : "Something went wrong while saving your changes.")}
            </div>
          </div>
        </div>
        <div className="modal-actions" style={{marginTop:10}}>
          <button className={`btn ${isSuccess ? "btn-blue" : "btn-red"}`} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// STUDENTS LIST
function StudentsPage({ onEnroll, studentsData }) {
  const [search, setSearch] = useState("");
  const students = studentsData?.length ? sortStudentsByIndex(studentsData) : [];
  const filtered = students.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()) || String(s.index).includes(search));
  const initialsFor = (name) => String(name || "ST").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Students</div>
        <div className="page-sub">All enrolled JHS 3 students</div>
      </div>
      {!students.length && <div className="alert alert-warning">No student rows are currently available from Supabase.</div>}
      <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <input className="form-control" style={{flex:1,minWidth:200}} placeholder="Search students..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <button className="btn btn-blue" onClick={onEnroll}><Ico name="enroll" size={16} color="#fff"/> Enroll Student</button>
      </div>
      <div className="card table-wrap">
        <table className="students-table">
          <thead><tr><th>#</th><th data-col="photo"><span className="students-th-label">Photo</span></th><th data-col="name"><span className="students-th-label">Name</span></th><th data-col="student-id"><span className="students-th-label">Student ID</span></th><th data-col="class"><span className="students-th-label">Class</span></th><th data-col="region"><span className="students-th-label">Region</span></th><th data-col="aggregate"><span className="students-th-label">Aggregate</span></th></tr></thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id}>
                <td>{i+1}</td>
                <td>
                  {s.photo_url ? (
                    <img
                      src={s.photo_url}
                      alt={s.full_name}
                      style={{width:36,height:36,borderRadius:10,objectFit:"cover",border:"1px solid #dbeafe",display:"block"}}
                    />
                  ) : (
                    <div style={{width:36,height:36,borderRadius:10,background:"#dbeafe",color:"#1e40af",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:".72rem",border:"1px solid #bfdbfe"}}>
                      {initialsFor(s.full_name)}
                    </div>
                  )}
                </td>
                <td><strong>{s.full_name}</strong></td>
                <td className="students-id-cell">{s.index}</td>
                <td>{s.class}</td>
                <td>{s.region}</td>
                <td className="students-aggregate-cell"><span className="grade-chip" style={s.aggregate<=8?{background:"#dcfce7",color:"#16a34a"}:s.aggregate<=12?{background:"#dbeafe",color:"#1e40af"}:{background:"#fef3c7",color:"#d97706"}}>{s.aggregate}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ENROLL
function EnrollPage({ onBack }) {
  const [form, setForm] = useState({name:"",index:"",dob:"",class:"JHS 3A",region:"Ashanti",guardian:"",phone:"",photoUrl:""});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoPreview(ev.target.result);
      set("photoUrl", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const enrollStudent = async () => {
    if (!form.name.trim() || !form.index.trim()) {
      alert("Name and student ID are required.");
      return;
    }

    setSaving(true);
    const student = {
      id: Date.now(),
      full_name: form.name.trim(),
      index: form.index.trim(),
      class: form.class,
      region: form.region,
      aggregate: 0,
      status: "pending",
      photo_url: form.photoUrl.trim() || "",
    };

    if (supabase) {
      const payload = {
        full_name: student.full_name,
        index: student.index,
        class: student.class,
        region: student.region,
        aggregate: student.aggregate,
        status: student.status,
        dob: form.dob || null,
        guardian: form.guardian || null,
        phone: form.phone || null,
        photo_url: student.photo_url || null,
      };

      const { error } = await supabase.from("students").insert(payload);
      if (error && isMissingColumnError(error)) {
        // Fallback for schemas without photo_url column.
        const { photo_url, ...fallbackPayload } = payload;
        await supabase.from("students").insert(fallbackPayload);
      }
    }

    setSaving(false);
    setDone(true);
  };

  if (done) return (
    <div className="fade-in">
      <div className="alert alert-success" style={{marginBottom:16}}>Student enrolled successfully!</div>
      <button className="btn btn-outline" onClick={onBack}>{"<- Back to Students"}</button>
    </div>
  );
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Enroll New Student</div></div>
      <div className="card card-padded">
        <div style={{display:"flex",gap:24,alignItems:"flex-start",marginBottom:16}}>
          {/* Photo column */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,minWidth:110}}>
            <div style={{width:100,height:120,borderRadius:10,border:"2px dashed #cbd5e1",overflow:"hidden",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {photoPreview
                ? <img src={photoPreview} alt="Preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:4}}>No photo</span>
              }
            </div>
            <label className="form-label" style={{marginBottom:0}}>Photo</label>
            <input type="file" accept="image/*" style={{fontSize:11,width:100}} onChange={handlePhotoChange}/>
          </div>
          {/* Fields grid */}
          <div className="form-grid" style={{flex:1}}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={e=>set("name",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Student ID</label><input className="form-control" value={form.index} onChange={e=>set("index",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-control" value={form.dob} onChange={e=>set("dob",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Class</label>
              <select className="form-control" value={form.class} onChange={e=>set("class",e.target.value)}>
                {["JHS 3A","JHS 3B","JHS 3C"].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Region</label>
              <select className="form-control" value={form.region} onChange={e=>set("region",e.target.value)}>
                {GHANA_REGIONS.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Guardian Name</label><input className="form-control" value={form.guardian} onChange={e=>set("guardian",e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>set("phone",e.target.value)}/></div>
          </div>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button className="btn btn-blue" onClick={enrollStudent} disabled={saving}>{saving ? "Saving..." : "Enroll Student"}</button>
          <button className="btn btn-outline" onClick={onBack}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ SCORES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ScoresPage({ studentsData, tableInfo }) {
  const hasScoresError = hasRealTableError(tableInfo);
  const students = studentsData?.length ? sortStudentsByIndex(studentsData) : [];
  const studentsMap = new Map();
  students.forEach((student) => {
    studentsMap.set(String(student.id), student);
    studentsMap.set(String(student.index), student);
  });
  const scoreRows = Array.isArray(tableInfo?.rows) ? sortRecordsByStudentIndex(tableInfo.rows.map((row, index) => normalizeScoreRow(row, studentsMap, index))) : [];
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Test Scores</div></div>
      {hasScoresError && <div className="alert alert-warning">Supabase scores table is unavailable. Showing live student aggregates instead.</div>}
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Student ID</th><th>{scoreRows.length ? "Subject" : "Class"}</th><th>{scoreRows.length ? "Score" : "Aggregate"}</th><th>{scoreRows.length ? "Exam" : "Status"}</th></tr></thead>
          <tbody>
            {(scoreRows.length ? scoreRows : students).map((student) => {
              if (scoreRows.length) {
                const grade = getGrade(student.score);
                return (
                  <tr key={`score-${student.id}`}>
                    <td><strong>{student.studentName}</strong></td>
                    <td style={{fontFamily:"monospace"}}>{student.index}</td>
                    <td>{student.subject}</td>
                    <td><span className="grade-chip" style={{background:grade.bg,color:grade.color}}>{student.score}</span></td>
                    <td><span className="badge badge-blue">{student.examType}</span></td>
                  </tr>
                );
              }
              const aggregate = Number(student.aggregate ?? 0);
              const grade = getGrade(100 - Math.min(aggregate * 5, 95));
              return (
                <tr key={student.id}>
                  <td><strong>{student.full_name}</strong></td>
                  <td style={{fontFamily:"monospace"}}>{student.index}</td>
                  <td>{student.class}</td>
                  <td><span className="grade-chip" style={{background:grade.bg,color:grade.color}}>{aggregate}</span></td>
                  <td><span className={`badge ${student.status === "confirmed" ? "badge-success" : "badge-warning"}`}>{student.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ ANALYTICS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AnalyticsPage({ studentsData, schoolsData, selectionsData, scoreTableInfo }) {
  const hasScoreAnalyticsError = hasRealTableError(scoreTableInfo);
  const students = studentsData?.length ? studentsData : [];
  const schools = schoolsData?.length ? schoolsData : [];
  const selections = selectionsData?.length ? selectionsData : [];
  const averageAggregate = students.length ? (students.reduce((sum, student) => sum + Number(student.aggregate || 0), 0) / students.length).toFixed(1) : "-";
  const byRegion = students.reduce((acc, student) => {
    const region = student.region || "Unknown";
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});
  const regionStats = Object.entries(byRegion).sort((left, right) => right[1] - left[1]).slice(0, 6);
  const maxRegionCount = Math.max(1, ...regionStats.map(([, count]) => count));
  const categoryCounts = schools.reduce((acc, school) => {
    const key = String(school.category || "C").toUpperCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { A: 0, B: 0, C: 0 });
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Analytics</div><div className="page-sub">Live overview from accessible Supabase tables</div></div>
      {hasScoreAnalyticsError && <div className="alert alert-warning">Detailed score analytics are unavailable because the Supabase scores table is not accessible.</div>}
      <div className="stats-grid" style={{marginBottom:20}}>
        {[
          { label: "Students", value: students.length, bg: "#dbeafe", c: "#1d4ed8" },
          { label: "Submitted Selections", value: selections.length, bg: "#dcfce7", c: "#15803d" },
          { label: "Average Aggregate", value: averageAggregate, bg: "#fef3c7", c: "#b45309" },
          { label: "Schools", value: schools.length, bg: "#ede9fe", c: "#6d28d9" },
        ].map((item) => (
          <div key={item.label} className="stat-card" style={{background:item.bg}}>
            <div className="stat-label" style={{color:item.c}}>{item.label}</div>
            <div className="stat-value" style={{color:item.c}}>{item.value}</div>
          </div>
        ))}
      </div>
      <div className="grid2">
        <div className="card card-padded">
          <h3 style={{fontWeight:700,marginBottom:16,fontSize:"1rem"}}>Students By Region</h3>
          {regionStats.map(([region, count])=>(
            <div key={region} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:".8rem"}}>
                <span style={{fontWeight:600}}>{region}</span>
                <span style={{fontWeight:700,color:"#1d4ed8"}}>{count}</span>
              </div>
              <div className="progress"><div className="progress-bar" style={{width:`${(count/maxRegionCount)*100}%`,background:"#1d4ed8"}}/></div>
            </div>
          ))}
        </div>
        <div className="card card-padded">
          <h3 style={{fontWeight:700,marginBottom:16,fontSize:"1rem"}}>School Category Coverage</h3>
          {[["Category A",categoryCounts.A,"#fef3c7","#d97706"],
            ["Category B",categoryCounts.B,"#dbeafe","#1e40af"],
            ["Category C",categoryCounts.C,"#dcfce7","#16a34a"],
            ["Confirmed",selections.filter((row) => String(row.status || "").toLowerCase() === "confirmed").length,"#fee2e2","#dc2626"],
          ].map(([label,count,bg,color])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #f1f5f9"}}>
              <span style={{background:bg,color,padding:"4px 12px",borderRadius:8,fontWeight:700,fontSize:".85rem",minWidth:80,textAlign:"center"}}>{label}</span>
              <div className="progress" style={{flex:1}}><div className="progress-bar" style={{width:`${(count/Math.max(students.length || schools.length || 1, 1))*100}%`,background:color}}/></div>
              <span style={{fontWeight:700,width:32,textAlign:"right"}}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ ATTENDANCE (Admin) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function AttendancePage({ studentsData, tableInfo }) {
  const hasAttendanceError = hasRealTableError(tableInfo);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const rows = studentsData?.length ? studentsData : [];
  const [marks, setMarks] = useState({});
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", title: "", message: "" });
  const [loadingMarks, setLoadingMarks] = useState(false);

  useEffect(() => {
    setMarks(Object.fromEntries(rows.map(s=>[s.id,"Present"])));
  }, [studentsData]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!supabase) return;
      if (hasAttendanceError) {
        setLoadingMarks(false);
        return;
      }
      setLoadingMarks(true);
      const { data, error } = await supabase.from("attendance").select("*").eq("date", date);
      if (!error && Array.isArray(data) && data.length) {
        const next = Object.fromEntries(rows.map(s => [s.id, "Present"]));
        data.forEach((record) => {
          const match = rows.find((student) => String(student.id) === String(record.student_id) || String(student.index) === String(record.index_number));
          if (match) next[match.id] = record.status || "Present";
        });
        setMarks(next);
      }
      setLoadingMarks(false);
    };
    loadAttendance();
  }, [date, rows, hasAttendanceError]);

  const saveAttendance = async () => {
    if (hasAttendanceError) {
      setStatusModal({
        open: true,
        type: "failure",
        title: "Attendance Update Failed",
        message: "Attendance table is not accessible, so updates cannot be synced right now.",
      });
      return;
    }
    try {
      if (supabase) {
        const payload = rows.map((student) => ({
          student_id: student.id,
          index_number: student.index || student.index_number || null,
          date,
          status: marks[student.id] || "Present",
        }));
        for (const item of payload) {
          const { error } = await supabase.from("attendance").insert(item);
          if (error && !isMissingColumnError(error)) {
            const { error: upsertError } = await supabase.from("attendance").upsert(item);
            if (upsertError) throw upsertError;
          }
        }
      }
      setStatusModal({
        open: true,
        type: "success",
        title: "Attendance Updated",
        message: `Attendance was saved for ${date}.`,
      });
    } catch (error) {
      setStatusModal({
        open: true,
        type: "failure",
        title: "Attendance Update Failed",
        message: error?.message || "Could not save attendance. Please try again.",
      });
    }
  };
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Attendance</div></div>
      {hasAttendanceError && <div className="alert alert-warning">Attendance table is not accessible in Supabase yet. This page can display students, but attendance cannot sync online.</div>}
      <div style={{display:"flex",gap:12,marginBottom:16,alignItems:"center"}}>
        <input type="date" className="form-control" style={{width:"auto"}} value={date} onChange={e=>setDate(e.target.value)}/>
        <button className="btn btn-blue" onClick={saveAttendance} disabled={hasAttendanceError}>Save Attendance</button>
      </div>
      {loadingMarks && <div className="alert alert-info">Loading attendance...</div>}
      <ActionStatusModal state={statusModal} onClose={() => setStatusModal((s) => ({ ...s, open: false }))} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Class</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(s=>(
              <tr key={s.id}>
                <td><strong>{s.full_name}</strong></td>
                <td>{s.class}</td>
                <td>
                  <div style={{display:"flex",gap:8}}>
                    {["Present","Absent","Late"].map(st=>(
                      <button key={st} className="btn btn-sm" style={{
                        background:marks[s.id]===st?(st==="Present"?"#dcfce7":st==="Absent"?"#fee2e2":"#fef9c3"):"#f1f5f9",
                        color:marks[s.id]===st?(st==="Present"?"#16a34a":st==="Absent"?"#dc2626":"#d97706"):"#64748b",
                        border:"none",borderRadius:8,cursor:"pointer",fontFamily:"var(--font)",fontWeight:600,fontSize:".75rem",padding:"5px 10px"
                      }} onClick={()=>setMarks(m=>({...m,[s.id]:st}))}>{st}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ FEES (Admin) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FeesAdmin({ studentsData, feesData, tableInfo }) {
  const hasFeesError = hasRealTableError(tableInfo);
  const students = studentsData?.length ? studentsData : [];
  const fees = feesData?.length ? feesData : [];
  const totalCollected = fees.reduce((sum, fee) => sum + Number(fee.paid || 0), 0);
  const totalOutstanding = fees.reduce((sum, fee) => sum + Math.max(Number(fee.amount || 0) - Number(fee.paid || 0), 0), 0);
  const studentsPaid = fees.filter((fee) => String(fee.status) === "paid").length;
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Fees Management</div></div>
      {hasFeesError && <div className="alert alert-warning">Fees table is not accessible in Supabase yet. Totals below reflect only live rows currently available to the frontend.</div>}
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(3,1fr)",marginBottom:20}}>
        {[{label:"Total Collected",value:`GHS ${totalCollected.toLocaleString()}`,color:"#dcfce7",c:"#16a34a"},{label:"Outstanding",value:`GHS ${totalOutstanding.toLocaleString()}`,color:"#fee2e2",c:"#dc2626"},{label:"Students Paid",value:String(studentsPaid),color:"#dbeafe",c:"#1e40af"}].map(s=>(
          <div key={s.label} className="stat-card" style={{background:s.color}}>
            <div className="stat-label" style={{color:s.c}}>{s.label}</div>
            <div className="stat-value" style={{color:s.c,fontSize:"1.4rem"}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Term</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            {students.map((s,i)=>{
              const fee = fees.find((item) => String(item.student_id) === String(s.id) || String(item.index_number) === String(s.index)) || normalizeFeeRow({}, i);
              const bal = fee.amount - fee.paid;
              return (
                <tr key={s.id}>
                  <td><strong>{s.full_name}</strong></td>
                  <td>{fee.term}</td>
                  <td>GHS {fee.amount}</td>
                  <td>GHS {fee.paid}</td>
                  <td style={{color:bal>0?"#dc2626":"#16a34a",fontWeight:700}}>GHS {bal}</td>
                  <td><span className={`badge ${fee.status==="paid"?"badge-success":fee.status==="partial"?"badge-warning":"badge-danger"}`}>{fee.status}</span></td>
                </tr>
              );
            })}
            {!students.length && <tr><td colSpan="6" style={{textAlign:"center",padding:24,color:"#64748b"}}>No fee-linked student rows available.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ SCHOOLS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SchoolsPage({ schoolsData }) {
  const schools = sortSchoolsByCategory(schoolsData?.length ? schoolsData : SCHOOLS_DATA);
  const counts = schools.reduce((acc, school) => {
    const key = String(school.category || "").toUpperCase();
    if (key === "A" || key === "B" || key === "C") acc[key] += 1;
    return acc;
  }, { A: 0, B: 0, C: 0 });
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Schools</div><div className="page-sub">{`Secondary school database (${schools.length} schools: A ${counts.A}, B ${counts.B}, C ${counts.C})`}</div></div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>School</th><th>Region</th><th>Category</th><th>Cutoff</th><th>Slots</th></tr></thead>
          <tbody>
            {schools.map(s=>(
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.region}</td>
                <td><span className={`badge ${s.category==="A"?"badge-warning":s.category==="B"?"badge-blue":"badge-success"}`}>Cat {s.category}</span></td>
                <td style={{fontWeight:700}}>{s.cutoff}</td>
                <td>{s.slots}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ PENDING SELECTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PendingSelections({ rows, loading, onApprove }) {
  const displayRows = sortRecordsByStudentIndex(rows || []);

  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Pending Selections</div><div className="page-sub">Review and approve student school selections</div></div>
      {loading && <div className="alert alert-info">Loading pending selections...</div>}
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Student</th><th>1st Choice</th><th>2nd Choice</th><th>Aggregate</th><th>Action</th></tr></thead>
          <tbody>
            {displayRows.map(s=>(
              <tr key={s.id}>
                <td><strong>{String(s.user_email).split("@")[0].replace(/\./g, " ")}</strong><br/><span style={{fontSize:".75rem",color:"#94a3b8"}}>{s.user_email}</span></td>
                <td>{s.first}</td>
                <td>{s.second}</td>
                <td style={{fontWeight:700}}>{s.aggregate}</td>
                <td>
                  {s.approved ? <span className="badge badge-success">Approved</span> :
                    <button className="btn btn-sm btn-green" onClick={()=>onApprove?.(s.id)}>Approve</button>}
                </td>
              </tr>
            ))}
            {!displayRows.length && !loading && <tr><td colSpan="5" style={{textAlign:"center",padding:24,color:"#64748b"}}>There are currently no pending selections requiring review.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ CONFIRMED PLACEMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ConfirmedPlacements({ rows, loading }) {
  const confirmedRows = rows || [];
  const displayRows = sortRecordsByStudentIndex(confirmedRows);
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Confirmed Mock Placements</div></div>
      {loading && <div className="alert alert-info">Loading confirmed mock placements...</div>}
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Placed At</th><th>Category</th><th>Aggregate</th><th>Date</th></tr></thead>
          <tbody>
            {displayRows.map(s=>{
              return (
                <tr key={s.id}>
                  <td><strong>{s.studentName}</strong></td>
                  <td>{s.placedAt}</td>
                  <td><span className={`badge ${s.category==="A"?"badge-warning":s.category==="B"?"badge-blue":"badge-success"}`}>Cat {s.category}</span></td>
                  <td style={{fontWeight:700}}>{s.aggregate}</td>
                  <td>{s.reviewedAt ? new Date(s.reviewedAt).toLocaleDateString() : "-"}</td>
                </tr>
              );
            })}
            {!displayRows.length && !loading && <tr><td colSpan="5" style={{textAlign:"center",padding:24,color:"#64748b"}}>No confirmed selections found in Supabase.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ RESULTS SUMMARY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ResultsPage({ studentsData, tableInfo }) {
  const rankedStudents = [...(studentsData || [])]
    .filter((student) => student && student.full_name)
    .sort((left, right) => Number(left.aggregate ?? 999) - Number(right.aggregate ?? 999));
  const studentsMap = new Map();
  rankedStudents.forEach((student) => {
    studentsMap.set(String(student.id), student);
    studentsMap.set(String(student.index), student);
  });
  const resultRows = Array.isArray(tableInfo?.rows) ? tableInfo.rows.map((row, index) => normalizeResultRow(row, studentsMap, index)).sort((left, right) => left.rank - right.rank) : [];
  const displayRows = (resultRows.length ? resultRows : rankedStudents.map((student, i) => {
    const aggregate = Number(student.aggregate ?? 0);
    const averageScore = Math.max(0, 100 - (aggregate * 5));
    const grade = getGrade(averageScore);
    return {
      id: student.id,
      rank: i + 1,
      studentName: student.full_name,
      averageScore,
      aggregate,
      grade: grade.grade,
      gradeColor: grade.color,
      gradeBg: grade.bg,
    };
  }));
  const gradePalette = {
    A: "#16a34a",
    B: "#1d4ed8",
    C: "#d97706",
    D: "#dc2626",
    F: "#7f1d1d",
  };
  const gradeCounts = displayRows.reduce((acc, row) => {
    const key = String(row.grade || "F").toUpperCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { A: 0, B: 0, C: 0, D: 0, F: 0 });
  const totalCount = Math.max(displayRows.length, 1);
  const passCount = displayRows.filter((row) => Number(row.averageScore || 0) >= 50).length;
  const avgScore = displayRows.length
    ? Math.round(displayRows.reduce((sum, row) => sum + Number(row.averageScore || 0), 0) / displayRows.length)
    : 0;
  const passRate = Math.round((passCount / totalCount) * 100);
  const topRows = [...displayRows].slice(0, 6);
  const topScore = Math.max(...displayRows.map((row) => Number(row.averageScore || 0)), 1);
  const trendRows = [...displayRows].slice(0, 8);
  const chartW = 380;
  const chartH = 170;
  const points = trendRows.map((row, idx) => {
    const x = trendRows.length > 1 ? (idx * (chartW - 30)) / (trendRows.length - 1) + 15 : chartW / 2;
    const y = chartH - ((Math.max(0, Math.min(100, Number(row.averageScore || 0))) / 100) * 120 + 20);
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = points ? `${points} ${chartW - 15},${chartH - 10} 15,${chartH - 10}` : "";
  const donutSegments = ["A", "B", "C", "D", "F"];
  let progress = 0;
  const donutStops = donutSegments.map((grade) => {
    const portion = (gradeCounts[grade] || 0) / totalCount;
    const start = Math.round(progress * 360);
    progress += portion;
    const end = Math.round(progress * 360);
    return `${gradePalette[grade]} ${start}deg ${end}deg`;
  }).join(", ");
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Results Summary</div></div>
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,minmax(0,1fr))"}}>
        <div className="stat-card" style={{background:"#eef2ff"}}><div className="stat-label" style={{color:"#1e3a8a"}}>Total Students</div><div className="stat-value" style={{color:"#1e3a8a"}}>{displayRows.length}</div><div className="stat-sub" style={{color:"#1e3a8a"}}>Result rows in current view</div></div>
        <div className="stat-card" style={{background:"#dcfce7"}}><div className="stat-label" style={{color:"#166534"}}>Average Score</div><div className="stat-value" style={{color:"#166534"}}>{displayRows.length ? `${avgScore}%` : "N/A"}</div><div className="stat-sub" style={{color:"#166534"}}>Across ranked students</div></div>
        <div className="stat-card" style={{background:"#fef3c7"}}><div className="stat-label" style={{color:"#92400e"}}>Pass Rate</div><div className="stat-value" style={{color:"#92400e"}}>{displayRows.length ? `${passRate}%` : "N/A"}</div><div className="stat-sub" style={{color:"#92400e"}}>{passCount}/{displayRows.length} at 50% and above</div></div>
        <div className="stat-card" style={{background:"#dbeafe"}}><div className="stat-label" style={{color:"#1e40af"}}>Top Performer</div><div className="stat-value" style={{color:"#1e40af",fontSize:"1.15rem"}}>{displayRows[0]?.studentName || "N/A"}</div><div className="stat-sub" style={{color:"#1e40af"}}>{displayRows[0] ? `${displayRows[0].averageScore}%` : "No score data"}</div></div>
      </div>
      <div className="results-visual-grid">
        <div className="results-panel">
          <h3>Grade Distribution</h3>
          <div className="results-donut" style={{background:`conic-gradient(${donutStops || "#e2e8f0 0deg 360deg"})`}}>
            <div className="results-donut-center">
              <strong>{displayRows.length}</strong>
              <span>Students</span>
            </div>
          </div>
          <div className="results-legend">
            {donutSegments.map((grade) => (
              <div key={grade} className="results-legend-item">
                <span style={{display:"inline-flex",alignItems:"center"}}><span className="results-dot" style={{background:gradePalette[grade]}}/>Grade {grade}</span>
                <b>{gradeCounts[grade] || 0}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="results-panel">
          <h3>Top Performers</h3>
          <div className="results-bars">
            {topRows.map((row) => (
              <div key={`bar-${row.id}-${row.rank}`} className="results-bar-row">
                <span>#{row.rank}</span>
                <div className="results-bar-track">
                  <div className="results-bar-fill" style={{width:`${Math.round((Number(row.averageScore || 0) / topScore) * 100)}%`,background:row.averageScore >= 75 ? "#16a34a" : row.averageScore >= 60 ? "#d97706" : "#dc2626"}}/>
                </div>
                <strong>{row.averageScore}%</strong>
              </div>
            ))}
            {!topRows.length && <div style={{color:"#64748b",fontSize:".82rem"}}>No ranked data to display.</div>}
          </div>
        </div>
        <div className="results-panel">
          <h3>Performance Trend</h3>
          {trendRows.length ? (
            <>
              <svg className="results-line-chart" viewBox={`0 0 ${chartW} ${chartH}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="resultsLineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.45"/>
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.04"/>
                  </linearGradient>
                </defs>
                <line x1="15" y1={chartH - 10} x2={chartW - 15} y2={chartH - 10} stroke="#cbd5e1" strokeWidth="1"/>
                <line x1="15" y1="20" x2="15" y2={chartH - 10} stroke="#cbd5e1" strokeWidth="1"/>
                <polygon className="area" points={areaPoints}/>
                <polyline points={points}/>
                {trendRows.map((row, idx) => {
                  const x = trendRows.length > 1 ? (idx * (chartW - 30)) / (trendRows.length - 1) + 15 : chartW / 2;
                  const y = chartH - ((Math.max(0, Math.min(100, Number(row.averageScore || 0))) / 100) * 120 + 20);
                  return <circle key={`point-${row.id}-${idx}`} className="point" cx={x} cy={y} r="4" />;
                })}
              </svg>
              <div className="results-axis-labels"><span>Highest Rank</span><span>Lower Rank</span></div>
            </>
          ) : <div style={{color:"#64748b",fontSize:".82rem"}}>No trend data available.</div>}
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Rank</th><th>Student</th><th>Avg Score</th><th>Aggregate</th><th>Grade</th></tr></thead>
          <tbody>
            {displayRows.map((student,i)=>{
              const grade = getGrade(student.averageScore);
              return (
                <tr key={`result-${student.id}`}>
                  <td><strong style={{color:i===0?"#d97706":i===1?"#94a3b8":i===2?"#a37043":"#0f172a"}}>#{student.rank}</strong></td>
                  <td><strong>{student.studentName}</strong></td>
                  <td style={{fontWeight:700}}>{student.averageScore}%</td>
                  <td>{student.aggregate}</td>
                  <td><span className="grade-chip" style={{background:student.gradeBg || grade.bg,color:student.gradeColor || grade.color}}>{student.grade || grade.grade}</span></td>
                </tr>
              );
            })}
            {!rankedStudents.length && <tr><td colSpan="5" style={{textAlign:"center",padding:24,color:"#64748b"}}>No student aggregates available.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ FINANCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FinancePage({ financeSummary, tableInfo }) {
  const hasFinanceError = hasRealTableError(tableInfo);
  const summary = financeSummary || FINANCE_DATA;
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Finance</div></div>
      {hasFinanceError && <div className="alert alert-warning">Finance metrics are currently derived from accessible fee rows because the Supabase fees table is not available.</div>}
      <div className="stats-grid">
        {[
          {label:"Total Income",value:`GHS ${(summary.income/1000).toFixed(0)}k`,sub:"This year",bg:"#dcfce7",c:"#16a34a"},
          {label:"Total Expenses",value:`GHS ${(summary.expenses/1000).toFixed(0)}k`,sub:"This year",bg:"#fee2e2",c:"#dc2626"},
          {label:"Fees Collected",value:`GHS ${(summary.fees_collected/1000).toFixed(0)}k`,sub:"All terms",bg:"#dbeafe",c:"#1e40af"},
          {label:"Outstanding",value:`GHS ${(summary.outstanding/1000).toFixed(0)}k`,sub:"Pending",bg:"#fef3c7",c:"#d97706"},
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{background:s.bg}}>
            <div className="stat-label" style={{color:s.c}}>{s.label}</div>
            <div className="stat-value" style={{color:s.c,fontSize:"1.5rem"}}>{s.value}</div>
            <div className="stat-sub" style={{color:s.c}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="card card-padded">
        <h3 style={{fontWeight:700,marginBottom:16}}>Expense Breakdown</h3>
        {[["Staff Salaries","62,000","#1e40af"],["Utilities","12,000","#d97706"],["Maintenance","8,000","#7c3aed"],["Supplies","7,000","#16a34a"]].map(([cat,amt,c])=>(
          <div key={cat} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
            <span style={{minWidth:140,fontWeight:600,fontSize:".875rem"}}>{cat}</span>
            <div className="progress" style={{flex:1}}><div className="progress-bar" style={{width:`${parseInt(amt.replace(",",""))/890}%`,background:c}}/></div>
            <span style={{fontWeight:700,color:c,minWidth:72,textAlign:"right"}}>GHS {amt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// â”€â”€â”€ TEACHERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TeachersPage({ teachersData, tableInfo }) {
  const hasTeachersError = hasRealTableError(tableInfo);
  const rows = teachersData?.length ? teachersData : [];
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Teachers</div></div>
      {hasTeachersError && <div className="alert alert-warning">Teachers table is not accessible in Supabase yet.</div>}
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Subject</th><th>Classes</th><th>Phone</th></tr></thead>
          <tbody>
            {rows.map(t=>(
              <tr key={t.id}>
                <td><strong>{t.name}</strong></td>
                <td>{t.subject}</td>
                <td>{t.class}</td>
                <td style={{fontFamily:"monospace"}}>{t.phone}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="4" style={{textAlign:"center",padding:24,color:"#64748b"}}>No teacher rows available from Supabase.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ EVENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function EventsPage({ eventsData, tableInfo }) {
  const hasEventsError = hasRealTableError(tableInfo);
  const [form, setForm] = useState({title:"",date:"",type:"event",desc:""});
  const [events, setEvents] = useState(eventsData?.length ? eventsData.map(normalizeEventRow) : []);
  const [adding, setAdding] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", title: "", message: "" });

  useEffect(() => {
    setEvents(eventsData?.length ? eventsData.map(normalizeEventRow) : []);
  }, [eventsData]);

  const add = async () => {
    if(!form.title) return;
    if (supabase) {
      const { data, error } = await supabase
        .from("events")
        .insert({
          title: form.title,
          event_date: form.date || null,
          type: form.type,
          description: form.desc || null,
        })
        .select("id, title, event_date, type, description")
        .single();

      if (!error && data) {
        setEvents((e) => [
          ...e,
          {
            id: data.id,
            title: data.title || form.title,
            date: data.event_date || form.date,
            type: data.type || form.type,
            desc: data.description || form.desc,
          },
        ]);
        setStatusModal({
          open: true,
          type: "success",
          title: "Event Saved",
          message: "The event was saved to Supabase.",
        });
      } else {
        setEvents((e) => [...e, { id: Date.now(), ...form }]);
        setStatusModal({
          open: true,
          type: "failure",
          title: "Supabase Save Failed",
          message: "Event was saved locally only. Supabase write failed.",
        });
      }
    } else {
      setEvents((e) => [...e, { id: Date.now(), ...form }]);
      setStatusModal({
        open: true,
        type: "failure",
        title: "Saved Locally",
        message: "Supabase is not configured, so the event was saved locally only.",
      });
    }
    setAdding(false); setForm({title:"",date:"",type:"event",desc:""});
  };
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Events & Calendar</div></div>
      {hasEventsError && <div className="alert alert-warning">Events table could not be queried fully. Existing live rows are shown below.</div>}
      <ActionStatusModal state={statusModal} onClose={() => setStatusModal((s) => ({ ...s, open: false }))} />
      <div style={{marginBottom:16}}>
        <button className="btn btn-blue" onClick={()=>setAdding(!adding)}>{adding?"Cancel":"+ Add Event"}</button>
      </div>
      {adding && (
        <div className="card card-padded" style={{marginBottom:16}}>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Date</label><input type="date" className="form-control" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option value="event">Event</option><option value="exam">Exam</option><option value="meeting">Meeting</option>
              </select>
            </div>
            <div className="form-group"><label className="form-label">Description</label><input className="form-control" value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))}/></div>
          </div>
          <button className="btn btn-blue" style={{marginTop:12}} onClick={add}>Save Event</button>
        </div>
      )}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {events.map(e=>(
          <div key={e.id} className="card card-padded" style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{width:56,height:56,borderRadius:12,background:e.type==="exam"?"#fee2e2":e.type==="meeting"?"#dbeafe":"#dcfce7",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.4rem",flexShrink:0}}>
              {e.type==="exam" ? <Ico name="docs" size={22} color="#dc2626"/> : e.type==="meeting" ? <Ico name="students" size={22} color="#1e40af"/> : <Ico name="events" size={22} color="#16a34a"/>}
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700}}>{e.title}</div>
              <div style={{fontSize:".85rem",color:"#64748b"}}>{e.date} - {e.desc}</div>
            </div>
            <span className={`badge ${e.type==="exam"?"badge-danger":e.type==="meeting"?"badge-blue":"badge-success"}`}>{e.type}</span>
          </div>
        ))}
        {!events.length && <div className="card card-padded" style={{textAlign:"center",color:"#64748b"}}>No event rows are currently available from Supabase.</div>}
      </div>
    </div>
  );
}

// â”€â”€â”€ SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SettingsPage() {
  const { cfg: globalCfg, updateCfg } = useContext(SettingsContext);
  const [cfg, setCfg] = useState(globalCfg);
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", title: "", message: "" });

  // Sync local form state when global settings change (e.g. on first load from Supabase)
  useEffect(() => { setCfg(globalCfg); }, [globalCfg]);

  const set = (k,v)=>setCfg(c=>({...c,[k]:v}));
  const runConfigCheck = () => {
    const issues = [];
    if (!String(cfg.systemName || "").trim()) issues.push("System Name is required.");
    if (!String(cfg.academicYear || "").trim()) issues.push("Academic Year is required.");
    if (Number(cfg.maxChoices || 0) < 1 || Number(cfg.maxChoices || 0) > 10) issues.push("Max School Choices must be between 1 and 10.");
    if (Number(cfg.sessionTimeoutMins || 0) < 5 || Number(cfg.sessionTimeoutMins || 0) > 480) issues.push("Session Timeout must be between 5 and 480 minutes.");
    if (Number(cfg.passwordMinLength || 0) < 6 || Number(cfg.passwordMinLength || 0) > 32) issues.push("Password Minimum Length must be between 6 and 32.");
    if (Number(cfg.lockoutAttempts || 0) < 1 || Number(cfg.lockoutAttempts || 0) > 20) issues.push("Lockout Attempts must be between 1 and 20.");
    if (Number(cfg.auditRetentionDays || 0) < 30 || Number(cfg.auditRetentionDays || 0) > 3650) issues.push("Audit Retention must be between 30 and 3650 days.");
    if (Number(cfg.apiRateLimitPerMin || 0) < 10 || Number(cfg.apiRateLimitPerMin || 0) > 5000) issues.push("API Rate Limit must be between 10 and 5000 requests/min.");

    if (issues.length) {
      setStatusModal({
        open: true,
        type: "failure",
        title: "Configuration Check Failed",
        message: issues[0],
      });
      return false;
    }

    setStatusModal({
      open: true,
      type: "success",
      title: "Configuration Looks Good",
      message: "All key settings passed validation checks.",
    });
    return true;
  };

  const resetToDefaults = () => {
    setCfg(DEFAULT_SETTINGS);
    setStatusModal({
      open: true,
      type: "success",
      title: "Defaults Restored",
      message: "Settings were reset to default values. Click Save to apply.",
    });
  };

  const saveSettings = async () => {
    try {
      if (!runConfigCheck()) return;
      updateCfg(cfg);
      if (supabase) {
        const { error } = await supabase.from("app_settings").upsert({ id: 1, config: cfg });
        if (error) throw error;
      }
      setStatusModal({
        open: true,
        type: "success",
        title: "Settings Updated",
        message: "All settings were saved and applied across the app.",
      });
    } catch (error) {
      setStatusModal({
        open: true,
        type: "failure",
        title: "Settings Update Failed",
        message: error?.message || "Could not save settings. Please try again.",
      });
    }
  };

  const SectionTitle = ({title, sub}) => (
    <div style={{marginBottom:16,paddingBottom:8,borderBottom:"2px solid #e8f1ff"}}>
      <div style={{fontWeight:800,fontSize:"1rem",color:"#1e3a8a"}}>{title}</div>
      {sub && <div style={{fontSize:".8rem",color:"#64748b",marginTop:2}}>{sub}</div>}
    </div>
  );

  const Toggle = ({k, label, sub, danger}) => (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 0",borderBottom:"1px solid #f1f5f9"}}>
      <div>
        <div style={{fontWeight:600,fontSize:".9rem",color:danger&&cfg[k]?"#dc2626":"inherit"}}>{label}</div>
        {sub && <div style={{fontSize:".75rem",color:"#94a3b8",marginTop:1}}>{sub}</div>}
      </div>
      <button onClick={()=>set(k,!cfg[k])} style={{
        width:48,height:26,borderRadius:13,background:cfg[k]?(danger?"#dc2626":"#1a56db"):"#e2e8f0",
        border:"none",cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0,marginLeft:16
      }}>
        <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:cfg[k]?25:3,transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.2)"}}/>
      </button>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-sub">Configure system-wide options — changes apply instantly across the app</div>
      </div>
      <ActionStatusModal state={statusModal} onClose={() => setStatusModal((s) => ({ ...s, open: false }))} />

      {/* General */}
      <div className="card card-padded" style={{marginBottom:16}}>
        <SectionTitle title="General" sub="Basic system identity and academic period"/>
        <div className="form-grid" style={{marginBottom:8}}>
          <div className="form-group">
            <label className="form-label">System Name</label>
            <input className="form-control" value={cfg.systemName||""} onChange={e=>set("systemName",e.target.value)} placeholder="e.g. Campus Ghana"/>
          </div>
          <div className="form-group">
            <label className="form-label">Academic Year</label>
            <input className="form-control" value={cfg.academicYear||""} onChange={e=>set("academicYear",e.target.value)} placeholder="e.g. 2024/2025"/>
          </div>
          <div className="form-group">
            <label className="form-label">Current Term</label>
            <select className="form-control" value={cfg.currentTerm||"First Term"} onChange={e=>set("currentTerm",e.target.value)}>
              <option>First Term</option>
              <option>Second Term</option>
              <option>Third Term</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">School Region (Filter)</label>
            <select className="form-control" value={cfg.schoolRegion||"All Regions"} onChange={e=>set("schoolRegion",e.target.value)}>
              <option>All Regions</option>
              {GHANA_REGIONS.map(r=><option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Locale</label>
            <select className="form-control" value={cfg.locale||"en-GH"} onChange={e=>set("locale",e.target.value)}>
              <option value="en-GH">English (Ghana)</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select className="form-control" value={cfg.timezone||"Africa/Accra"} onChange={e=>set("timezone",e.target.value)}>
              <option value="Africa/Accra">Africa/Accra (GMT)</option>
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-control" value={cfg.currency||"GHS"} onChange={e=>set("currency",e.target.value)}>
              <option value="GHS">GHS</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Support Email</label>
            <input type="email" className="form-control" value={cfg.supportEmail||""} onChange={e=>set("supportEmail",e.target.value)} placeholder="support@campusghana.edu.gh"/>
          </div>
          <div className="form-group">
            <label className="form-label">Support Phone</label>
            <input className="form-control" value={cfg.supportPhone||""} onChange={e=>set("supportPhone",e.target.value)} placeholder="0240000000"/>
          </div>
        </div>
      </div>

      {/* Admissions */}
      <div className="card card-padded" style={{marginBottom:16}}>
        <SectionTitle title="Admissions & Mock Placement" sub="School selection and application window controls"/>
        <div className="form-grid" style={{marginBottom:8}}>
          <div className="form-group">
            <label className="form-label">Max School Choices</label>
            <input type="number" className="form-control" value={cfg.maxChoices||7} onChange={e=>set("maxChoices",+e.target.value)} min={1} max={10}/>
          </div>
          <div className="form-group">
            <label className="form-label">Selection Deadline</label>
            <input type="date" className="form-control" value={cfg.selectionDeadline||""} onChange={e=>set("selectionDeadline",e.target.value)}/>
          </div>
        </div>
        <Toggle k="allowChanges" label="Allow Selection Changes" sub="Students can edit their school choices"/>
        <Toggle k="studentPortalOpen" label="Student Portal Open" sub="Allow students to log in and access their portal"/>
        <Toggle k="autoApproveSelections" label="Auto-approve Selections" sub="Submitted selections are confirmed without admin review"/>
        <Toggle k="showResultsToStudents" label="Show Results to Students" sub="Students can view their academic scores and grades"/>
      </div>

      {/* Notifications */}
      <div className="card card-padded" style={{marginBottom:16}}>
        <SectionTitle title="Notifications" sub="Alert and messaging preferences"/>
        <Toggle k="emailNotifs" label="Email Notifications" sub="Send email alerts for submissions, approvals and updates"/>
        <Toggle k="smsNotifs" label="SMS Notifications" sub="Send SMS alerts to registered phone numbers"/>
      </div>

      {/* Security & Access */}
      <div className="card card-padded" style={{marginBottom:16}}>
        <SectionTitle title="Security & Access" sub="Session policy, password strength and admin hardening"/>
        <div className="form-grid" style={{marginBottom:8}}>
          <div className="form-group">
            <label className="form-label">Session Timeout (minutes)</label>
            <input type="number" min={5} max={480} className="form-control" value={cfg.sessionTimeoutMins||30} onChange={e=>set("sessionTimeoutMins",+e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Password Minimum Length</label>
            <input type="number" min={6} max={32} className="form-control" value={cfg.passwordMinLength||8} onChange={e=>set("passwordMinLength",+e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Account Lockout Attempts</label>
            <input type="number" min={1} max={20} className="form-control" value={cfg.lockoutAttempts||5} onChange={e=>set("lockoutAttempts",+e.target.value)}/>
          </div>
        </div>
        <Toggle k="twoFactorAdmins" label="Require 2FA For Admins" sub="Stronger login security for administrative users"/>
        <Toggle k="enforcePasswordRotation" label="Enforce Password Rotation" sub="Require password updates every 90 days"/>
      </div>

      {/* Platform Operations */}
      <div className="card card-padded" style={{marginBottom:16}}>
        <SectionTitle title="Platform Operations" sub="Backups, audit logging and API safeguards"/>
        <div className="form-grid" style={{marginBottom:8}}>
          <div className="form-group">
            <label className="form-label">Backup Frequency</label>
            <select className="form-control" value={cfg.backupFrequency||"daily"} onChange={e=>set("backupFrequency",e.target.value)}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Backup Time</label>
            <input type="time" className="form-control" value={cfg.backupTime||"02:00"} onChange={e=>set("backupTime",e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">Audit Retention (days)</label>
            <input type="number" min={30} max={3650} className="form-control" value={cfg.auditRetentionDays||180} onChange={e=>set("auditRetentionDays",+e.target.value)}/>
          </div>
          <div className="form-group">
            <label className="form-label">API Rate Limit (req/min)</label>
            <input type="number" min={10} max={5000} className="form-control" value={cfg.apiRateLimitPerMin||120} onChange={e=>set("apiRateLimitPerMin",+e.target.value)}/>
          </div>
        </div>
        <Toggle k="auditLogsEnabled" label="Enable Audit Logs" sub="Track critical settings, admissions and result actions"/>
      </div>

      {/* System */}
      <div className="card card-padded" style={{marginBottom:16}}>
        <SectionTitle title="System" sub="Advanced system controls"/>
        <Toggle k="maintenanceMode" label="Maintenance Mode" sub="Temporarily restrict access while performing updates" danger={true}/>
        <div style={{marginTop:8,padding:"10px 12px",background:"#fef9c3",borderRadius:8,fontSize:".82rem",color:"#92400e",display:cfg.maintenanceMode?"flex":"none",alignItems:"center",gap:8}}>
          ⚠️ Maintenance mode is <strong>ON</strong>. Students will see a maintenance banner. Disable when done.
        </div>
      </div>

      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <button className="btn btn-blue" onClick={saveSettings}>Save All Settings</button>
        <button className="btn btn-outline" onClick={runConfigCheck}>Run Configuration Check</button>
        <button className="btn btn-outline" onClick={()=>setCfg(globalCfg)}>Discard Changes</button>
        <button className="btn btn-outline" onClick={resetToDefaults}>Reset Defaults</button>
      </div>
    </div>
  );
}

function PermissionsMatrixPage() {
  const [matrix, setMatrix] = useState({
    admissions: { admin: true, staff: true, student: false },
    results: { admin: true, staff: true, student: true },
    finance: { admin: true, staff: false, student: false },
    settings: { admin: true, staff: false, student: false },
  });
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", title: "", message: "" });

  const toggle = (moduleKey, role) => setMatrix((m) => ({ ...m, [moduleKey]: { ...m[moduleKey], [role]: !m[moduleKey][role] } }));
  const save = () => setStatusModal({ open: true, type: "success", title: "Permissions Updated", message: "Role-based permission matrix saved." });

  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Permissions Matrix</div><div className="page-sub">Feature 1: Role-based permissions by module and role.</div></div>
      <ActionStatusModal state={statusModal} onClose={() => setStatusModal((s) => ({ ...s, open: false }))} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Module</th><th>Admin</th><th>Staff</th><th>Student</th></tr></thead>
          <tbody>
            {Object.entries(matrix).map(([moduleKey, roles]) => (
              <tr key={moduleKey}>
                <td style={{textTransform:"capitalize",fontWeight:700}}>{moduleKey}</td>
                {["admin", "staff", "student"].map((role) => (
                  <td key={role}><input type="checkbox" checked={!!roles[role]} onChange={() => toggle(moduleKey, role)} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn btn-blue" style={{marginTop:12}} onClick={save}>Save Matrix</button>
    </div>
  );
}

function AuditTrailPage() {
  const [logs, setLogs] = useState([
    { id: 1, actor: "Admin", action: "Updated settings", target: "System", at: new Date().toISOString() },
    { id: 2, actor: "Admissions", action: "Approved selection", target: "Student #2024001", at: new Date(Date.now() - 3600000).toISOString() },
  ]);
  const [filter, setFilter] = useState("");
  const rows = logs.filter((l) => [l.actor, l.action, l.target].join(" ").toLowerCase().includes(filter.toLowerCase()));
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Audit Trail</div><div className="page-sub">Feature 2: Immutable log of critical actions.</div></div>
      <input className="form-control" style={{maxWidth:340,marginBottom:12}} placeholder="Filter logs..." value={filter} onChange={(e) => setFilter(e.target.value)} />
      <div className="card table-wrap">
        <table>
          <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th></tr></thead>
          <tbody>{rows.map((l) => <tr key={l.id}><td>{new Date(l.at).toLocaleString()}</td><td>{l.actor}</td><td>{l.action}</td><td>{l.target}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function NotificationCenterPage() {
  const [template, setTemplate] = useState({ title: "", body: "", channel: "in-app" });
  const [history, setHistory] = useState([]);
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", title: "", message: "" });
  const send = () => {
    if (!template.title || !template.body) {
      setStatusModal({ open: true, type: "failure", title: "Message Not Sent", message: "Title and message body are required." });
      return;
    }
    setHistory((h) => [{ id: Date.now(), ...template, at: new Date().toISOString() }, ...h]);
    setTemplate({ title: "", body: "", channel: "in-app" });
    setStatusModal({ open: true, type: "success", title: "Notification Sent", message: "Message dispatched successfully." });
  };
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Notification Center</div><div className="page-sub">Feature 3: In-app/email/SMS notifications with templates.</div></div>
      <ActionStatusModal state={statusModal} onClose={() => setStatusModal((s) => ({ ...s, open: false }))} />
      <div className="card card-padded" style={{marginBottom:12}}>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Title</label><input className="form-control" value={template.title} onChange={(e) => setTemplate((t) => ({ ...t, title: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Channel</label><select className="form-control" value={template.channel} onChange={(e) => setTemplate((t) => ({ ...t, channel: e.target.value }))}><option value="in-app">In-app</option><option value="email">Email</option><option value="sms">SMS</option></select></div>
          <div className="form-group" style={{gridColumn:"1 / -1"}}><label className="form-label">Message</label><textarea className="form-control" rows={3} value={template.body} onChange={(e) => setTemplate((t) => ({ ...t, body: e.target.value }))} /></div>
        </div>
        <button className="btn btn-blue" style={{marginTop:10}} onClick={send}>Send Notification</button>
      </div>
      <div className="card table-wrap"><table><thead><tr><th>When</th><th>Channel</th><th>Title</th><th>Message</th></tr></thead><tbody>{history.map((h) => <tr key={h.id}><td>{new Date(h.at).toLocaleString()}</td><td>{h.channel}</td><td>{h.title}</td><td>{h.body}</td></tr>)}</tbody></table></div>
    </div>
  );
}

function PaymentsReceiptsPage() {
  const [form, setForm] = useState({ payer: "", amount: "", method: "mobile-money" });
  const [receipts, setReceipts] = useState([]);
  const add = () => {
    if (!form.payer || !form.amount) return;
    const receiptNo = `RCPT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    setReceipts((r) => [{ id: Date.now(), receiptNo, ...form, at: new Date().toISOString() }, ...r]);
    setForm({ payer: "", amount: "", method: "mobile-money" });
  };
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Payments & Receipts</div><div className="page-sub">Feature 5: Record payments and generate receipts.</div></div>
      <div className="card card-padded" style={{marginBottom:12}}>
        <div className="form-grid">
          <div className="form-group"><label className="form-label">Payer</label><input className="form-control" value={form.payer} onChange={(e) => setForm((f) => ({ ...f, payer: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Amount (GHS)</label><input className="form-control" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Method</label><select className="form-control" value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}><option value="mobile-money">Mobile Money</option><option value="card">Card</option><option value="cash">Cash</option></select></div>
        </div>
        <button className="btn btn-blue" style={{marginTop:10}} onClick={add}>Create Receipt</button>
      </div>
      <div className="card table-wrap"><table><thead><tr><th>Receipt</th><th>Payer</th><th>Amount</th><th>Method</th><th>Date</th></tr></thead><tbody>{receipts.map((r) => <tr key={r.id}><td>{r.receiptNo}</td><td>{r.payer}</td><td>GHS {r.amount}</td><td>{r.method}</td><td>{new Date(r.at).toLocaleString()}</td></tr>)}</tbody></table></div>
    </div>
  );
}

function DocumentWorkflowPage() {
  const [docs, setDocs] = useState([{ id: 1, student: "Kwame Asante", type: "Birth Certificate", status: "pending" }]);
  const update = (id, status) => setDocs((d) => d.map((x) => (x.id === id ? { ...x, status } : x)));
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Document Workflow</div><div className="page-sub">Feature 6: Verify and track student documents.</div></div>
      <div className="card table-wrap"><table><thead><tr><th>Student</th><th>Document</th><th>Status</th><th>Actions</th></tr></thead><tbody>{docs.map((d) => <tr key={d.id}><td>{d.student}</td><td>{d.type}</td><td><span className={`badge ${d.status === "approved" ? "badge-success" : d.status === "rejected" ? "badge-danger" : "badge-warning"}`}>{d.status}</span></td><td><button className="btn btn-sm btn-green" onClick={() => update(d.id, "approved")}>Approve</button> <button className="btn btn-sm btn-red" onClick={() => update(d.id, "rejected")}>Reject</button></td></tr>)}</tbody></table></div>
    </div>
  );
}

function ReportsExportsPage() {
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", title: "", message: "" });
  const trigger = (type) => setStatusModal({ open: true, type: "success", title: `${type} Report Ready`, message: `Feature 7: ${type} export generated.` });
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Reports & Exports</div><div className="page-sub">Feature 7: Generate CSV/PDF report packs.</div></div>
      <ActionStatusModal state={statusModal} onClose={() => setStatusModal((s) => ({ ...s, open: false }))} />
      <div className="grid3">
        {["Admissions", "Attendance", "Finance", "Results"].map((name) => (
          <div key={name} className="card card-padded"><div style={{fontWeight:700,marginBottom:10}}>{name} Report</div><button className="btn btn-blue btn-sm" onClick={() => trigger(name)}>Export CSV</button> <button className="btn btn-outline btn-sm" onClick={() => trigger(name)}>Export PDF</button></div>
        ))}
      </div>
    </div>
  );
}

function AdvancedAnalyticsPage() {
  const cards = [
    { label: "Enrollment Trend", value: "+12%", color: "#16a34a" },
    { label: "Attendance Risk", value: "8%", color: "#d97706" },
    { label: "Fee Default Risk", value: "11%", color: "#dc2626" },
    { label: "Mock Placement Success", value: "84%", color: "#1e40af" },
  ];
  return <div className="fade-in"><div className="page-header"><div className="page-title">Advanced Analytics</div><div className="page-sub">Feature 8: Trends, risks and forecasts.</div></div><div className="stats-grid">{cards.map((c) => <div key={c.label} className="stat-card"><div className="stat-label">{c.label}</div><div className="stat-value" style={{color:c.color}}>{c.value}</div><div className="stat-sub">Updated just now</div></div>)}</div></div>;
}

function BulkOperationsPage() {
  const [rows, setRows] = useState("");
  const [statusModal, setStatusModal] = useState({ open: false, type: "success", title: "", message: "" });
  const run = (action) => {
    const count = rows.split("\n").map((x) => x.trim()).filter(Boolean).length;
    setStatusModal({ open: true, type: count ? "success" : "failure", title: count ? "Bulk Operation Complete" : "No Rows Provided", message: count ? `${action} executed for ${count} rows.` : "Paste one record per line to continue." });
  };
  return (
    <div className="fade-in"><div className="page-header"><div className="page-title">Bulk Operations</div><div className="page-sub">Feature 9: Bulk import/update actions.</div></div>
      <ActionStatusModal state={statusModal} onClose={() => setStatusModal((s) => ({ ...s, open: false }))} />
      <div className="card card-padded"><label className="form-label">Paste rows (one per line)</label><textarea className="form-control" rows={8} value={rows} onChange={(e) => setRows(e.target.value)} /><div style={{display:"flex",gap:8,marginTop:10}}><button className="btn btn-blue" onClick={() => run("Import")}>Bulk Import</button><button className="btn btn-outline" onClick={() => run("Update")}>Bulk Update</button></div></div>
    </div>
  );
}

function OfflineSyncPage() {
  const [online, setOnline] = useState(globalThis.navigator?.onLine ?? true);
  const [queue, setQueue] = useState([{ id: 1, item: "Attendance sync", status: "queued" }]);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  const retry = () => setQueue((q) => q.map((x) => ({ ...x, status: online ? "synced" : "queued" })));
  return <div className="fade-in"><div className="page-header"><div className="page-title">Offline Sync</div><div className="page-sub">Feature 10: Offline queue and sync recovery.</div></div><div className="alert alert-info">Network: <strong>{online ? "Online" : "Offline"}</strong></div><div className="card table-wrap"><table><thead><tr><th>Queue Item</th><th>Status</th></tr></thead><tbody>{queue.map((q) => <tr key={q.id}><td>{q.item}</td><td>{q.status}</td></tr>)}</tbody></table></div><button className="btn btn-blue" style={{marginTop:10}} onClick={retry}>Retry Sync</button></div>;
}

function AcademicCalendarPage() {
  const [items, setItems] = useState([{ id: 1, title: "Midterm Exams", date: "2026-05-10", type: "exam" }]);
  const [form, setForm] = useState({ title: "", date: "", type: "event" });
  const add = () => { if (!form.title || !form.date) return; setItems((i) => [{ id: Date.now(), ...form }, ...i]); setForm({ title: "", date: "", type: "event" }); };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Academic Calendar</div><div className="page-sub">Feature 11: Term calendar and key academic milestones.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-grid"><div className="form-group"><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div><div className="form-group"><label className="form-label">Date</label><input type="date" className="form-control" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div><div className="form-group"><label className="form-label">Type</label><select className="form-control" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}><option value="event">Event</option><option value="exam">Exam</option><option value="deadline">Deadline</option></select></div></div><button className="btn btn-blue" style={{marginTop:10}} onClick={add}>Add Calendar Item</button></div><div className="card table-wrap"><table><thead><tr><th>Date</th><th>Title</th><th>Type</th></tr></thead><tbody>{items.map((i) => <tr key={i.id}><td>{i.date}</td><td>{i.title}</td><td>{i.type}</td></tr>)}</tbody></table></div></div>;
}

function HelpdeskPage() {
  const [tickets, setTickets] = useState([{ id: 1, subject: "Unable to update profile", status: "open", priority: "high" }]);
  const [form, setForm] = useState({ subject: "", priority: "medium" });
  const add = () => { if (!form.subject) return; setTickets((t) => [{ id: Date.now(), subject: form.subject, priority: form.priority, status: "open" }, ...t]); setForm({ subject: "", priority: "medium" }); };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Helpdesk</div><div className="page-sub">Feature 12: Internal ticketing and support workflow.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-grid"><div className="form-group"><label className="form-label">Issue Subject</label><input className="form-control" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} /></div><div className="form-group"><label className="form-label">Priority</label><select className="form-control" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}><option>low</option><option>medium</option><option>high</option></select></div></div><button className="btn btn-blue" style={{marginTop:10}} onClick={add}>Create Ticket</button></div><div className="card table-wrap"><table><thead><tr><th>Subject</th><th>Priority</th><th>Status</th></tr></thead><tbody>{tickets.map((t) => <tr key={t.id}><td>{t.subject}</td><td>{t.priority}</td><td>{t.status}</td></tr>)}</tbody></table></div></div>;
}

function PrivacyCompliancePage() {
  const [cfg, setCfg] = useState({ consentRequired: true, dataExportEnabled: true, rightToDeleteEnabled: true });
  return <div className="fade-in"><div className="page-header"><div className="page-title">Privacy & Compliance</div><div className="page-sub">Feature 13: Consent, retention and data rights controls.</div></div><div className="card card-padded">{[["consentRequired","Require consent capture"],["dataExportEnabled","Allow data export requests"],["rightToDeleteEnabled","Allow right-to-delete requests"]].map(([k,l]) => <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #f1f5f9"}}><span style={{fontWeight:600}}>{l}</span><input type="checkbox" checked={!!cfg[k]} onChange={() => setCfg((c) => ({ ...c, [k]: !c[k] }))} /></div>)}</div></div>;
}

function DisasterRecoveryPage() {
  const [points, setPoints] = useState([{ id: 1, name: "Nightly Backup", at: new Date().toISOString(), status: "verified" }]);
  const createPoint = () => setPoints((p) => [{ id: Date.now(), name: "Manual Restore Point", at: new Date().toISOString(), status: "pending" }, ...p]);
  const verify = (id) => setPoints((p) => p.map((x) => x.id === id ? { ...x, status: "verified" } : x));
  return <div className="fade-in"><div className="page-header"><div className="page-title">Disaster Recovery</div><div className="page-sub">Feature 14: Restore points and recovery validation.</div></div><button className="btn btn-blue" style={{marginBottom:10}} onClick={createPoint}>Create Restore Point</button><div className="card table-wrap"><table><thead><tr><th>Name</th><th>Created</th><th>Status</th><th>Action</th></tr></thead><tbody>{points.map((p) => <tr key={p.id}><td>{p.name}</td><td>{new Date(p.at).toLocaleString()}</td><td>{p.status}</td><td><button className="btn btn-sm btn-outline" onClick={() => verify(p.id)}>Test Restore</button></td></tr>)}</tbody></table></div></div>;
}

function MobilePwaPage() {
  const [cfg, setCfg] = useState({ pushEnabled: true, biometricPreferred: false, compactMode: true });
  return <div className="fade-in"><div className="page-header"><div className="page-title">Mobile & PWA</div><div className="page-sub">Feature 15: Mobile optimization and installable app controls.</div></div><div className="card card-padded"><div style={{marginBottom:10,color:"#475569"}}>Install status: {window.matchMedia && window.matchMedia("(display-mode: standalone)").matches ? "Installed" : "Browser mode"}</div>{[["pushEnabled","Enable push notifications"],["biometricPreferred","Prefer biometric unlock"],["compactMode","Compact mobile layout"]].map(([k,l]) => <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid #f1f5f9"}}><span style={{fontWeight:600}}>{l}</span><input type="checkbox" checked={!!cfg[k]} onChange={() => setCfg((c) => ({ ...c, [k]: !c[k] }))} /></div>)}</div></div>;
}

// â”€â”€â”€ CHAT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ChatPage({ chatUsers, onChatUsersChange }) {
  const [selectedUserId, setSelectedUserId] = useState(1);
  const [msgs, setMsgs] = useState([
    {id:1,text:"Hello! How can I help you today?",mine:false,time:"10:00"},
    {id:2,text:"I have a question about school selection",mine:true,time:"10:01"},
    {id:3,text:"Sure! You can select up to 6 schools before May 15.",mine:false,time:"10:02"},
  ]);
  const [input, setInput] = useState("");
  const userEmail = getSessionUserEmail();
  const selectedUser = chatUsers.find(u => u.id === selectedUserId);

  const refreshUnreadCounts = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("chat_messages")
      .select("peer_id, is_read, mine")
      .eq("user_email", userEmail)
      .eq("mine", false);

    if (error) {
      if (isMissingColumnError(error)) {
        onChatUsersChange((users) => users.map((u) => ({ ...u, unread: 0 })));
      }
      return;
    }

    const unreadByPeer = new Map();
    (data || []).forEach((row) => {
      if (!row?.is_read) {
        const key = Number(row.peer_id);
        unreadByPeer.set(key, (unreadByPeer.get(key) || 0) + 1);
      }
    });

    onChatUsersChange((users) => users.map((u) => ({ ...u, unread: unreadByPeer.get(u.id) || 0 })));
  }, [onChatUsersChange, userEmail]);

  const markConversationRead = useCallback(async (peerId) => {
    if (!supabase) return;
    const nowIso = new Date().toISOString();
    const { error } = await supabase
      .from("chat_messages")
      .update({ is_read: true, read_at: nowIso })
      .eq("user_email", userEmail)
      .eq("peer_id", peerId)
      .eq("mine", false)
      .eq("is_read", false);

    if (error && !isMissingColumnError(error)) {
      await supabase
        .from("chat_messages")
        .update({ is_read: true })
        .eq("user_email", userEmail)
        .eq("peer_id", peerId)
        .eq("mine", false);
    }
  }, [userEmail]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!supabase) return;
      let data = null;
      let error = null;
      ({ data, error } = await supabase
        .from("chat_messages")
        .select("id, text, mine, time, peer_id, is_read")
        .eq("user_email", userEmail)
        .eq("peer_id", selectedUserId)
        .order("id", { ascending: true }));

      if (error && isMissingColumnError(error)) {
        ({ data } = await supabase
          .from("chat_messages")
          .select("id, text, mine, time, peer_id")
          .eq("user_email", userEmail)
          .eq("peer_id", selectedUserId)
          .order("id", { ascending: true }));
      }

      if (Array.isArray(data) && data.length > 0) {
        setMsgs(data.map((m) => ({ id: m.id, text: m.text, mine: !!m.mine, time: m.time || "" })));
      }

      await markConversationRead(selectedUserId);
      await refreshUnreadCounts();
    };
    loadMessages();
  }, [markConversationRead, refreshUnreadCounts, selectedUserId, userEmail]);

  useEffect(() => {
    refreshUnreadCounts();
  }, [refreshUnreadCounts]);
  
  const handleSelectUser = async (userId) => {
    setSelectedUserId(userId);
    onChatUsersChange(u => u.map(user => user.id === userId ? {...user, unread:0} : user));
    await markConversationRead(userId);
    await refreshUnreadCounts();
  };
  
  const send = async () => {
    if(!input.trim()) return;
    const t = new Date().toTimeString().slice(0,5);
    const newMsg = {id:Date.now(),text:input,mine:true,time:t};
    setMsgs(m=>[...m,newMsg]);
    if (supabase) {
      const { error } = await supabase.from("chat_messages").insert({
        user_email: userEmail,
        peer_id: selectedUserId,
        text: newMsg.text,
        mine: true,
        time: t,
        is_read: true,
        read_at: new Date().toISOString(),
      });
      if (error && isMissingColumnError(error)) {
        await supabase.from("chat_messages").insert({
          user_email: userEmail,
          peer_id: selectedUserId,
          text: newMsg.text,
          mine: true,
          time: t,
        });
      }
    }
    setInput("");
    setTimeout(async ()=>{
      const reply = {id:Date.now()+1,text:"Thanks for your message! I'll get back to you shortly.",mine:false,time:t};
      setMsgs(m=>[...m,reply]);
      if (supabase) {
        const { error } = await supabase.from("chat_messages").insert({
          user_email: userEmail,
          peer_id: selectedUserId,
          text: reply.text,
          mine: false,
          time: t,
          is_read: false,
        });
        if (error && isMissingColumnError(error)) {
          await supabase.from("chat_messages").insert({
            user_email: userEmail,
            peer_id: selectedUserId,
            text: reply.text,
            mine: false,
            time: t,
          });
        }
      }
      await refreshUnreadCounts();
    },1000);
  };
  
  return (
    <div className="fade-in" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 120px)",overflow:"hidden"}}>
      <div className="page-header" style={{flexShrink:0}}><div className="page-title">Messages</div></div>
      <div style={{display:"grid",gridTemplateColumns:"min(280px,35%) 1fr",gap:0,flex:1,overflow:"hidden",borderRadius:8,boxShadow:"0 1px 3px rgba(0,0,0,.1)"}}>
        <div style={{background:"#fff",borderRight:"1px solid #e2e8f0",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:16,borderBottom:"1px solid #e2e8f0",flexShrink:0}}>
            <div style={{fontSize:".875rem",fontWeight:700,color:"#64748b"}}>CONVERSATIONS</div>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            {chatUsers.map(u => (
              <button key={u.id} onClick={() => handleSelectUser(u.id)} style={{
                width:"100%",padding:12,border:"none",cursor:"pointer",
                borderBottom:"1px solid #f1f5f9",textAlign:"left",transition:"background .15s",
                background: selectedUserId === u.id ? "#f0f9ff" : "transparent",
                ':hover': {background:"#f9fafb"}
              }} onMouseEnter={(e)=>e.target.style.background=selectedUserId!==u.id?"#f9fafb":"#f0f9ff"} onMouseLeave={(e)=>e.target.style.background=selectedUserId===u.id?"#f0f9ff":"transparent"}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{position:"relative",width:40,height:40,borderRadius:50,background:"#dbeafe",color:"#1e40af",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:".95rem",flexShrink:0}}>
                    {u.avatar}
                    {u.status==="active" && <div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:50,background:"#10b981",border:"2px solid #fff"}}/>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:".9rem",color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.name}</div>
                    <div style={{fontSize:".75rem",color:"#94a3b8"}}>{u.status}</div>
                  </div>
                  {u.unread > 0 && <div style={{background:"#ef4444",color:"#fff",fontWeight:700,fontSize:".65rem",width:20,height:20,borderRadius:50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{u.unread}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",background:"#f8fafc",overflow:"hidden"}}>
          <div style={{padding:16,borderBottom:"1px solid #e2e8f0",background:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{position:"relative",width:40,height:40,borderRadius:50,background:"#dbeafe",color:"#1e40af",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>
                {selectedUser?.avatar}
                {selectedUser?.status==="active" && <div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:50,background:"#10b981",border:"2px solid #fff"}}/>}
              </div>
              <div>
                <div style={{fontWeight:700,color:"#0f172a"}}>{selectedUser?.name}</div>
                <div style={{fontSize:".75rem",color:"#94a3b8"}}>{selectedUser?.status}</div>
              </div>
            </div>
            <div style={{fontSize:".75rem",color:"#94a3b8",background:"#f1f5f9",padding:"4px 8px",borderRadius:4}}>#{selectedUser?.id}</div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:12}}>
            {msgs.map(m=>(
              <div key={m.id} style={{display:"flex",justifyContent:m.mine?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"60%",background:m.mine?"#1a56db":"#fff",color:m.mine?"#fff":"#0f172a",padding:"10px 14px",borderRadius:8,boxShadow:"0 1px 2px rgba(0,0,0,.05)",borderTopLeftRadius:m.mine?8:4,borderTopRightRadius:m.mine?4:8}}>
                  <div style={{fontSize:".9rem",lineHeight:1.4}}>{m.text}</div>
                  <div style={{fontSize:".7rem",opacity:m.mine?.7:.5,marginTop:4}}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:16,borderTop:"1px solid #e2e8f0",background:"#fff",display:"flex",gap:8,flexShrink:0}}>
            <input className="form-control" style={{flex:1,padding:"10px 12px",fontSize:".9rem",border:"1px solid #d1d5db",borderRadius:6}} value={input} onChange={e=>setInput(e.target.value)} placeholder="Type a message..." onKeyDown={e=>e.key==="Enter"&&send()}/>
            <button style={{background:"#1a56db",color:"#fff",border:"none",padding:"10px 20px",borderRadius:6,fontWeight:600,cursor:"pointer",transition:"background .2s",fontSize:".9rem"}} onClick={send} onMouseEnter={(e)=>e.target.style.background="#1e40af"} onMouseLeave={(e)=>e.target.style.background="#1a56db"}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ GRADING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function GradingPage() {
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Grade Report</div></div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Student</th>{SUBJECTS.map(s=><th key={s} style={{fontSize:".7rem"}}>{s.substring(0,8)}</th>)}<th>Avg</th><th>Grade</th></tr></thead>
          <tbody>
            {SCORES_DATA.map(s=>{
              const vals = Object.values(s.scores);
              const avg = Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
              const g = getGrade(avg);
              return (
                <tr key={s.student_id}>
                  <td style={{fontWeight:700,whiteSpace:"nowrap"}}>{s.name.split(" ")[0]}</td>
                  {SUBJECTS.map(sub=>{
                    const sc = s.scores[sub]; const gg = getGrade(sc);
                    return <td key={sub} style={{background:gg.bg,color:gg.color,fontWeight:700,textAlign:"center"}}>{sc}</td>;
                  })}
                  <td style={{fontWeight:800}}>{avg}</td>
                  <td><span className="grade-chip" style={{background:g.bg,color:g.color}}>{g.grade}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ STUDENT DASHBOARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StudentDashboard({ user, studentData, attendanceData, feesData, selectionInfo, scoreValues }) {
  const { cfg } = useContext(SettingsContext);
  const student = studentData || { full_name: user?.name || "Student", index: "-", class: "-", region: "-" };
  const avatarInitials = (user?.name||student?.full_name||"K").split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  const money = new Intl.NumberFormat(cfg.locale || "en-GH", { style: "currency", currency: cfg.currency || "GHS", maximumFractionDigits: 0 });
  const baseScores = Array.isArray(scoreValues) ? scoreValues : [];
  const avg = Math.round(Object.values(baseScores).reduce((a,b)=>a+b,0)/Math.max(Object.values(baseScores).length, 1));
  const g = getGrade(avg);
  const attendanceRows = Array.isArray(attendanceData) ? attendanceData : [];
  const feeRows = Array.isArray(feesData) ? feesData : [];
  const present = attendanceRows.filter(a=>String(a.status).toLowerCase()==="present").length;
  const outstanding = feeRows.reduce((sum, f) => sum + Math.max((Number(f.amount)||0) - (Number(f.paid)||0), 0), 0);
  const selectionCount = Number(selectionInfo?.count || 0);
  const selectionStatus = String(selectionInfo?.status || "not-submitted").toLowerCase();
  const selectionLabel = selectionStatus === "confirmed" ? "Confirmed" : selectionStatus === "submitted" || selectionStatus === "pending" ? "Submitted" : "Not Submitted";
  return (
    <div className="fade-in">
      <div className="profile-header">
        <div className="profile-avatar" style={{overflow:"hidden",padding:0}}>
          {student?.photo_url ? (
            <img src={student.photo_url} alt={student.full_name || "Student"} style={{width:"100%",height:"100%",objectFit:"cover"}} />
          ) : (
            avatarInitials
          )}
        </div>
        <div>
          <div className="profile-name">{user?.name || student.full_name}</div>
          <div className="profile-role">Student ID: {student.index} - {student.class}</div>
          <div style={{marginTop:6,fontSize:".82rem",opacity:.85}}>{student.region} Region &nbsp;·&nbsp; <strong>{cfg.currentTerm}</strong> &nbsp;·&nbsp; {cfg.academicYear}</div>
          {cfg.selectionDeadline && <div style={{marginTop:4,fontSize:".78rem",color:"#ef4444",fontWeight:600}}>Selection Deadline: {cfg.selectionDeadline}</div>}
        </div>
      </div>
      <div className="stats-grid">
        {[
          cfg.showResultsToStudents
            ? {label:"Current Average",value:baseScores.length?`${avg}%`:"N/A",sub:baseScores.length?g.grade:"No score records",ic:g.grade === "A1" ? "#00b86b" : g.grade === "B2" || g.grade === "B3" ? "#0059ff" : "#ff7a00",bgStart:g.grade === "A1" ? "#ecfff5" : g.grade === "B2" || g.grade === "B3" ? "#eff5ff" : "#fff4e8",bgEnd:g.grade === "A1" ? "#92f0c2" : g.grade === "B2" || g.grade === "B3" ? "#9cc2ff" : "#ffc47a",text:g.grade === "A1" ? "#007a46" : g.grade === "B2" || g.grade === "B3" ? "#0039a6" : "#a54800",icon:"results"}
            : {label:"Current Average",value:"—",sub:"Results hidden by admin",ic:"#64748b",bgStart:"#f8fafc",bgEnd:"#dce6f2",text:"#475569",icon:"results"},
          {label:"Attendance Rate",value:`${Math.round(present/Math.max(attendanceRows.length,1)*100)}%`,sub:`${present}/${attendanceRows.length} days`,ic:"#00b86b",bgStart:"#ecfff5",bgEnd:"#92f0c2",text:"#007a46",icon:"attendance"},
          {label:"Fees Status",value:outstanding>0?"Outstanding":"Cleared",sub:`${money.format(outstanding)} outstanding`,ic:outstanding>0?"#ff7a00":"#00b86b",bgStart:outstanding>0?"#fff4e8":"#ecfff5",bgEnd:outstanding>0?"#ffc47a":"#92f0c2",text:outstanding>0?"#a54800":"#007a46",icon:"fees"},
          {label:"Selection",value:selectionLabel,sub:`${selectionCount} choice(s) made`,ic:"#c026ff",bgStart:"#fdf0ff",bgEnd:"#efadff",text:"#8610b3",icon:"selection"},
        ].map(s=>(
          <div key={s.label} className="stat-card dashboard-stat-card" style={{"--dash-bg-start":s.bgStart,"--dash-bg-end":s.bgEnd,"--dash-accent":s.ic,"--dash-text":s.text,"--dash-border":"rgba(148,163,184,.18)","--dash-glow":"rgba(255,255,255,.82)","--dash-shadow":"rgba(30,41,59,.22)"}}>
            <div className="stat-icon"><Ico name={s.icon} size={20} color={s.ic}/></div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{fontSize:"1.5rem"}}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="card card-padded">
        <h3 style={{fontWeight:700,marginBottom:12}}>Announcements</h3>
        {ANNOUNCEMENTS.map(a=>(
          <div key={a.id} className={`alert ${a.type==="urgent"?"alert-danger":a.type==="info"?"alert-info":"alert-warning"}`} style={{marginBottom:8}}>
            <strong>{a.title}</strong> â€” {a.body} <span style={{opacity:.7,fontSize:".78rem"}}>({a.date})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// â”€â”€â”€ STUDENT PROFILE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StudentProfile({ user, studentData }) {
  const { cfg } = useContext(SettingsContext);
  const isLoadingProfile = !studentData;
  const student = studentData || {
    full_name: "Loading profile...",
    index: "--",
    class: "--",
    region: "--",
    aggregate: null,
    photo_url: "",
  };
  const initials = String(student?.full_name || user?.name || "ST")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const aggregateValue = isLoadingProfile ? null : Number(student?.aggregate ?? 0);
  const readiness = aggregateValue == null ? null : Math.max(0, 100 - (aggregateValue * 5));
  const readinessGrade = getGrade(readiness);
  const supportEmail = cfg.supportEmail || "support@campusghana.edu";
  const supportPhone = cfg.supportPhone || "+233 00 000 0000";

  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">My Profile</div><div className="page-sub">{cfg.systemName} • {cfg.currentTerm} • {cfg.academicYear}</div></div>
      {isLoadingProfile && <div className="alert alert-info">Loading your profile data...</div>}
      <div className="student-profile-shell">
        <section className="student-profile-hero">
          <div className="student-profile-avatar" style={{overflow:"hidden",padding:0}}>
            {student?.photo_url ? (
              <img src={student.photo_url} alt={student.full_name || "Student"} style={{width:"100%",height:"100%",objectFit:"cover"}} />
            ) : (
              initials || "ST"
            )}
          </div>
          <div>
            <div className="student-profile-title">{student.full_name || user?.name || "Student"}</div>
            <div className="student-profile-meta">Student ID: {student.index || "-"} • {student.class || "-"} • {student.region || "-"} Region</div>
            <span className="student-profile-pill">Student Profile</span>
          </div>
          <div className="student-profile-term">
            <small>Academic Session</small>
            <strong>{cfg.currentTerm}</strong>
            <span style={{fontSize:".78rem",color:"#e2e8f0"}}>{cfg.academicYear}</span>
          </div>
        </section>

        <section className="student-profile-grid">
          <article className="student-profile-card">
            <div className="student-profile-card-head">
              <h3>Personal And Academic Details</h3>
              <span className="badge badge-blue">Verified</span>
            </div>
            <div className="student-profile-card-body">
              <div className="student-profile-list">
                {[
                  ["Full Name", student.full_name || user?.name || "-"],
                  ["Student ID", student.index || "-"],
                  ["Class", student.class || "-"],
                  ["Region", student.region || "-"],
                  ["Aggregate", Number.isFinite(aggregateValue) ? aggregateValue : "-"],
                ].map(([label, value]) => (
                  <div key={label} className="student-profile-row">
                    <label>{label}</label>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="student-profile-card">
            <div className="student-profile-card-head">
              <h3>Support And Readiness</h3>
              <span className="badge badge-success">Live</span>
            </div>
            <div className="student-profile-card-body">
              <div className="student-profile-kpis">
                <div className="student-profile-kpi" style={{background:readinessGrade.bg}}>
                  <label style={{color:readinessGrade.color}}>Readiness Score</label>
                  <strong style={{color:readinessGrade.color}}>{readiness == null ? "Loading..." : `${readiness}% (${readinessGrade.grade})`}</strong>
                  <small style={{color:readinessGrade.color}}>{readiness == null ? "Will calculate after profile loads" : "Estimated from your current aggregate"}</small>
                </div>
                <div className="student-profile-kpi" style={{background:"#eff6ff"}}>
                  <label style={{color:"#1d4ed8"}}>Support Email</label>
                  <strong style={{color:"#1e3a8a",fontSize:".9rem"}}>{supportEmail}</strong>
                </div>
                <div className="student-profile-kpi" style={{background:"#f0fdf4"}}>
                  <label style={{color:"#15803d"}}>Support Phone</label>
                  <strong style={{color:"#166534",fontSize:".9rem"}}>{supportPhone}</strong>
                </div>
              </div>
              <p className="student-profile-help">Profile information is synced with school records. Contact support if any field appears incorrect.</p>
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}

// â”€â”€â”€ STUDENT ATTENDANCE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StudentAttendance({ attendanceData }) {
  const { cfg } = useContext(SettingsContext);
  const rows = Array.isArray(attendanceData) ? attendanceData : [];
  const formatDate = (value) => {
    if (!value) return "-";
    const dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? String(value) : new Intl.DateTimeFormat(cfg.locale || "en-GH", { timeZone: cfg.timezone || "Africa/Accra", dateStyle: "medium" }).format(dt);
  };
  const present = rows.filter(a=>String(a.status).toLowerCase()==="present").length;
  const absent = rows.length - present;
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">My Attendance</div></div>
      <div style={{display:"flex",gap:16,marginBottom:20}}>
        <div className="att-circle" style={{background:"#dcfce7",color:"#16a34a"}}>
          {Math.round(present/Math.max(rows.length,1)*100)}%<div style={{fontSize:".75rem",fontWeight:400}}>Present</div>
        </div>
        <div className="att-circle" style={{background:"#fee2e2",color:"#dc2626"}}>
          {Math.round(absent/Math.max(rows.length,1)*100)}%<div style={{fontSize:".75rem",fontWeight:400}}>Absent</div>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(a=>(
              <tr key={a.id}>
                <td>{formatDate(a.date)}</td>
                <td><span className={`badge ${a.status==="Present"?"badge-success":"badge-danger"}`}>{a.status}</span></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="2" style={{textAlign:"center",padding:20,color:"#64748b"}}>No live attendance records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// â”€â”€â”€ STUDENT FEES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StudentFees({ feesData }) {
  const { cfg } = useContext(SettingsContext);
  const rows = Array.isArray(feesData) ? feesData : [];
  const money = new Intl.NumberFormat(cfg.locale || "en-GH", { style: "currency", currency: cfg.currency || "GHS", maximumFractionDigits: 0 });
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">My Fees</div></div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Term</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(f=>(
              <tr key={f.id}>
                <td><strong>{f.term}</strong></td>
                <td>{money.format(Number(f.amount || 0))}</td>
                <td>{money.format(Number(f.paid || 0))}</td>
                <td style={{color:f.amount-f.paid>0?"#dc2626":"#16a34a",fontWeight:700}}>{money.format(Number((f.amount || 0) - (f.paid || 0)))} </td>
                <td><span className={`badge ${f.status==="paid"?"badge-success":f.status==="partial"?"badge-warning":"badge-danger"}`}>{f.status}</span></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="5" style={{textAlign:"center",padding:20,color:"#64748b"}}>No live fee records found.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="alert alert-info" style={{marginTop:12}}>Need billing help? Contact {cfg.supportEmail || "support"} {cfg.supportPhone ? `or ${cfg.supportPhone}` : ""}.</div>
    </div>
  );
}

// â”€â”€â”€ STUDENT SCHOOL SELECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SchoolSelection({ schoolsData, studentData }) {
  const { cfg } = useContext(SettingsContext);
  const maxChoices = cfg.maxChoices || 7;
  const [selected, setSelected] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loadingSelection, setLoadingSelection] = useState(false);
  const [ruleWarning, setRuleWarning] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const userEmail = getSessionUserEmail();
  const schools = sortSchoolsByCategory(schoolsData?.length ? schoolsData : SCHOOLS_DATA);
  const counts = schools.reduce((acc, school) => {
    const key = String(school.category || "").toUpperCase();
    if (key === "A" || key === "B" || key === "C") acc[key] += 1;
    return acc;
  }, { A: 0, B: 0, C: 0 });
  const validPatterns = [
    { A: 1, B: 2, C: 4 },
    { A: 1, B: 0, C: 6 },
    { A: 0, B: 2, C: 5 },
    { A: 0, B: 0, C: 7 },
  ];

  const getSelectionCounts = (items) => items.reduce((acc, item) => {
    const key = String(item.category || "").toUpperCase();
    if (key === "A" || key === "B" || key === "C") acc[key] += 1;
    return acc;
  }, { A: 0, B: 0, C: 0 });

  const canStillFitAValidPattern = (items) => {
    const picked = getSelectionCounts(items);
    return validPatterns.some((pattern) => (
      picked.A <= pattern.A &&
      picked.B <= pattern.B &&
      picked.C <= pattern.C &&
      items.length <= pattern.A + pattern.B + pattern.C
    ));
  };
  const showRuleWarning = (message) => {
    setRuleWarning(message);
    window.alert(message);
  };

  useEffect(() => {
    const loadRemote = async () => {
      if (!supabase) return;
      setLoadingSelection(true);
      const data = await fetchStudentSelection({ userEmail, studentData });
      if (data) {
        const picks = normalizeSelectionList(data);
        if (picks.length) setSelected(picks);
        setSubmitted(!!data.submitted || String(data.status || "").toLowerCase() !== "draft");
      }
      setLoadingSelection(false);
    };
    loadRemote();
  }, [userEmail, studentData]);

  useEffect(() => {
    if (submitted) {
      setShowReviewModal(false);
      return;
    }
    if (selected.length === maxChoices && !validate()) {
      setShowReviewModal(true);
    } else {
      setShowReviewModal(false);
    }
  }, [selected, submitted]);

  const toggle = (school) => {
    if (!cfg.allowChanges) return;
    if (selected.find(s=>s.id===school.id)) {
      setRuleWarning("");
      setSelected(s=>s.filter(x=>x.id!==school.id));
      return;
    }
    if (selected.length>=maxChoices) {
      showRuleWarning(`You can select a maximum of ${maxChoices} schools.`);
      return;
    }
    const nextSelected = [...selected, school];
    if (!canStillFitAValidPattern(nextSelected)) {
      showRuleWarning("This selection breaks the allowed combinations: 1A + 2B + 4C, 1A + 6C, 2B + 5C, or 7C.");
      return;
    }
    setRuleWarning("");
    setSelected(nextSelected);
  };
  const validate = () => {
    const catA = selected.filter(s=>s.category==="A").length;
    const catB = selected.filter(s=>s.category==="B").length;
    const catC = selected.filter(s=>s.category==="C").length;
    if(selected.length===0) return "Select at least one school.";
    if(selected.length > maxChoices) return `You can select a maximum of ${maxChoices} schools.`;
    const matchesValidPattern = validPatterns.some((pattern) => (
      catA === pattern.A && catB === pattern.B && catC === pattern.C
    ));
    if (selected.length === maxChoices && !matchesValidPattern) {
      return "Allowed combinations are: 1A + 2B + 4C, 1A + 6C, 2B + 5C, or 7C.";
    }
    return null;
  };
  const err = validate();
  const submitSelection = async () => {
    setSubmitted(true);
    if (supabase) {
      const newSchemaPayload = {
        student_id: studentData?.id || null,
        index_number: studentData?.index_number || studentData?.index || null,
        status: "submitted",
        selections: selected.map((s, i) => ({
          rank: i + 1,
          school_id: s.id,
          school_name: s.name,
          region: s.region,
          category: s.category,
        })),
      };
      const { error } = await supabase.from("school_selections").insert(newSchemaPayload);
      if (error) {
        await supabase.from("school_selections").insert({
          user_email: userEmail,
          selected_schools: selected,
          submitted: true,
        });
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Select Schools</div><div className="page-sub">{`Choose ${maxChoices} secondary schools in an approved pattern (${schools.length} schools available: A ${counts.A}, B ${counts.B}, C ${counts.C})${cfg.selectionDeadline ? " — Deadline: "+cfg.selectionDeadline : ""}`}</div></div>
      {loadingSelection && <div className="alert alert-info">Loading your saved selection...</div>}
      {!cfg.allowChanges && !submitted && <div className="alert alert-warning" style={{fontWeight:600}}>School selection is currently locked by the administrator. Changes are not allowed at this time.</div>}
      {submitted ? <div className="alert alert-success">Your school selection has been submitted successfully!</div> : (
        <>
          <div className="alert alert-info">Selection Rules: 1A + 2B + 4C, 1A + 6C, 2B + 5C, or 7C.</div>
          {ruleWarning && <div className="alert alert-warning">{ruleWarning}</div>}
          {err && selected.length>0 && <div className="alert alert-warning">{err}</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12,marginBottom:20,opacity:cfg.allowChanges?1:0.5,pointerEvents:cfg.allowChanges?"auto":"none"}}>
            {schools.map(s=>(
              <button key={s.id} className={`selection-card ${selected.find(x=>x.id===s.id)?"selected":""}`} onClick={()=>toggle(s)}>
                <div className={`cat-badge cat-${s.category}`}>{s.category}</div>
                <div style={{flex:1,textAlign:"left"}}>
                  <div style={{fontWeight:700,fontSize:".9rem"}}>{s.name}</div>
                  <div style={{fontSize:".78rem",color:"#64748b"}}>{s.region} - Cutoff: {s.cutoff}</div>
                </div>
                {selected.find(x=>x.id===s.id) && <Ico name="confirmed" size={16} color="#1a56db"/>}
              </button>
            ))}
          </div>
          <div className="card card-padded" style={{marginBottom:16}}>
            <strong>Selected ({selected.length}/{maxChoices}):</strong>
            {selected.length===0 ? <span style={{color:"#94a3b8",marginLeft:8}}>None yet</span> : (
              <ol style={{marginTop:8,paddingLeft:20}}>
                {selected.map((s,i)=><li key={s.id} style={{marginBottom:4,fontSize:".9rem"}}>{s.name} <span className={`badge cat-${s.category}`} style={{marginLeft:6,padding:"2px 8px",borderRadius:6,fontSize:".7rem"}}>Cat {s.category}</span></li>)}
              </ol>
            )}
          </div>
          <button className="btn btn-blue" disabled={!!err||selected.length!==maxChoices} onClick={()=>setShowReviewModal(true)}>Review Selection</button>
        </>
      )}
      {showReviewModal && !submitted && (
        <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <div className="modal-title">Review Selected Schools</div>
                <div className="modal-sub">Confirm your 7-school selection before final submission.</div>
              </div>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>
                <Ico name="logout" size={16} color="#1e3a8a" style={{transform:"rotate(45deg)"}}/>
              </button>
            </div>
            <div className="card card-padded" style={{marginBottom:0}}>
              <ol style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:10}}>
                {selected.map((s, i) => (
                  <li key={s.id} style={{fontSize:".92rem"}}>
                    <strong>{s.name}</strong>
                    <span className={`badge cat-${s.category}`} style={{marginLeft:8,padding:"2px 8px",borderRadius:6,fontSize:".72rem"}}>Cat {s.category}</span>
                    <div style={{fontSize:".78rem",color:"#64748b",marginTop:4}}>{s.region} - Cutoff: {s.cutoff}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setShowReviewModal(false)}>Edit</button>
              <button className="btn btn-blue" onClick={submitSelection}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ MY SELECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MySelection({ selectionRow, approvalInfo }) {
  const rows = normalizeSelectionList(selectionRow);
  const status = String(selectionRow?.status || "not-submitted").toLowerCase();
  const statusText = status === "confirmed" ? "Your selection has been confirmed." : status === "submitted" || status === "pending" ? "Your selection is under review." : "You have not submitted a selection yet.";
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">My Selection</div></div>
      {approvalInfo?.isApproved && (
        <div className="alert alert-success" style={{fontWeight:700}}>
          Approval update: Your school selection has been approved by the admin{approvalInfo.approvedAtLabel ? ` on ${approvalInfo.approvedAtLabel}` : ""}.
        </div>
      )}
      <div className="alert alert-info">{statusText}</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {rows.map((s,i)=>(
          <div key={s.id} className="card card-padded" style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:36,height:36,borderRadius:10,background:"#eef2ff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#1a56db",flexShrink:0}}>#{i+1}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700}}>{s.name}</div>
              <div style={{fontSize:".8rem",color:"#64748b"}}>{s.region}</div>
            </div>
            <span className={`badge ${s.category==="A"?"badge-warning":"badge-blue"}`}>Cat {s.category}</span>
          </div>
        ))}
        {!rows.length && <div className="card card-padded" style={{textAlign:"center",color:"#64748b"}}>No live selection records found.</div>}
      </div>
    </div>
  );
}

// â”€â”€â”€ STUDENT DOCS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DocumentsPage() {
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Documents</div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16}}>
        {[{name:"BECE Form",type:"Form",icon:"docs"},{name:"School Report",type:"Report",icon:"results"},{name:"Admission Letter",type:"Letter",icon:"enroll"},{name:"Medical Certificate",type:"Health",icon:"fees"}].map(d=>(
          <div key={d.name} className="card card-padded" style={{textAlign:"center"}}>
            <div style={{fontSize:"2.5rem",marginBottom:8,display:"flex",justifyContent:"center"}}><Ico name={d.icon} size={34} color="#1a56db"/></div>
            <div style={{fontWeight:700}}>{d.name}</div>
            <div style={{fontSize:".78rem",color:"#94a3b8",marginBottom:12}}>{d.type}</div>
            <button className="btn btn-outline btn-sm" style={{width:"100%"}}>Download</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// PLACEMENT PREDICTOR
function PlacementPredictor({ schoolsData }) {
  const [agg, setAgg] = useState(""); const [school, setSchool] = useState(""); const [result, setResult] = useState(null);
  const schools = sortSchoolsByCategory(schoolsData?.length ? schoolsData : SCHOOLS_DATA);
  const predict = () => {
    const s = schools.find(x=>String(x.id)===String(school));
    if (!s||!agg) return;
    const likely = parseInt(agg) <= s.cutoff;
    setResult({ likely, school:s.name, cutoff:s.cutoff, agg:parseInt(agg) });
  };
  return (
    <div className="fade-in">
      <div className="page-header"><div className="page-title">Mock Placement Predictor</div><div className="page-sub">Estimate your likely secondary school mock placement</div></div>
      <div className="card card-padded" style={{maxWidth:500,marginBottom:16}}>
        <div className="form-group" style={{marginBottom:14}}>
          <label className="form-label">Select School</label>
          <select className="form-control" value={school} onChange={e=>setSchool(e.target.value)}>
            <option value="">-- Choose a school --</option>
            {schools.map(s=><option key={s.id} value={s.id}>{s.name} (Cutoff: {s.cutoff})</option>)}
          </select>
        </div>
        <div className="form-group" style={{marginBottom:14}}>
          <label className="form-label">Your Aggregate (1=best)</label>
          <input type="number" className="form-control" value={agg} onChange={e=>setAgg(e.target.value)} min={1} max={40} placeholder="e.g. 8"/>
        </div>
        <button className="btn btn-blue" onClick={predict}>Predict Mock Placement</button>
      </div>
      {result && (
        <div className={`alert ${result.likely?"alert-success":"alert-warning"}`}>
          {result.likely ? `Success: Your aggregate of ${result.agg} meets the cutoff (${result.cutoff}) for ${result.school}. You are likely to be placed here.` 
            : `Warning: Your aggregate of ${result.agg} is above the cutoff of ${result.cutoff} for ${result.school}. Consider lower-cutoff schools.`}
        </div>
      )}
    </div>
  );
}

function AssignmentTrackerPage() {
  const [tasks, setTasks] = useState([
    { id: 1, subject: "Mathematics", title: "Algebra Worksheet", due: "2026-04-20", status: "pending" },
    { id: 2, subject: "English", title: "Essay Draft", due: "2026-04-18", status: "submitted" },
  ]);
  const update = (id, status) => setTasks((t) => t.map((x) => x.id === id ? { ...x, status } : x));
  return <div className="fade-in"><div className="page-header"><div className="page-title">Assignments</div><div className="page-sub">Track homework, due dates and submission status.</div></div><div className="card table-wrap"><table><thead><tr><th>Subject</th><th>Task</th><th>Due</th><th>Status</th><th>Action</th></tr></thead><tbody>{tasks.map((t)=><tr key={t.id}><td>{t.subject}</td><td>{t.title}</td><td>{t.due}</td><td><span className={`badge ${t.status==="submitted"?"badge-success":t.status==="late"?"badge-danger":"badge-warning"}`}>{t.status}</span></td><td><button className="btn btn-sm btn-outline" onClick={()=>update(t.id,"submitted")}>Mark Submitted</button></td></tr>)}</tbody></table></div></div>;
}

function ExamSchedulePage() {
  const rows = [
    { id: 1, subject: "Mathematics", date: "2026-05-03", time: "09:00", venue: "Hall A", seat: "A-14" },
    { id: 2, subject: "English", date: "2026-05-05", time: "11:00", venue: "Hall B", seat: "B-22" },
  ];
  return <div className="fade-in"><div className="page-header"><div className="page-title">Exam Timetable & Seat Plan</div><div className="page-sub">See your exam schedule, venue, and seat allocation.</div></div><div className="card table-wrap"><table><thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Venue</th><th>Seat</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.subject}</td><td>{r.date}</td><td>{r.time}</td><td>{r.venue}</td><td><strong>{r.seat}</strong></td></tr>)}</tbody></table></div></div>;
}

function ReportCardPage({ studentData, attendanceData, feesData }) {
  const student = studentData || { full_name: "Student", index: "-", class: "-" };
  const attendanceRate = Math.round((attendanceData || []).filter((x) => String(x.status).toLowerCase()==="present").length / Math.max((attendanceData || []).length, 1) * 100);
  const totalOutstanding = (feesData || []).reduce((s, f) => s + Math.max(Number(f.amount || 0) - Number(f.paid || 0), 0), 0);
  const generate = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const left = 52;
    let y = 62;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Campus Ghana - Student Report Card", left, y);

    y += 30;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    const lines = [
      `Name: ${student.full_name}`,
      `Student ID: ${student.index}`,
      `Class: ${student.class}`,
      `Attendance Rate: ${attendanceRate}%`,
      `Outstanding Fees: GHS ${totalOutstanding}`,
      `Generated: ${new Date().toLocaleString()}`,
    ];
    lines.forEach((line) => {
      doc.text(line, left, y);
      y += 22;
    });

    doc.save(`report-card-${student.index || "student"}.pdf`);
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Term Report Card</div><div className="page-sub">Generate and download your report summary.</div></div><div className="card card-padded"><div style={{display:"grid",gap:8}}><div><strong>Name:</strong> {student.full_name}</div><div><strong>Student ID:</strong> {student.index}</div><div><strong>Class:</strong> {student.class}</div><div><strong>Attendance Rate:</strong> {attendanceRate}%</div><div><strong>Outstanding Fees:</strong> GHS {totalOutstanding}</div></div><button className="btn btn-blue" style={{marginTop:12}} onClick={generate}>Download Report</button></div></div>;
}

function StudentResultsPage({ scoreValues }) {
  const rows = (scoreValues || []).map((score, i) => {
    const gradeInfo = getGrade(Number(score || 0));
    return {
      id: i + 1,
      subject: SUBJECTS[i] || `Subject ${i + 1}`,
      score: Number(score || 0),
      grade: gradeInfo.grade,
      color: gradeInfo.color,
      bg: gradeInfo.bg,
    };
  });
  const averageScore = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0;
  const bestSubject = rows.length ? [...rows].sort((a, b) => b.score - a.score)[0] : null;
  const weakSubject = rows.length ? [...rows].sort((a, b) => a.score - b.score)[0] : null;
  const gradeCounts = rows.reduce((acc, row) => {
    const key = String(row.grade || "F").toUpperCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, { A: 0, B: 0, C: 0, D: 0, F: 0 });
  const total = Math.max(rows.length, 1);
  const summarySegments = [
    { grade: "A", color: "#16a34a" },
    { grade: "B", color: "#1d4ed8" },
    { grade: "C", color: "#d97706" },
    { grade: "D", color: "#dc2626" },
    { grade: "F", color: "#7f1d1d" },
  ];
  let studentProgress = 0;
  const studentDonut = summarySegments.map((segment) => {
    const start = Math.round(studentProgress * 360);
    studentProgress += (gradeCounts[segment.grade] || 0) / total;
    const end = Math.round(studentProgress * 360);
    return `${segment.color} ${start}deg ${end}deg`;
  }).join(", ");

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Results</div>
        <div className="page-sub">Your subject scores and grades for the current term.</div>
      </div>
      <div className="stats-grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))"}}>
        <div className="stat-card" style={{background:"#eef2ff"}}><div className="stat-label" style={{color:"#1e3a8a"}}>Average Score</div><div className="stat-value" style={{color:"#1e3a8a"}}>{rows.length ? `${averageScore}%` : "N/A"}</div><div className="stat-sub" style={{color:"#1e3a8a"}}>Across all recorded subjects</div></div>
        <div className="stat-card" style={{background:"#dcfce7"}}><div className="stat-label" style={{color:"#166534"}}>Best Subject</div><div className="stat-value" style={{color:"#166534",fontSize:"1.1rem"}}>{bestSubject?.subject || "N/A"}</div><div className="stat-sub" style={{color:"#166534"}}>{bestSubject ? `${bestSubject.score}%` : "No subject score yet"}</div></div>
        <div className="stat-card" style={{background:"#fee2e2"}}><div className="stat-label" style={{color:"#991b1b"}}>Focus Subject</div><div className="stat-value" style={{color:"#991b1b",fontSize:"1.1rem"}}>{weakSubject?.subject || "N/A"}</div><div className="stat-sub" style={{color:"#991b1b"}}>{weakSubject ? `${weakSubject.score}% - prioritize revision` : "No subject score yet"}</div></div>
      </div>
      <div className="results-visual-grid" style={{gridTemplateColumns:"1.2fr 1fr 1fr"}}>
        <div className="results-panel">
          <h3>Subject Performance Bars</h3>
          <div className="results-bars">
            {rows.map((row) => (
              <div className="results-bar-row" key={`student-score-${row.id}`}>
                <span>{row.subject}</span>
                <div className="results-bar-track"><div className="results-bar-fill" style={{width:`${Math.max(0, Math.min(100, row.score))}%`,background:row.score >= 75 ? "#16a34a" : row.score >= 60 ? "#d97706" : "#dc2626"}}/></div>
                <strong>{row.score}%</strong>
              </div>
            ))}
            {!rows.length && <div style={{color:"#64748b",fontSize:".82rem"}}>No subjects with recorded scores yet.</div>}
          </div>
        </div>
        <div className="results-panel">
          <h3>Grade Mix</h3>
          <div className="results-donut" style={{background:`conic-gradient(${studentDonut || "#e2e8f0 0deg 360deg"})`}}>
            <div className="results-donut-center">
              <strong>{rows.length}</strong>
              <span>Subjects</span>
            </div>
          </div>
          <div className="results-legend">
            {summarySegments.map((segment) => (
              <div key={segment.grade} className="results-legend-item">
                <span style={{display:"inline-flex",alignItems:"center"}}><span className="results-dot" style={{background:segment.color}}/>Grade {segment.grade}</span>
                <b>{gradeCounts[segment.grade] || 0}</b>
              </div>
            ))}
          </div>
        </div>
        <div className="results-panel">
          <h3>Readiness Gauge</h3>
          <div style={{padding:"10px 6px"}}>
            <div className="progress" style={{height:14,background:"#e2e8f0"}}>
              <div className="progress-bar" style={{width:`${Math.max(0, Math.min(100, averageScore))}%`,background:averageScore >= 75 ? "#16a34a" : averageScore >= 60 ? "#d97706" : "#dc2626"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10,fontSize:".75rem",color:"#64748b"}}><span>0%</span><span>50%</span><span>100%</span></div>
            <div style={{marginTop:12,fontWeight:700,color:"#0f172a",fontSize:".95rem"}}>Exam Readiness: {rows.length ? `${averageScore}%` : "N/A"}</div>
            <div style={{marginTop:6,color:"#64748b",fontSize:".8rem"}}>{averageScore >= 75 ? "Strong performance profile" : averageScore >= 60 ? "Stable progress with room to improve" : "Focused intervention recommended"}</div>
          </div>
        </div>
      </div>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Subject</th><th>Score</th><th>Grade</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.subject}</td>
                <td>{r.score}</td>
                <td><span className="grade-chip" style={{background:r.bg,color:r.color}}>{r.grade}</span></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan="3" style={{textAlign:"center",padding:22,color:"#64748b"}}>No live result rows available yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentAnalyticsPage({ scoreValues, attendanceData, feesData }) {
  const values = Array.isArray(scoreValues) ? scoreValues.map((v) => Number(v || 0)).filter((v) => Number.isFinite(v)) : [];
  const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const attendanceRows = attendanceData || [];
  const present = attendanceRows.filter((a) => String(a.status).toLowerCase() === "present").length;
  const attendanceRate = Math.round((present / Math.max(attendanceRows.length, 1)) * 100);
  const feeRows = feesData || [];
  const outstanding = feeRows.reduce((sum, f) => sum + Math.max(Number(f.amount || 0) - Number(f.paid || 0), 0), 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div className="page-title">Analytics</div>
        <div className="page-sub">Performance insights from your live academic and finance records.</div>
      </div>
      <div className="stats-grid">
        {[
          { label: "Average Score", value: values.length ? `${avg}%` : "N/A", sub: values.length ? "From live scores" : "No score data", bg: "#dbeafe", c: "#1e40af" },
          { label: "Attendance", value: `${attendanceRate}%`, sub: `${present}/${attendanceRows.length} present`, bg: "#dcfce7", c: "#16a34a" },
          { label: "Outstanding Fees", value: `GHS ${outstanding}`, sub: outstanding > 0 ? "Pending payment" : "Cleared", bg: outstanding > 0 ? "#fee2e2" : "#dcfce7", c: outstanding > 0 ? "#dc2626" : "#16a34a" },
        ].map((s) => (
          <div key={s.label} className="stat-card" style={{background:s.bg}}>
            <div className="stat-label" style={{color:s.c}}>{s.label}</div>
            <div className="stat-value" style={{color:s.c,fontSize:"1.5rem"}}>{s.value}</div>
            <div className="stat-sub" style={{color:s.c}}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="card card-padded">
        <h3 style={{fontWeight:700,marginBottom:10}}>Subject Strength Snapshot</h3>
        {values.length ? values.map((v, i) => (
          <div key={`${i}-${v}`} style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <span style={{minWidth:170,fontSize:".85rem",fontWeight:600}}>{SUBJECTS[i] || `Subject ${i + 1}`}</span>
            <div className="progress" style={{flex:1}}><div className="progress-bar" style={{width:`${Math.max(0, Math.min(100, v))}%`,background:v>=70?"#16a34a":v>=55?"#d97706":"#dc2626"}}/></div>
            <span style={{width:42,textAlign:"right",fontWeight:700}}>{v}%</span>
          </div>
        )) : <div style={{color:"#64748b"}}>No score data to analyze yet.</div>}
      </div>
    </div>
  );
}

function SubjectProgressPage() {
  const rows = SUBJECTS.slice(0, 8).map((s) => ({ subject: s, avg: Math.floor(Math.random() * 35) + 55 }));
  return <div className="fade-in"><div className="page-header"><div className="page-title">Subject Progress</div><div className="page-sub">View performance trend by subject.</div></div><div className="card card-padded">{rows.map((r) => <div key={r.subject} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><div style={{minWidth:160,fontWeight:600,fontSize:".85rem"}}>{r.subject}</div><div className="progress" style={{flex:1}}><div className="progress-bar" style={{width:`${r.avg}%`,background:r.avg>=70?"#16a34a":r.avg>=55?"#d97706":"#dc2626"}}/></div><div style={{width:42,textAlign:"right",fontWeight:700}}>{r.avg}%</div></div>)}</div></div>;
}

function StudyPlannerPage() {
  const [plan, setPlan] = useState([{ id: 1, day: "Monday", focus: "Mathematics - Algebra", duration: "1h" }]);
  const [form, setForm] = useState({ day: "Monday", focus: "", duration: "1h" });
  const add = () => { if (!form.focus) return; setPlan((p) => [...p, { id: Date.now(), ...form }]); setForm({ day: "Monday", focus: "", duration: "1h" }); };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Study Planner</div><div className="page-sub">Build a weekly revision plan.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-grid"><div className="form-group"><label className="form-label">Day</label><select className="form-control" value={form.day} onChange={(e)=>setForm((f)=>({...f,day:e.target.value}))}>{["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d)=><option key={d}>{d}</option>)}</select></div><div className="form-group"><label className="form-label">Focus Area</label><input className="form-control" value={form.focus} onChange={(e)=>setForm((f)=>({...f,focus:e.target.value}))}/></div><div className="form-group"><label className="form-label">Duration</label><input className="form-control" value={form.duration} onChange={(e)=>setForm((f)=>({...f,duration:e.target.value}))}/></div></div><button className="btn btn-blue" style={{marginTop:10}} onClick={add}>Add Session</button></div><div className="card table-wrap"><table><thead><tr><th>Day</th><th>Focus</th><th>Duration</th></tr></thead><tbody>{plan.map((p)=><tr key={p.id}><td>{p.day}</td><td>{p.focus}</td><td>{p.duration}</td></tr>)}</tbody></table></div></div>;
}

function AttendanceCorrectionPage({ attendanceData }) {
  const [requests, setRequests] = useState([]);
  const [note, setNote] = useState("");
  const rows = (attendanceData || []).filter((x) => String(x.status).toLowerCase() !== "present");
  const submit = (row) => {
    if (!note.trim()) return;
    setRequests((r) => [{ id: Date.now(), date: row.date, status: row.status, note, state: "pending" }, ...r]);
    setNote("");
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Attendance Correction Requests</div><div className="page-sub">Request review for absent/late records.</div></div><div className="card card-padded" style={{marginBottom:12}}><label className="form-label">Evidence/Reason</label><textarea className="form-control" rows={3} value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Explain why this record should be corrected"/></div><div className="card table-wrap" style={{marginBottom:12}}><table><thead><tr><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.date}</td><td>{r.status}</td><td><button className="btn btn-sm btn-outline" onClick={()=>submit(r)}>Request Correction</button></td></tr>)}{!rows.length && <tr><td colSpan="3" style={{textAlign:"center",padding:18,color:"#64748b"}}>No absent/late records to dispute.</td></tr>}</tbody></table></div><div className="card table-wrap"><table><thead><tr><th>Date</th><th>Original Status</th><th>Reason</th><th>Request Status</th></tr></thead><tbody>{requests.map((r)=><tr key={r.id}><td>{r.date}</td><td>{r.status}</td><td>{r.note}</td><td><span className="badge badge-warning">{r.state}</span></td></tr>)}{!requests.length && <tr><td colSpan="4" style={{textAlign:"center",padding:18,color:"#64748b"}}>No correction requests submitted yet.</td></tr>}</tbody></table></div></div>;
}

function StudentPaymentsPage({ feesData }) {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ term: (feesData?.[0]?.term || "First Term"), amount: "", method: "mobile-money" });
  const pay = () => {
    if (!form.amount) return;
    setPayments((p) => [{ id: Date.now(), ...form, receipt: `PAY-${String(Date.now()).slice(-6)}`, at: new Date().toISOString() }, ...p]);
    setForm((f) => ({ ...f, amount: "" }));
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Pay Fees</div><div className="page-sub">Initiate direct payments and get receipt references.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-grid"><div className="form-group"><label className="form-label">Term</label><select className="form-control" value={form.term} onChange={(e)=>setForm((f)=>({...f,term:e.target.value}))}>{(feesData||[]).map((x)=><option key={x.id}>{x.term}</option>)}</select></div><div className="form-group"><label className="form-label">Amount (GHS)</label><input type="number" className="form-control" value={form.amount} onChange={(e)=>setForm((f)=>({...f,amount:e.target.value}))} /></div><div className="form-group"><label className="form-label">Method</label><select className="form-control" value={form.method} onChange={(e)=>setForm((f)=>({...f,method:e.target.value}))}><option value="mobile-money">Mobile Money</option><option value="card">Card</option><option value="bank">Bank Transfer</option></select></div></div><button className="btn btn-blue" style={{marginTop:10}} onClick={pay}>Pay Now</button></div><div className="card table-wrap"><table><thead><tr><th>When</th><th>Term</th><th>Amount</th><th>Method</th><th>Receipt</th></tr></thead><tbody>{payments.map((p)=><tr key={p.id}><td>{new Date(p.at).toLocaleString()}</td><td>{p.term}</td><td>GHS {p.amount}</td><td>{p.method}</td><td><strong>{p.receipt}</strong></td></tr>)}{!payments.length && <tr><td colSpan="5" style={{textAlign:"center",padding:18,color:"#64748b"}}>No payment attempts yet.</td></tr>}</tbody></table></div></div>;
}

function StudentPaymentPlansPage({ feesData }) {
  const outstanding = (feesData || []).reduce((s, f) => s + Math.max(Number(f.amount || 0) - Number(f.paid || 0), 0), 0);
  const [plan, setPlan] = useState(null);
  const [months, setMonths] = useState(3);
  const requestPlan = () => {
    if (!outstanding) return;
    setPlan({ total: outstanding, months, installment: Math.ceil(outstanding / months), status: "requested" });
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Payment Plan Request</div><div className="page-sub">Apply for fee installment support.</div></div><div className="card card-padded"><div style={{marginBottom:10}}>Outstanding Balance: <strong>GHS {outstanding}</strong></div><div className="form-group" style={{maxWidth:220}}><label className="form-label">Installment Months</label><input type="number" className="form-control" min={2} max={12} value={months} onChange={(e)=>setMonths(Math.max(2, Math.min(12, Number(e.target.value || 2))))}/></div><button className="btn btn-blue" style={{marginTop:10}} onClick={requestPlan}>Request Plan</button>{plan && <div className="alert alert-info" style={{marginTop:12}}>Plan requested: {plan.months} months at GHS {plan.installment}/month ({plan.status}).</div>}</div></div>;
}

function PersonalizedAnnouncementsPage() {
  const [readIds, setReadIds] = useState([]);
  const items = ANNOUNCEMENTS.map((a) => ({ ...a, audience: a.type === "urgent" ? "All Students" : a.type === "info" ? "JHS 3" : "My Class" }));
  const markRead = (id) => setReadIds((r) => r.includes(id) ? r : [...r, id]);
  return <div className="fade-in"><div className="page-header"><div className="page-title">Personalized Announcements</div><div className="page-sub">Unread/read announcements targeted to your cohort.</div></div><div style={{display:"grid",gap:10}}>{items.map((a)=><div key={a.id} className="card card-padded" style={{borderLeft:`4px solid ${readIds.includes(a.id)?"#cbd5e1":"#1d4ed8"}`}}><div style={{display:"flex",justifyContent:"space-between",gap:10}}><div style={{fontWeight:700}}>{a.title}</div><span className={`badge ${readIds.includes(a.id)?"badge-gray":"badge-blue"}`}>{readIds.includes(a.id)?"read":"unread"}</span></div><div style={{fontSize:".84rem",color:"#64748b",marginTop:4}}>Audience: {a.audience}</div><div style={{marginTop:8}}>{a.body}</div><button className="btn btn-sm btn-outline" style={{marginTop:8}} onClick={()=>markRead(a.id)}>Mark Read</button></div>)}</div></div>;
}

function StudentUploadDocsPage() {
  const [uploads, setUploads] = useState([]);
  const [docType, setDocType] = useState("ID Document");
  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploads((u) => [{ id: Date.now(), docType, fileName: file.name, size: file.size, status: "submitted", at: new Date().toISOString() }, ...u]);
    e.target.value = "";
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Upload Documents</div><div className="page-sub">Submit required files and track verification status.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-group" style={{maxWidth:260}}><label className="form-label">Document Type</label><select className="form-control" value={docType} onChange={(e)=>setDocType(e.target.value)}><option>ID Document</option><option>Birth Certificate</option><option>Result Slip</option><option>Payment Proof</option></select></div><input type="file" onChange={onPick} /></div><div className="card table-wrap"><table><thead><tr><th>When</th><th>Type</th><th>File</th><th>Status</th></tr></thead><tbody>{uploads.map((u)=><tr key={u.id}><td>{new Date(u.at).toLocaleString()}</td><td>{u.docType}</td><td>{u.fileName}</td><td><span className="badge badge-warning">{u.status}</span></td></tr>)}{!uploads.length && <tr><td colSpan="4" style={{textAlign:"center",padding:18,color:"#64748b"}}>No documents uploaded yet.</td></tr>}</tbody></table></div></div>;
}

function CalendarSyncPage() {
  const events = EVENTS_DATA.map((e) => ({ title: e.title, date: e.date }));
  const downloadIcs = () => {
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Campus Ghana//Student Calendar//EN"];
    events.forEach((ev) => {
      const dt = String(ev.date || "").replaceAll("-", "") || "20260501";
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${dt}-${ev.title.replace(/\s+/g, "-")}@campusghana`);
      lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);
      lines.push(`DTSTART;VALUE=DATE:${dt}`);
      lines.push(`SUMMARY:${ev.title}`);
      lines.push("END:VEVENT");
    });
    lines.push("END:VCALENDAR");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student-calendar.ics";
    a.click();
    URL.revokeObjectURL(url);
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Calendar Sync</div><div className="page-sub">Download ICS and sync deadlines to your phone calendar.</div></div><div className="card card-padded"><button className="btn btn-blue" onClick={downloadIcs}>Download Calendar (.ics)</button><div style={{marginTop:12,fontSize:".84rem",color:"#64748b"}}>Import the .ics file into Google Calendar, Apple Calendar, or Outlook.</div></div></div>;
}

function StudentTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "" });
  const submit = () => {
    if (!form.subject || !form.message) return;
    setTickets((t) => [{ id: Date.now(), ...form, status: "open", at: new Date().toISOString() }, ...t]);
    setForm({ subject: "", message: "" });
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Support Tickets</div><div className="page-sub">Create and track your support requests.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-grid"><div className="form-group"><label className="form-label">Subject</label><input className="form-control" value={form.subject} onChange={(e)=>setForm((f)=>({...f,subject:e.target.value}))}/></div><div className="form-group"><label className="form-label">Message</label><input className="form-control" value={form.message} onChange={(e)=>setForm((f)=>({...f,message:e.target.value}))}/></div></div><button className="btn btn-blue" style={{marginTop:10}} onClick={submit}>Submit Ticket</button></div><div className="card table-wrap"><table><thead><tr><th>When</th><th>Subject</th><th>Status</th></tr></thead><tbody>{tickets.map((t)=><tr key={t.id}><td>{new Date(t.at).toLocaleString()}</td><td>{t.subject}</td><td><span className="badge badge-warning">{t.status}</span></td></tr>)}{!tickets.length && <tr><td colSpan="3" style={{textAlign:"center",padding:18,color:"#64748b"}}>No support tickets submitted.</td></tr>}</tbody></table></div></div>;
}

function StudentGoalsPage() {
  const [goal, setGoal] = useState({ aggregateTarget: 8, attendanceTarget: 95 });
  const progress = { aggregateNow: 12, attendanceNow: 88 };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Goals & Targets</div><div className="page-sub">Set academic and attendance targets.</div></div><div className="card card-padded"><div className="form-grid"><div className="form-group"><label className="form-label">Target Aggregate</label><input type="number" className="form-control" value={goal.aggregateTarget} onChange={(e)=>setGoal((g)=>({...g,aggregateTarget:Number(e.target.value||0)}))}/></div><div className="form-group"><label className="form-label">Target Attendance (%)</label><input type="number" className="form-control" value={goal.attendanceTarget} onChange={(e)=>setGoal((g)=>({...g,attendanceTarget:Number(e.target.value||0)}))}/></div></div><div style={{marginTop:12}}><div className="alert alert-info">Current Aggregate: {progress.aggregateNow} (Target {goal.aggregateTarget})</div><div className="alert alert-info">Current Attendance: {progress.attendanceNow}% (Target {goal.attendanceTarget}%)</div></div></div></div>;
}

function ScholarshipBoardPage() {
  const rows = [
    { id: 1, title: "STEM Excellence Scholarship", deadline: "2026-06-01", eligibility: "Aggregate <= 10" },
    { id: 2, title: "Girls in Science Fund", deadline: "2026-05-25", eligibility: "Female students in STEM" },
  ];
  return <div className="fade-in"><div className="page-header"><div className="page-title">Scholarship Board</div><div className="page-sub">Discover opportunities and eligibility criteria.</div></div><div className="card table-wrap"><table><thead><tr><th>Opportunity</th><th>Deadline</th><th>Eligibility</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.title}</td><td>{r.deadline}</td><td>{r.eligibility}</td></tr>)}</tbody></table></div></div>;
}

function LearningResourcesPage() {
  const rows = [
    { id: 1, subject: "Mathematics", title: "Past Questions Pack", type: "PDF" },
    { id: 2, subject: "Integrated Science", title: "Revision Video Playlist", type: "Video" },
    { id: 3, subject: "English", title: "Essay Writing Guide", type: "Guide" },
  ];
  return <div className="fade-in"><div className="page-header"><div className="page-title">Learning Resources</div><div className="page-sub">Access notes, past questions, and study materials.</div></div><div className="card table-wrap"><table><thead><tr><th>Subject</th><th>Resource</th><th>Type</th><th></th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.subject}</td><td>{r.title}</td><td>{r.type}</td><td><button className="btn btn-sm btn-outline">Open</button></td></tr>)}</tbody></table></div></div>;
}

function AutomationRulesPage() {
  const [rules, setRules] = useState([{ id: 1, trigger: "Fees overdue 30 days", action: "Send reminder + flag" }]);
  const [form, setForm] = useState({ trigger: "", action: "" });
  const add = () => {
    if (!form.trigger || !form.action) return;
    setRules((r) => [{ id: Date.now(), ...form }, ...r]);
    setForm({ trigger: "", action: "" });
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Automation Rules</div><div className="page-sub">1. If-this-then-that workflow automation.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-grid"><div className="form-group"><label className="form-label">Trigger</label><input className="form-control" value={form.trigger} onChange={(e)=>setForm((f)=>({...f,trigger:e.target.value}))} /></div><div className="form-group"><label className="form-label">Action</label><input className="form-control" value={form.action} onChange={(e)=>setForm((f)=>({...f,action:e.target.value}))} /></div></div><button className="btn btn-blue" style={{marginTop:10}} onClick={add}>Add Rule</button></div><div className="card table-wrap"><table><thead><tr><th>Trigger</th><th>Action</th></tr></thead><tbody>{rules.map((r)=><tr key={r.id}><td>{r.trigger}</td><td>{r.action}</td></tr>)}</tbody></table></div></div>;
}

function AiAssistantPage() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("Ask an admin query to get a quick operational answer.");
  const ask = () => {
    if (!q.trim()) return;
    const query = q.toLowerCase();
    if (query.includes("pending")) setA("Pending selections can be found in Admissions > Pending Selections.");
    else if (query.includes("fees")) setA("Fee status can be reviewed in Student Services > Fees and Payments module.");
    else if (query.includes("attendance")) setA("Attendance sync and reports are under Student Services > Attendance.");
    else setA("No exact match found. Try including keywords like pending, fees, attendance, analytics, or reports.");
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">AI Assistant</div><div className="page-sub">2. Natural-language assistant for admin operations.</div></div><div className="card card-padded"><div className="form-group"><label className="form-label">Ask</label><input className="form-control" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="e.g. Show pending selections from Ashanti" /></div><button className="btn btn-blue" style={{marginTop:10}} onClick={ask}>Run Query</button><div className="alert alert-info" style={{marginTop:12}}>{a}</div></div></div>;
}

function StudentRiskPage() {
  const rows = STUDENTS_DATA.map((s) => ({
    ...s,
    risk: Math.min(100, Math.max(5, Math.round((Number(s.aggregate || 0) * 4) + (s.status === "pending" ? 20 : 5)))),
  }));
  return <div className="fade-in"><div className="page-header"><div className="page-title">Student Risk Scoring</div><div className="page-sub">3. Early warning scoring based on academics and status.</div></div><div className="card table-wrap"><table><thead><tr><th>Student</th><th>Student ID</th><th>Aggregate</th><th>Status</th><th>Risk Score</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.full_name}</td><td>{r.index}</td><td>{r.aggregate}</td><td>{r.status}</td><td><span className={`badge ${r.risk>=60?"badge-danger":r.risk>=35?"badge-warning":"badge-success"}`}>{r.risk}%</span></td></tr>)}</tbody></table></div></div>;
}

function TimetablePage() {
  const [rows, setRows] = useState([{ id: 1, day: "Monday", period: "08:00", className: "JHS 3A", subject: "Math", teacher: "Mr. Kwesi" }]);
  return <div className="fade-in"><div className="page-header"><div className="page-title">Timetable & Scheduling</div><div className="page-sub">4. Class schedule planning and conflict visibility.</div></div><div className="card table-wrap"><table><thead><tr><th>Day</th><th>Time</th><th>Class</th><th>Subject</th><th>Teacher</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.day}</td><td>{r.period}</td><td>{r.className}</td><td>{r.subject}</td><td>{r.teacher}</td></tr>)}</tbody></table></div></div>;
}

function ExamBuilderPage() {
  const [exam, setExam] = useState({ title: "", className: "JHS 3A", total: 100 });
  const [items, setItems] = useState([]);
  const create = () => {
    if (!exam.title) return;
    setItems((x) => [{ id: Date.now(), ...exam }, ...x]);
    setExam({ title: "", className: "JHS 3A", total: 100 });
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Exam Builder</div><div className="page-sub">5. Assessment creation and marking workflows.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-grid"><div className="form-group"><label className="form-label">Exam Title</label><input className="form-control" value={exam.title} onChange={(e)=>setExam((v)=>({...v,title:e.target.value}))} /></div><div className="form-group"><label className="form-label">Class</label><input className="form-control" value={exam.className} onChange={(e)=>setExam((v)=>({...v,className:e.target.value}))} /></div><div className="form-group"><label className="form-label">Total Score</label><input type="number" className="form-control" value={exam.total} onChange={(e)=>setExam((v)=>({...v,total:+e.target.value}))} /></div></div><button className="btn btn-blue" style={{marginTop:10}} onClick={create}>Create Exam</button></div><div className="card table-wrap"><table><thead><tr><th>Title</th><th>Class</th><th>Total</th></tr></thead><tbody>{items.map((i)=><tr key={i.id}><td>{i.title}</td><td>{i.className}</td><td>{i.total}</td></tr>)}</tbody></table></div></div>;
}

function InstallmentPlansPage() {
  const [plans, setPlans] = useState([{ id: 1, student: "Kwame Asante", amount: 350, installments: 3, nextDue: "2026-05-05" }]);
  return <div className="fade-in"><div className="page-header"><div className="page-title">Fee Installment Plans</div><div className="page-sub">6. Structured fee payment planning.</div></div><div className="card table-wrap"><table><thead><tr><th>Student</th><th>Total (GHS)</th><th>Installments</th><th>Next Due</th></tr></thead><tbody>{plans.map((p)=><tr key={p.id}><td>{p.student}</td><td>{p.amount}</td><td>{p.installments}</td><td>{p.nextDue}</td></tr>)}</tbody></table></div></div>;
}

function MessagingCampaignsPage() {
  const [audience, setAudience] = useState("all-students");
  const [text, setText] = useState("");
  const [history, setHistory] = useState([]);
  const send = () => {
    if (!text.trim()) return;
    setHistory((h) => [{ id: Date.now(), audience, text, at: new Date().toISOString() }, ...h]);
    setText("");
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">Messaging Campaigns</div><div className="page-sub">7. Segmented broadcast communication.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-grid"><div className="form-group"><label className="form-label">Audience</label><select className="form-control" value={audience} onChange={(e)=>setAudience(e.target.value)}><option value="all-students">All Students</option><option value="pending-selection">Pending Selection</option><option value="fees-overdue">Fees Overdue</option><option value="high-risk">High Risk Students</option></select></div><div className="form-group"><label className="form-label">Message</label><input className="form-control" value={text} onChange={(e)=>setText(e.target.value)} /></div></div><button className="btn btn-blue" style={{marginTop:10}} onClick={send}>Launch Campaign</button></div><div className="card table-wrap"><table><thead><tr><th>When</th><th>Audience</th><th>Message</th></tr></thead><tbody>{history.map((h)=><tr key={h.id}><td>{new Date(h.at).toLocaleString()}</td><td>{h.audience}</td><td>{h.text}</td></tr>)}</tbody></table></div></div>;
}

function RecommendationEnginePage() {
  const [agg, setAgg] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [list, setList] = useState([]);
  const run = () => {
    const score = Number(agg || 99);
    const filtered = SCHOOLS_DATA.filter((s) => region === "All Regions" || s.region === region).sort((a, b) => a.cutoff - b.cutoff);
    setList(filtered.filter((s) => score <= s.cutoff + 4).slice(0, 6));
  };
  return <div className="fade-in"><div className="page-header"><div className="page-title">School Recommendation Engine</div><div className="page-sub">8. Suggest schools from aggregate and region preference.</div></div><div className="card card-padded" style={{marginBottom:12}}><div className="form-grid"><div className="form-group"><label className="form-label">Aggregate</label><input type="number" className="form-control" value={agg} onChange={(e)=>setAgg(e.target.value)} /></div><div className="form-group"><label className="form-label">Preferred Region</label><select className="form-control" value={region} onChange={(e)=>setRegion(e.target.value)}><option>All Regions</option>{GHANA_REGIONS.map((r)=><option key={r}>{r}</option>)}</select></div></div><button className="btn btn-blue" style={{marginTop:10}} onClick={run}>Recommend</button></div><div className="card table-wrap"><table><thead><tr><th>School</th><th>Region</th><th>Category</th><th>Cutoff</th></tr></thead><tbody>{list.map((s)=><tr key={s.id}><td>{s.name}</td><td>{s.region}</td><td>{s.category}</td><td>{s.cutoff}</td></tr>)}</tbody></table></div></div>;
}

function DigitalIdPage() {
  const [query, setQuery] = useState("");
  const students = STUDENTS_DATA.filter((s) => s.full_name.toLowerCase().includes(query.toLowerCase()) || String(s.index).includes(query));
  return <div className="fade-in"><div className="page-header"><div className="page-title">Digital ID & QR Profiles</div><div className="page-sub">9. Quick profile retrieval for check-in and verification.</div></div><input className="form-control" style={{maxWidth:320,marginBottom:12}} placeholder="Search by name or index" value={query} onChange={(e)=>setQuery(e.target.value)} /><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:12}}>{students.map((s)=><div key={s.id} className="card card-padded"><div style={{fontWeight:800,marginBottom:4}}>{s.full_name}</div><div style={{fontSize:".82rem",color:"#64748b",marginBottom:8}}>Index: {s.index}</div><div style={{height:92,borderRadius:10,background:"repeating-linear-gradient(45deg,#1e3a8a,#1e3a8a 4px,#dbeafe 4px,#dbeafe 8px)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700}}>QR-{s.index}</div></div>)}</div></div>;
}

function PublicStatusPage() {
  const [items, setItems] = useState([
    { id: 1, title: "Admission Update", status: "published", at: new Date().toISOString() },
    { id: 2, title: "Term Reopening Notice", status: "draft", at: new Date(Date.now() - 86400000).toISOString() },
  ]);
  const toggle = (id) => setItems((x) => x.map((i) => i.id === id ? { ...i, status: i.status === "published" ? "draft" : "published" } : i));
  return <div className="fade-in"><div className="page-header"><div className="page-title">Public Status Portal</div><div className="page-sub">10. Publish read-only public notices and status updates.</div></div><div className="card table-wrap"><table><thead><tr><th>Post</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead><tbody>{items.map((i)=><tr key={i.id}><td>{i.title}</td><td><span className={`badge ${i.status === "published" ? "badge-success" : "badge-gray"}`}>{i.status}</span></td><td>{new Date(i.at).toLocaleString()}</td><td><button className="btn btn-sm btn-outline" onClick={()=>toggle(i.id)}>{i.status === "published" ? "Unpublish" : "Publish"}</button></td></tr>)}</tbody></table></div></div>;
}

function IntegrationsPage() {
  const [hooks, setHooks] = useState([{ id: 1, name: "Payment Webhook", url: "https://example.com/payment", enabled: true }]);
  const toggle = (id) => setHooks((h) => h.map((x) => x.id === id ? { ...x, enabled: !x.enabled } : x));
  return <div className="fade-in"><div className="page-header"><div className="page-title">API & Webhook Integrations</div><div className="page-sub">11. Connect external services and webhooks.</div></div><div className="card table-wrap"><table><thead><tr><th>Name</th><th>Endpoint</th><th>Enabled</th></tr></thead><tbody>{hooks.map((h)=><tr key={h.id}><td>{h.name}</td><td>{h.url}</td><td><input type="checkbox" checked={h.enabled} onChange={()=>toggle(h.id)} /></td></tr>)}</tbody></table></div></div>;
}

function MultiTenantPage() {
  const [schools, setSchools] = useState([{ id: 1, name: "Campus Ghana - Main", tenant: "main", activeUsers: 92 }]);
  return <div className="fade-in"><div className="page-header"><div className="page-title">Multi-School Tenants</div><div className="page-sub">12. Manage separate school tenants at scale.</div></div><div className="card table-wrap"><table><thead><tr><th>School</th><th>Tenant Key</th><th>Active Users</th></tr></thead><tbody>{schools.map((s)=><tr key={s.id}><td>{s.name}</td><td>{s.tenant}</td><td>{s.activeUsers}</td></tr>)}</tbody></table></div></div>;
}

function DataQualityPage() {
  const missingIndex = STUDENTS_DATA.filter((s) => !String(s.index || "").trim()).length;
  const duplicateIndexes = new Set(STUDENTS_DATA.map((s) => s.index)).size !== STUDENTS_DATA.length;
  const issues = [
    { name: "Missing Index Numbers", value: missingIndex, status: missingIndex ? "warning" : "ok" },
    { name: "Duplicate Index Numbers", value: duplicateIndexes ? 1 : 0, status: duplicateIndexes ? "warning" : "ok" },
    { name: "Incomplete Regions", value: STUDENTS_DATA.filter((s) => !s.region).length, status: "ok" },
  ];
  return <div className="fade-in"><div className="page-header"><div className="page-title">Data Quality Monitor</div><div className="page-sub">13. Detect missing/duplicate/inconsistent records.</div></div><div className="card table-wrap"><table><thead><tr><th>Check</th><th>Count</th><th>Status</th></tr></thead><tbody>{issues.map((i)=><tr key={i.name}><td>{i.name}</td><td>{i.value}</td><td><span className={`badge ${i.status === "warning" ? "badge-warning" : "badge-success"}`}>{i.status}</span></td></tr>)}</tbody></table></div></div>;
}

function ApprovalSlaPage() {
  const [rows, setRows] = useState([
    { id: 1, queue: "Pending Selections", under24: 8, under72: 4, over72: 2 },
    { id: 2, queue: "Document Review", under24: 12, under72: 5, over72: 1 },
  ]);
  return <div className="fade-in"><div className="page-header"><div className="page-title">Approval SLA Dashboard</div><div className="page-sub">14. Aging and turnaround performance tracking.</div></div><div className="card table-wrap"><table><thead><tr><th>Queue</th><th>&lt;24h</th><th>24-72h</th><th>&gt;72h</th></tr></thead><tbody>{rows.map((r)=><tr key={r.id}><td>{r.queue}</td><td>{r.under24}</td><td>{r.under72}</td><td>{r.over72}</td></tr>)}</tbody></table></div></div>;
}

function FeatureFlagsPage() {
  const [flags, setFlags] = useState([
    { id: 1, key: "new-recommendation-engine", stage: "pilot", enabled: true },
    { id: 2, key: "advanced-risk-model", stage: "beta", enabled: false },
  ]);
  const toggle = (id) => setFlags((f) => f.map((x) => x.id === id ? { ...x, enabled: !x.enabled } : x));
  return <div className="fade-in"><div className="page-header"><div className="page-title">Feature Flags & Rollout</div><div className="page-sub">15. Controlled release by stage and audience.</div></div><div className="card table-wrap"><table><thead><tr><th>Flag</th><th>Stage</th><th>Enabled</th></tr></thead><tbody>{flags.map((x)=><tr key={x.id}><td>{x.key}</td><td>{x.stage}</td><td><input type="checkbox" checked={x.enabled} onChange={()=>toggle(x.id)} /></td></tr>)}</tbody></table></div></div>;
}

// ADMIN NAV
const ADMIN_NAV = [
  {section:"Overview"},{key:"dashboard",icon:"dashboard",label:"Dashboard",color:"#6366f1"},
  {section:"Admissions & Mock Placement"},{key:"students",icon:"students",label:"Students",color:"#3b82f6"},{key:"enroll",icon:"enroll",label:"Enroll Student",color:"#0ea5e9"},{key:"schools",icon:"schools",label:"Schools",color:"#06b6d4"},{key:"pending",icon:"pending",label:"Pending Selections",badge:true,color:"#ef4444"},{key:"confirmed",icon:"confirmed",label:"Confirmed",color:"#16a34a"},
  {section:"Academic Management"},{key:"scores",icon:"scores",label:"Test Scores",color:"#f43f5e"},{key:"results",icon:"results",label:"Results",color:"#f97316"},{key:"grading",icon:"grading",label:"Grade Report",color:"#ec4899"},{key:"analytics",icon:"analytics",label:"Analytics",color:"#7c3aed"},
  {section:"Student Services"},{key:"attendance",icon:"attendance",label:"Attendance",color:"#14b8a6"},{key:"fees",icon:"fees",label:"Fees",color:"#22c55e"},{key:"teachers",icon:"teachers",label:"Teachers",color:"#8b5cf6"},
  {section:"Communication"},{key:"chat",icon:"chat",label:"Chat",color:"#10b981"},{key:"events",icon:"events",label:"Events",color:"#f59e0b"},
  {section:"Administration"},{key:"finance",icon:"finance",label:"Finance",color:"#d97706"},{key:"settings",icon:"settings",label:"Settings",color:"#64748b"},
  {section:"Platform Suite"},
  {key:"permissions",icon:"lock",label:"Permissions",color:"#1d4ed8"},
  {key:"audit",icon:"docs",label:"Audit Trail",color:"#0f766e"},
  {key:"notify",icon:"bell",label:"Notifications",color:"#b45309"},
  {key:"payments",icon:"fees",label:"Payments",color:"#15803d"},
  {key:"documents",icon:"docs",label:"Documents",color:"#7c2d12"},
  {key:"reports",icon:"results",label:"Reports",color:"#7c3aed"},
  {key:"insights",icon:"analytics",label:"Advanced Insights",color:"#4338ca"},
  {key:"bulk",icon:"students",label:"Bulk Operations",color:"#334155"},
  {key:"offline",icon:"attendance",label:"Offline Sync",color:"#0369a1"},
  {key:"calendar",icon:"events",label:"Academic Calendar",color:"#d97706"},
  {key:"helpdesk",icon:"support",label:"Helpdesk",color:"#0f766e"},
  {key:"privacy",icon:"lock",label:"Privacy",color:"#991b1b"},
  {key:"recovery",icon:"finance",label:"Recovery",color:"#1e40af"},
  {key:"mobile",icon:"profile",label:"Mobile & PWA",color:"#7c3aed"},
  {section:"Expansion Features"},
  {key:"auto-rules",icon:"settings",label:"Automation Rules",color:"#1d4ed8"},
  {key:"ai-assist",icon:"chat",label:"AI Assistant",color:"#0f766e"},
  {key:"risk-score",icon:"analytics",label:"Risk Scoring",color:"#dc2626"},
  {key:"timetable",icon:"events",label:"Timetable",color:"#0369a1"},
  {key:"exam-builder",icon:"docs",label:"Exam Builder",color:"#7c3aed"},
  {key:"installments",icon:"fees",label:"Installments",color:"#15803d"},
  {key:"campaigns",icon:"bell",label:"Campaigns",color:"#b45309"},
  {key:"recommend",icon:"schools",label:"Recommendations",color:"#1e40af"},
  {key:"digital-id",icon:"profile",label:"Digital ID",color:"#4338ca"},
  {key:"public-status",icon:"results",label:"Public Status",color:"#0f766e"},
  {key:"integrations",icon:"settings",label:"Integrations",color:"#7c2d12"},
  {key:"tenants",icon:"students",label:"Multi-Tenant",color:"#334155"},
  {key:"quality",icon:"docs",label:"Data Quality",color:"#991b1b"},
  {key:"sla",icon:"pending",label:"Approval SLA",color:"#d97706"},
  {key:"flags",icon:"lock",label:"Feature Flags",color:"#475569"},
];

const ADMIN_SUBPAGE_MAP = {
  settings: ["auto-rules", "integrations", "flags"],
  analytics: ["insights", "risk-score", "recommend", "quality"],
  events: ["calendar", "timetable", "exam-builder", "public-status"],
  fees: ["payments", "installments"],
  notify: ["campaigns", "helpdesk"],
  permissions: ["audit", "privacy", "sla"],
  students: ["digital-id", "tenants", "bulk", "offline", "documents"],
};

const STUDENT_NAV = [
  {section:"Overview"},
  {key:"dashboard",icon:"dashboard",label:"Dashboard",color:"#6366f1"},
  {key:"profile",icon:"profile",label:"Profile",color:"#3b82f6"},
  {section:"Academics"},
  {key:"results",icon:"results",label:"Results",color:"#f97316"},
  {key:"analytics-student",icon:"analytics",label:"Analytics",color:"#7c3aed"},
  {key:"report-card",icon:"results",label:"Report Card",color:"#7c3aed"},
  {key:"subject-progress",icon:"analytics",label:"Subject Progress",color:"#4338ca"},
  {key:"study-planner",icon:"calendar",label:"Study Planner",color:"#0f766e"},
  {key:"exam-schedule",icon:"events",label:"Exam Schedule",color:"#0369a1"},
  {key:"goals",icon:"grading",label:"Goals",color:"#8b5cf6"},
  {section:"Mock Placement"},
  {key:"selection",icon:"selection",label:"Select Schools",color:"#06b6d4"},
  {key:"my-selection",icon:"confirmed",label:"My Selection",color:"#16a34a"},
  {key:"predictor",icon:"analytics",label:"Predictor",color:"#7c3aed"},
  {key:"scholarships",icon:"teachers",label:"Scholarships",color:"#d97706"},
  {section:"Student Services"},
  {key:"attendance",icon:"attendance",label:"Attendance",color:"#14b8a6"},
  {key:"attendance-corrections",icon:"attendance",label:"Attendance Corrections",color:"#b45309"},
  {key:"fees",icon:"fees",label:"Fees",color:"#22c55e"},
  {key:"pay-fees",icon:"fees",label:"Pay Fees",color:"#15803d"},
  {key:"payment-plan",icon:"finance",label:"Payment Plan",color:"#166534"},
  {section:"Communication & Resources"},
  {key:"announcements",icon:"bell",label:"Updates",color:"#ef4444"},
  {key:"announcements-pro",icon:"bell",label:"Personalized Updates",color:"#dc2626"},
  {key:"support-tickets",icon:"support",label:"Support Tickets",color:"#0f766e"},
  {key:"chat",icon:"chat",label:"Chat",color:"#10b981"},
  {key:"docs",icon:"docs",label:"Documents",color:"#f97316"},
  {key:"upload-docs",icon:"enroll",label:"Upload Documents",color:"#7c2d12"},
  {key:"resources",icon:"docs",label:"Resources",color:"#475569"},
  {key:"assignments",icon:"docs",label:"Assignments",color:"#1d4ed8"},
  {key:"calendar-sync",icon:"events",label:"Calendar Sync",color:"#1e40af"},
];

const STUDENT_SUBPAGE_MAP = {
  results: ["analytics-student", "report-card", "subject-progress", "study-planner", "exam-schedule", "goals"],
  selection: ["my-selection", "predictor", "scholarships"],
  attendance: ["attendance-corrections"],
  fees: ["pay-fees", "payment-plan"],
  announcements: ["announcements-pro", "support-tickets", "chat"],
  docs: ["upload-docs", "resources", "assignments", "calendar-sync"],
};

// ADMIN PORTAL
function AdminPortal({ user, onLogout, darkMode, onToggleDark }) {
  const { cfg: appCfg } = useContext(SettingsContext);
  const childToParent = useMemo(() => {
    const map = {};
    Object.entries(ADMIN_SUBPAGE_MAP).forEach(([parent, children]) => {
      children.forEach((key) => { map[key] = parent; });
    });
    return map;
  }, []);
  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries(Object.keys(ADMIN_SUBPAGE_MAP).map((k) => [k, false]))
  );
  const [tab, setTab] = useState(() => readStoredTab(ADMIN_TAB_KEY, "dashboard"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [adminStudents, setAdminStudents] = useState(sortStudentsByIndex(STUDENTS_DATA));
  const [adminSchools, setAdminSchools] = useState(SCHOOLS_DATA);
  const [pendingSelections, setPendingSelections] = useState([]);
  const [confirmedSelections, setConfirmedSelections] = useState([]);
  const [feesData, setFeesData] = useState(FEES_DATA);
  const [teachersData, setTeachersData] = useState(TEACHERS_DATA);
  const [databaseTables, setDatabaseTables] = useState({
    users: { rows: [], error: "" },
    students: { rows: [], error: "" },
    schools: { rows: [], error: "" },
    school_selections: { rows: [], error: "" },
    events: { rows: [], error: "" },
    attendance: { rows: [], error: "Not loaded yet" },
    fees: { rows: [], error: "Not loaded yet" },
    teachers: { rows: [], error: "Not loaded yet" },
    app_settings: { rows: [], error: "Not loaded yet" },
    chat_messages: { rows: [], error: "Not loaded yet" },
    scores: { rows: [], error: "Not loaded yet" },
    results: { rows: [], error: "Not loaded yet" },
  });
  const [loadingPlacements, setLoadingPlacements] = useState(false);
  const [chatUsers, setChatUsers] = useState([
    {id:1, name:"Support Team", avatar:"S", unread:0, status:"active"},
    {id:2, name:"Ms. Ama Owusu", avatar:"A", unread:0, status:"online"},
    {id:3, name:"Mr. Kwesi Adjei", avatar:"K", unread:0, status:"away"},
    {id:4, name:"Admissions Office", avatar:"O", unread:0, status:"active"},
    {id:5, name:"Dr. Yaw Mensah", avatar:"Y", unread:0, status:"online"},
    {id:6, name:"Accra Campus", avatar:"C", unread:0, status:"active"},
    {id:7, name:"Kumasi Branch", avatar:"B", unread:0, status:"away"},
    {id:8, name:"Finance Dept", avatar:"F", unread:0, status:"online"},
    {id:9, name:"IT Support", avatar:"I", unread:0, status:"active"},
    {id:10, name:"Student Affairs", avatar:"E", unread:0, status:"online"},
  ]);
  const totalChatUnread = chatUsers.reduce((sum, u) => sum + u.unread, 0);
  const BOTTOM = ["dashboard","students","pending","analytics","settings"];

  const goTab = (key, closeSidebar = true) => {
    setTab(key);
    writeStoredTab(ADMIN_TAB_KEY, key);
    if (closeSidebar) setSidebarOpen(false);
  };
  const reloadApp = () => window.location.reload();
  const financeSummary = {
    income: feesData.reduce((sum, fee) => sum + Number(fee.paid || 0), 0),
    expenses: FINANCE_DATA.expenses,
    fees_collected: feesData.reduce((sum, fee) => sum + Number(fee.paid || 0), 0),
    outstanding: feesData.reduce((sum, fee) => sum + Math.max(Number(fee.amount || 0) - Number(fee.paid || 0), 0), 0),
  };

  useEffect(() => {
    const parent = childToParent[tab];
    if (parent) {
      setExpandedGroups((prev) => ({ ...prev, [parent]: true }));
    }
  }, [tab, childToParent]);

  useEffect(() => {
    const loadAdminPortalData = async () => {
      if (!supabase) return;

      const { data: students } = await supabase.from("students").select("*").order("id", { ascending: true });
      const normalizedStudents = Array.isArray(students) && students.length
        ? students.map((s, i) => ({
            id: s.id ?? i + 1,
            full_name: s.full_name || s.name || "Unnamed Student",
            index: s.index || s.index_number || s.index_no || `AUTO${i + 1}`,
            class: s.class || s.class_name || "JHS 3A",
            region: s.region || "Unknown",
            aggregate: Number(s.aggregate ?? 0),
            status: s.status || "pending",
            email: s.email || null,
            photo_url: resolveStudentPhotoUrl(s),
            created_at: s.created_at || null,
            updated_at: s.updated_at || null,
          }))
        : STUDENTS_DATA;
      setAdminStudents(sortStudentsByIndex(normalizedStudents));

      const { data: schools } = await supabase.from("schools").select("*").order("name", { ascending: true });
      const normalizedSchools = Array.isArray(schools) && schools.length
        ? sortSchoolsByCategory(schools.map(normalizeSchoolRow))
        : SCHOOLS_DATA;
      setAdminSchools(normalizedSchools);

      const tableEntries = await Promise.all([
        "users",
        "students",
        "schools",
        "school_selections",
        "events",
        "attendance",
        "fees",
        "teachers",
        "app_settings",
        "chat_messages",
        "scores",
        "results",
      ].map(async (tableName) => {
        const { data, error } = await supabase.from(tableName).select("*").limit(25);
        return [tableName, { rows: Array.isArray(data) ? data : [], error: error?.message || "" }];
      }));
      setDatabaseTables(Object.fromEntries(tableEntries));

      const { data: fees } = await supabase.from("fees").select("*").order("id", { ascending: false });
      if (Array.isArray(fees) && fees.length) {
        setFeesData(fees.map(normalizeFeeRow));
      }

      const { data: teachers } = await supabase.from("teachers").select("*").order("name", { ascending: true });
      if (Array.isArray(teachers) && teachers.length) {
        setTeachersData(teachers.map(normalizeTeacherRow));
      }

      setLoadingPlacements(true);
      const { data: selectionRows } = await supabase.from("school_selections").select("*").order("created_at", { ascending: false });
      const studentsMap = new Map();
      normalizedStudents.forEach((student) => {
        studentsMap.set(String(student.id), student);
        studentsMap.set(String(student.index), student);
      });
      if (Array.isArray(selectionRows) && selectionRows.length) {
        const summarized = selectionRows.map((row) => summarizeSelectionRecord(row, studentsMap));
        setPendingSelections(sortRecordsByStudentIndex(summarized.filter((row) => !row.approved && row.status !== "confirmed")));
        setConfirmedSelections(sortRecordsByStudentIndex(summarized.filter((row) => row.approved || row.status === "confirmed")));
      } else {
        setPendingSelections([]);
        setConfirmedSelections([]);
      }
      setLoadingPlacements(false);
    };
    loadAdminPortalData();
  }, []);

  const approveSelection = async (id) => {
    const target = pendingSelections.find((item) => String(item.id) === String(id));
    if (!target) return;

    if (supabase) {
      const reviewedAt = new Date().toISOString();
      const reviewedBy = user?.name || "Admin";
      const payloads = [
        { status: "confirmed", approved: true, reviewed_at: reviewedAt, reviewed_by: reviewedBy },
        { status: "confirmed", approved: true, reviewed_at: reviewedAt },
        { status: "confirmed", approved: true },
        { status: "confirmed" },
        { approved: true },
      ];

      let persisted = false;
      for (const payload of payloads) {
        const { error } = await supabase.from("school_selections").update(payload).eq("id", id);
        if (!error) {
          persisted = true;
          break;
        }

        const msg = String(error.message || "").toLowerCase();
        const isColumnIssue = error.code === "PGRST204" || error.code === "42703" || msg.includes("column");
        if (!isColumnIssue) {
          alert(error.message || "Failed to approve selection.");
          return;
        }
      }

      if (!persisted) {
        alert("Could not persist approval to Supabase. Please check the school_selections table columns.");
        return;
      }
    }

    const approvedRow = { ...target, approved: true, status: "confirmed", reviewedAt: new Date().toISOString() };
    setPendingSelections((items) => sortRecordsByStudentIndex(items.filter((item) => String(item.id) !== String(id))));
    setConfirmedSelections((items) => sortRecordsByStudentIndex([approvedRow, ...items]));
  };

  useEffect(() => {
    if (tab === "events") {
      setNotificationCount(0);
    }
  }, [tab]);

  const openNotifications = () => {
    setNotificationCount(0);
    goTab("events");
  };
  const recentActivity = useMemo(() => buildRecentActivity({
    students: adminStudents,
    selections: [...pendingSelections, ...confirmedSelections],
    fees: feesData,
    events: databaseTables.events?.rows,
  }), [adminStudents, pendingSelections, confirmedSelections, feesData, databaseTables.events?.rows]);
  const handleMainBlankClick = (event) => {
    if (!sidebarOpen) return;
    if (event.target === event.currentTarget) {
      setSidebarOpen(false);
    }
  };

  const renderPage = () => {
    if (tab==="enroll") return <EnrollPage onBack={()=>goTab("students")}/>;
    const pages = {
      dashboard:<AdminDashboard studentsData={adminStudents} schoolsData={adminSchools} pendingRows={pendingSelections} confirmedRows={confirmedSelections} financeSummary={financeSummary} recentActivity={recentActivity}/>, students:<StudentsPage onEnroll={()=>goTab("enroll")} studentsData={adminStudents}/>,
      scores:<ScoresPage studentsData={adminStudents} tableInfo={databaseTables.scores}/>, analytics:<AnalyticsPage studentsData={adminStudents} schoolsData={adminSchools} selectionsData={[...pendingSelections, ...confirmedSelections]} scoreTableInfo={databaseTables.scores}/>, results:<ResultsPage studentsData={adminStudents} tableInfo={databaseTables.results}/>, grading:<GradingPage/>,
      attendance:<AttendancePage studentsData={adminStudents} tableInfo={databaseTables.attendance}/>, fees:<FeesAdmin studentsData={adminStudents} feesData={feesData} tableInfo={databaseTables.fees}/>, teachers:<TeachersPage teachersData={teachersData} tableInfo={databaseTables.teachers}/>, events:<EventsPage eventsData={databaseTables.events?.rows} tableInfo={databaseTables.events}/>,
      schools:<SchoolsPage schoolsData={adminSchools}/>, pending:<PendingSelections rows={pendingSelections} loading={loadingPlacements} onApprove={approveSelection}/>, confirmed:<ConfirmedPlacements rows={confirmedSelections} loading={loadingPlacements}/>,
      finance:<FinancePage financeSummary={financeSummary} tableInfo={databaseTables.fees}/>, chat:<ChatPage chatUsers={chatUsers} onChatUsersChange={setChatUsers}/>, settings:<SettingsPage/>,
      permissions:<PermissionsMatrixPage/>, audit:<AuditTrailPage/>, notify:<NotificationCenterPage/>, payments:<PaymentsReceiptsPage/>,
      documents:<DocumentWorkflowPage/>, reports:<ReportsExportsPage/>, insights:<AdvancedAnalyticsPage/>, bulk:<BulkOperationsPage/>,
      offline:<OfflineSyncPage/>, calendar:<AcademicCalendarPage/>, helpdesk:<HelpdeskPage/>, privacy:<PrivacyCompliancePage/>,
      recovery:<DisasterRecoveryPage/>, mobile:<MobilePwaPage/>,
      "auto-rules":<AutomationRulesPage/>, "ai-assist":<AiAssistantPage/>, "risk-score":<StudentRiskPage/>,
      timetable:<TimetablePage/>, "exam-builder":<ExamBuilderPage/>, installments:<InstallmentPlansPage/>,
      campaigns:<MessagingCampaignsPage/>, recommend:<RecommendationEnginePage/>, "digital-id":<DigitalIdPage/>,
      "public-status":<PublicStatusPage/>, integrations:<IntegrationsPage/>, tenants:<MultiTenantPage/>,
      quality:<DataQualityPage/>, sla:<ApprovalSlaPage/>, flags:<FeatureFlagsPage/>,
    };
    return pages[tab] || <div className="card card-padded" style={{textAlign:"center",padding:48}}><div style={{fontWeight:700}}>Coming Soon</div></div>;
  };

  return (
    <div className="app">
      <Topbar user={user} portal="Admin" onLogout={onLogout} onMenuClick={()=>setSidebarOpen(o=>!o)} darkMode={darkMode} onToggleDark={onToggleDark} onOpenNotifications={openNotifications} onOpenProfile={() => goTab("settings")} onReloadApp={reloadApp} notificationCount={notificationCount} chatUnread={totalChatUnread} onOpenChat={() => goTab("chat")}/>
      <div className="shell">
        {sidebarOpen && <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}/>}
        <nav className={`sidebar ${sidebarOpen?"":"closed"}`}>
          <button className="sidebar-brand brand-btn" onClick={reloadApp} title="Reload app"><img src="https://image2url.com/r2/default/images/1773576400522-25d9d22b-3e79-4a9a-adc2-eae0031fbfe1.png" alt="Campus Ghana"/></button>
          {ADMIN_NAV.map((item,i)=> {
            if (item.section) return <div key={i} className="sidebar-section" style={item.section === "Admissions & Mock Placement" ? { textAlign: "center" } : undefined}>{item.section}</div>;
            if (childToParent[item.key]) return null;

            const childrenKeys = ADMIN_SUBPAGE_MAP[item.key] || [];
            const hasChildren = childrenKeys.length > 0;
            const activeParent = tab === item.key || childrenKeys.includes(tab);

            return (
              <div key={item.key}>
                <button
                  className={`nav-item ${activeParent?"active":""}`}
                  onClick={() => {
                    goTab(item.key, !hasChildren);
                    if (hasChildren) {
                      setExpandedGroups((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                    }
                  }}
                >
                  <Ico name={item.icon} size={26} color={item.color} className="nav-item-icon" style={{strokeWidth:2.6,filter:"saturate(1.08) contrast(1.05)"}}/>
                  <span className="nav-item-label" style={{color:item.color,fontWeight:700}}>{item.label}</span>
                  {item.badge && pendingSelections.length > 0 && <span className="nav-item-badge">{pendingSelections.length}</span>}
                  {hasChildren && <span style={{marginLeft:"auto",fontWeight:700,color:"#64748b"}}>{expandedGroups[item.key] ? "▾" : "▸"}</span>}
                </button>

                {hasChildren && expandedGroups[item.key] && childrenKeys.map((childKey) => {
                  const child = ADMIN_NAV.find((n) => n.key === childKey);
                  if (!child) return null;
                  return (
                    <button
                      key={child.key}
                      className={`nav-item ${tab===child.key?"active":""}`}
                      onClick={()=>goTab(child.key)}
                      style={{paddingLeft:36, marginTop:2, marginBottom:2}}
                    >
                      <Ico name={child.icon} size={20} color={child.color} className="nav-item-icon" />
                      <span className="nav-item-label" style={{color:child.color,fontWeight:600,fontSize:".84rem"}}>{child.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <main className={`main ${sidebarOpen?"":"full"}`} onClick={handleMainBlankClick}>
          {appCfg.maintenanceMode && <div className="alert alert-warning" style={{margin:"16px 16px 0",fontWeight:700,borderRadius:8}}>⚠️ Maintenance Mode is ON — the system is currently in maintenance. Student access may be restricted.</div>}
          {renderPage()}
        </main>
        <div className="bottom-nav">
          <div className="bottom-nav-grid" style={{gridTemplateColumns:`repeat(${BOTTOM.length},1fr)`}}>
            {BOTTOM.map(k=>{
              const item = ADMIN_NAV.find(n=>n.key===k);
              return <button key={k} className={`bottom-nav-item ${tab===k?"active":""}`} onClick={()=>goTab(k)}>
                <Ico name={item.icon} size={20} color={item.color}/><span>{item.label}</span>
              </button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// STUDENT PORTAL
function StudentPortal({ user, onLogout, darkMode, onToggleDark }) {
  const { cfg: appCfg } = useContext(SettingsContext);
  const childToParent = useMemo(() => {
    const map = {};
    Object.entries(STUDENT_SUBPAGE_MAP).forEach(([parent, children]) => {
      children.forEach((key) => { map[key] = parent; });
    });
    return map;
  }, []);
  const [expandedGroups, setExpandedGroups] = useState(() =>
    Object.fromEntries(Object.keys(STUDENT_SUBPAGE_MAP).map((k) => [k, false]))
  );
  const [tab, setTab] = useState(() => readStoredTab(STUDENT_TAB_KEY, "dashboard"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [schoolsData, setSchoolsData] = useState(SCHOOLS_DATA);
  const [studentData, setStudentData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [feesData, setFeesData] = useState([]);
  const [selectionRow, setSelectionRow] = useState(null);
  const [scoreValues, setScoreValues] = useState([]);
  const [chatUsers, setChatUsers] = useState([
    {id:1, name:"Support Team", avatar:"S", unread:0, status:"active"},
    {id:2, name:"Ms. Ama Owusu", avatar:"A", unread:0, status:"online"},
    {id:3, name:"Mr. Kwesi Adjei", avatar:"K", unread:0, status:"away"},
    {id:4, name:"Admissions Office", avatar:"O", unread:0, status:"active"},
    {id:5, name:"Dr. Yaw Mensah", avatar:"Y", unread:0, status:"online"},
    {id:6, name:"Accra Campus", avatar:"C", unread:0, status:"active"},
    {id:7, name:"Kumasi Branch", avatar:"B", unread:0, status:"away"},
    {id:8, name:"Finance Dept", avatar:"F", unread:0, status:"online"},
    {id:9, name:"IT Support", avatar:"I", unread:0, status:"active"},
    {id:10, name:"Student Affairs", avatar:"E", unread:0, status:"online"},
  ]);
  const totalChatUnread = chatUsers.reduce((sum, u) => sum + u.unread, 0);
  const BOTTOM = ["dashboard","selection","my-selection","fees"];
  const selectionNoticeKey = `student_selection_notice_seen_${String(user?.email || user?.index || "student")}`;
  const selectionStatus = String(selectionRow?.status || "").toLowerCase();
  const isSelectionApproved = !!selectionRow && (!!selectionRow?.approved || selectionStatus === "confirmed");
  const approvedAtRaw = selectionRow?.reviewed_at || selectionRow?.reviewedAt || selectionRow?.updated_at || selectionRow?.created_at || null;
  const approvedAtLabel = approvedAtRaw
    ? new Date(approvedAtRaw).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "";
  const approvalInfo = {
    isApproved: isSelectionApproved,
    approvedAtLabel,
    id: selectionRow?.id || "",
    stamp: approvedAtRaw || "",
  };

  const markSelectionApprovalSeen = useCallback(() => {
    if (!approvalInfo.isApproved) return;
    try {
      sessionStorage.setItem(selectionNoticeKey, `${approvalInfo.id}:${approvalInfo.stamp}`);
    } catch {}
    setNotificationCount(0);
  }, [approvalInfo.id, approvalInfo.isApproved, approvalInfo.stamp, selectionNoticeKey]);

  const goTab = (key, closeSidebar = true) => { setTab(key); writeStoredTab(STUDENT_TAB_KEY, key); if (closeSidebar) setSidebarOpen(false); };
  const reloadApp = () => window.location.reload();

  useEffect(() => {
    const parent = childToParent[tab];
    if (parent) {
      setExpandedGroups((prev) => ({ ...prev, [parent]: true }));
    }
  }, [tab, childToParent]);

  useEffect(() => {
    const loadStudentPortalData = async () => {
      if (!supabase) return;

      const identifier = String(user?.index || "");
      const resolveStudent = async () => {
        let student = null;
        const studentLookups = [];
        if (/^\d{12}$/.test(identifier)) {
          studentLookups.push(() => supabase.from("students").select("*").eq("index_number", identifier).limit(1).maybeSingle());
          studentLookups.push(() => supabase.from("students").select("*").eq("index", identifier).limit(1).maybeSingle());
        }
        if (user?.email && !String(user.email).endsWith("@student.local")) {
          studentLookups.push(() => supabase.from("students").select("*").eq("email", user.email).limit(1).maybeSingle());
        }
        for (const run of studentLookups) {
          const { data, error } = await run();
          if (error) {
            if (isMissingColumnError(error)) continue;
            continue;
          }
          if (data) {
            student = data;
            break;
          }
        }
        return student;
      };

      const [{ data: schools }, student] = await Promise.all([
        supabase.from("schools").select("*").order("name", { ascending: true }),
        resolveStudent(),
      ]);

      if (Array.isArray(schools) && schools.length) {
        setSchoolsData(sortSchoolsByCategory(schools.map(normalizeSchoolRow)));
      }

      if (student) {
        setStudentData({
          ...student,
          full_name: student.full_name || student.name || user?.name || "Student",
          index: student.index || student.index_number || identifier,
          class: student.class || student.class_name || "JHS 3",
          region: student.region || "Unknown",
          aggregate: Number(student.aggregate ?? 0),
          photo_url: resolveStudentPhotoUrl(student),
        });

        const runFirstSuccessful = async (runs) => {
          for (const run of runs) {
            const { data, error } = await run();
            if (error) {
              if (isMissingColumnError(error)) continue;
              continue;
            }
            if (Array.isArray(data) && data.length) return data;
          }
          return [];
        };

        const idx = student.index_number || student.index;
        const [attendanceRows, feeRows, scoreRows, selection] = await Promise.all([
          runFirstSuccessful([
            () => supabase.from("attendance").select("*").eq("student_id", student.id).order("date", { ascending: false }),
            ...(idx ? [() => supabase.from("attendance").select("*").eq("index_number", idx).order("date", { ascending: false })] : []),
          ]),
          runFirstSuccessful([
            () => supabase.from("fees").select("*").eq("student_id", student.id).order("id", { ascending: false }),
            ...(idx ? [() => supabase.from("fees").select("*").eq("index_number", idx).order("id", { ascending: false })] : []),
          ]),
          runFirstSuccessful([
            () => supabase.from("scores").select("score").eq("student_id", student.id),
            ...(idx ? [() => supabase.from("scores").select("score").eq("index_number", idx)] : []),
          ]),
          fetchStudentSelection({ userEmail: user?.email || getSessionUserEmail(), studentData: {
            id: student.id,
            index: student.index || student.index_number,
            index_number: student.index_number || student.index,
          } }),
        ]);

        if (Array.isArray(attendanceRows) && attendanceRows.length) {
          setAttendanceData(attendanceRows.map((r, i) => ({ id: r.id ?? i + 1, date: r.date || r.day || "-", status: r.status || "Present" })));
        }

        if (Array.isArray(feeRows) && feeRows.length) {
          setFeesData(feeRows.map((f, i) => ({
            id: f.id ?? i + 1,
            term: f.term || f.semester || `Term ${i + 1}`,
            amount: Number(f.amount ?? f.total ?? 0),
            paid: Number(f.paid ?? f.amount_paid ?? 0),
            status: f.status || (Number(f.paid ?? 0) >= Number(f.amount ?? 0) ? "paid" : Number(f.paid ?? 0) > 0 ? "partial" : "unpaid"),
          })));
        }

        if (Array.isArray(scoreRows) && scoreRows.length) {
          setScoreValues(scoreRows.map((row) => Number(row?.score ?? 0)).filter((v) => Number.isFinite(v) && v >= 0));
        }

        if (selection) setSelectionRow(selection);
      }
    };

    loadStudentPortalData();
  }, [user?.email, user?.index, user?.name]);

  useEffect(() => {
    if (tab === "my-selection") {
      markSelectionApprovalSeen();
    }
  }, [markSelectionApprovalSeen, tab]);

  useEffect(() => {
    if (!approvalInfo.isApproved) {
      setNotificationCount(0);
      return;
    }
    let seenStamp = "";
    try {
      seenStamp = sessionStorage.getItem(selectionNoticeKey) || "";
    } catch {}
    const currentStamp = `${approvalInfo.id}:${approvalInfo.stamp}`;
    if (seenStamp !== currentStamp && tab !== "announcements" && tab !== "my-selection") {
      setNotificationCount(1);
    } else {
      setNotificationCount(0);
    }
  }, [approvalInfo.id, approvalInfo.isApproved, approvalInfo.stamp, selectionNoticeKey, tab]);

  useEffect(() => {
    if (tab === "announcements") {
      markSelectionApprovalSeen();
    }
  }, [markSelectionApprovalSeen, tab]);

  const openNotifications = () => {
    markSelectionApprovalSeen();
    goTab("announcements");
  };
  const handleMainBlankClick = (event) => {
    if (!sidebarOpen) return;
    if (event.target === event.currentTarget) {
      setSidebarOpen(false);
    }
  };

  const renderPage = () => {
    const pages = {
      dashboard:<StudentDashboard user={user} studentData={studentData} attendanceData={attendanceData} feesData={feesData} selectionInfo={{ count: normalizeSelectionList(selectionRow).length, status: selectionRow?.status || "not-submitted" }} scoreValues={scoreValues}/>,
      profile:<StudentProfile user={user} studentData={studentData}/>,
      results:<StudentResultsPage scoreValues={scoreValues}/>,
      "analytics-student":<StudentAnalyticsPage scoreValues={scoreValues} attendanceData={attendanceData} feesData={feesData}/>,
      attendance:<StudentAttendance attendanceData={attendanceData}/>, fees:<StudentFees feesData={feesData}/>, docs:<DocumentsPage/>,
      announcements:<div className="fade-in">
        <div className="page-header"><div className="page-title">Announcements</div><div className="page-sub">Notification channels: {appCfg.emailNotifs ? "Email " : ""}{appCfg.smsNotifs ? "SMS" : "In-app"}</div></div>
        {approvalInfo.isApproved && (
          <div className="card card-padded" style={{marginBottom:12,borderLeft:"4px solid #16a34a",background:"#f0fdf4"}}>
            <div style={{fontWeight:800,marginBottom:4,color:"#14532d"}}>Selection Approved</div>
            <div style={{color:"#166534",fontSize:".9rem"}}>Your selected schools have been approved by the admin and placement processing can continue.</div>
            {approvalInfo.approvedAtLabel && <div style={{fontSize:".78rem",color:"#166534",marginTop:6}}>Approved: {approvalInfo.approvedAtLabel}</div>}
          </div>
        )}
        {ANNOUNCEMENTS.map(a=>(
          <div key={a.id} className={`card card-padded ${a.type==="urgent"?"":""}`} style={{marginBottom:12,borderLeft:`4px solid ${a.type==="urgent"?"#dc2626":a.type==="info"?"#1a56db":"#d97706"}`}}>
            <div style={{fontWeight:700,marginBottom:4}}>{a.title}</div>
            <div style={{color:"#475569",fontSize:".9rem"}}>{a.body}</div>
            <div style={{fontSize:".78rem",color:"#94a3b8",marginTop:6}}>{a.date}</div>
          </div>
        ))}
      </div>,
      selection:<SchoolSelection schoolsData={schoolsData} studentData={studentData}/>,
      "my-selection":<MySelection selectionRow={selectionRow} approvalInfo={approvalInfo}/>,
      predictor:<PlacementPredictor schoolsData={schoolsData}/>, chat:<ChatPage chatUsers={chatUsers} onChatUsersChange={setChatUsers}/>,
      assignments:<AssignmentTrackerPage/>,
      "exam-schedule":<ExamSchedulePage/>,
      "report-card":<ReportCardPage studentData={studentData} attendanceData={attendanceData} feesData={feesData}/>,
      "subject-progress":<SubjectProgressPage/>,
      "study-planner":<StudyPlannerPage/>,
      "attendance-corrections":<AttendanceCorrectionPage attendanceData={attendanceData}/>,
      "pay-fees":<StudentPaymentsPage feesData={feesData}/>,
      "payment-plan":<StudentPaymentPlansPage feesData={feesData}/>,
      "announcements-pro":<PersonalizedAnnouncementsPage/>,
      "upload-docs":<StudentUploadDocsPage/>,
      "calendar-sync":<CalendarSyncPage/>,
      "support-tickets":<StudentTicketsPage/>,
      goals:<StudentGoalsPage/>,
      scholarships:<ScholarshipBoardPage/>,
      resources:<LearningResourcesPage/>,
    };
    return pages[tab] || <div className="card card-padded" style={{textAlign:"center",padding:48}}>Coming soon</div>;
  };

  if (!appCfg.studentPortalOpen) {
    return (
      <div className="app" style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#f8fafc"}}>
        <div className="card card-padded" style={{maxWidth:420,textAlign:"center",padding:40}}>
          <div style={{fontSize:3+"rem",marginBottom:12}}>🔒</div>
          <div style={{fontWeight:800,fontSize:"1.2rem",marginBottom:8,color:"#1e3a8a"}}>Student Portal Closed</div>
          <div style={{color:"#475569",fontSize:".95rem",marginBottom:20}}>The student portal is currently closed by the administrator. Please check back later or contact your school.</div>
          <button className="btn btn-outline" onClick={onLogout}>Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Topbar user={user} portal="Student" onLogout={onLogout} onMenuClick={()=>setSidebarOpen(o=>!o)} darkMode={darkMode} onToggleDark={onToggleDark} onOpenNotifications={openNotifications} onOpenProfile={() => goTab("profile")} onReloadApp={reloadApp} notificationCount={notificationCount} chatUnread={totalChatUnread} onOpenChat={() => goTab("chat")}/>
      <div className="shell">
        {sidebarOpen && <div className="sidebar-overlay" onClick={()=>setSidebarOpen(false)}/>}
        <nav className={`sidebar ${sidebarOpen?"":"closed"}`}>
          <button className="sidebar-brand brand-btn" onClick={reloadApp} title="Reload app"><img src="https://image2url.com/r2/default/images/1773576400522-25d9d22b-3e79-4a9a-adc2-eae0031fbfe1.png" alt="Campus Ghana"/></button>
          {STUDENT_NAV.map((item, i)=> {
            if (item.section) return <div key={i} className="sidebar-section">{item.section}</div>;
            if (childToParent[item.key]) return null;

            const childrenKeys = STUDENT_SUBPAGE_MAP[item.key] || [];
            const hasChildren = childrenKeys.length > 0;
            const activeParent = tab === item.key || childrenKeys.includes(tab);

            return (
              <div key={item.key}>
                <button
                  className={`nav-item ${activeParent?"active":""}`}
                  onClick={() => {
                    goTab(item.key, !hasChildren);
                    if (hasChildren) {
                      setExpandedGroups((prev) => ({ ...prev, [item.key]: !prev[item.key] }));
                    }
                  }}
                >
                  <Ico name={item.icon} size={26} color={item.color} className="nav-item-icon" style={{strokeWidth:2.6,filter:"saturate(1.08) contrast(1.05)"}}/>
                  <span className="nav-item-label" style={{color:item.color,fontWeight:700}}>{item.label}</span>
                  {hasChildren && <span style={{marginLeft:"auto",fontWeight:700,color:"#64748b"}}>{expandedGroups[item.key] ? "▾" : "▸"}</span>}
                </button>

                {hasChildren && expandedGroups[item.key] && childrenKeys.map((childKey) => {
                  const child = STUDENT_NAV.find((n) => n.key === childKey);
                  if (!child) return null;
                  return (
                    <button
                      key={child.key}
                      className={`nav-item ${tab===child.key?"active":""}`}
                      onClick={()=>goTab(child.key)}
                      style={{paddingLeft:36, marginTop:2, marginBottom:2}}
                    >
                      <Ico name={child.icon} size={20} color={child.color} className="nav-item-icon" />
                      <span className="nav-item-label" style={{color:child.color,fontWeight:600,fontSize:".84rem"}}>{child.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>
        <main className={`main full`} onClick={handleMainBlankClick}>
          {appCfg.maintenanceMode && <div className="alert alert-warning" style={{margin:"16px 16px 0",fontWeight:700,borderRadius:8}}>⚠️ System is currently under maintenance. Some features may be unavailable.</div>}
          {renderPage()}
        </main>
        <div className="bottom-nav">
          <div className="bottom-nav-grid" style={{gridTemplateColumns:`repeat(${BOTTOM.length},1fr)`}}>
            {BOTTOM.map(k=>{
              const item = STUDENT_NAV.find(n=>n.key===k);
              return <button key={k} className={`bottom-nav-item ${tab===k?"active":""}`} onClick={()=>goTab(k)}>
                <Ico name={item.icon} size={20} color={item.color}/><span style={{fontSize:".6rem"}}>{item.label}</span>
              </button>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ROOT
export default function GhanaCampus() {
  const [session, setSession] = useState(() => readAppSession());
  const [darkMode, setDarkMode] = useState(false);
  const [appSettings, setAppSettings] = useState(DEFAULT_SETTINGS);

  const hydrateSessionFromSupabase = useCallback(async () => {
    if (!supabase) {
      setSession(readAppSession());
      return;
    }

    const { data } = await supabase.auth.getSession();
    const authUser = data?.session?.user;

    if (!authUser) {
      setSession(readAppSession());
      return;
    }

    let displayName = authUser.user_metadata?.full_name || authUser.email || "User";
    let role = authUser.user_metadata?.role || "student";

    let profile = null;
    if (profilesTableAvailable) {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", authUser.id)
        .maybeSingle();
      if (error && isProfilesTableMissingError(error)) {
        profilesTableAvailable = false;
      } else {
        profile = profileData;
      }
    }

    if (profile?.full_name) displayName = profile.full_name;
    if (profile?.role === "admin" || profile?.role === "student") role = profile.role;

    const restoredSession = {
      authSource: "supabase",
      portal: role,
      user: {
        id: authUser.id,
        email: authUser.email,
        role,
        name: displayName,
      },
    };
    setSession(restoredSession);
    writeAppSession(restoredSession);
  }, []);

  const login = async (portal, user, password) => {
    if (supabase) {
      const identifier = String(user.email || "").trim();

      if (portal === "student" && /^\d{12}$/.test(identifier)) {
        const indexColumns = ["index_number", "index", "index_no", "bece_index"];
        let matchedStudent = null;

        for (const col of indexColumns) {
          const { data: studentRow, error: studentErr } = await supabase
            .from("students")
            .select("*")
            .eq(col, identifier)
            .limit(1)
            .maybeSingle();

          if (studentErr) {
            if (isMissingColumnError(studentErr)) continue;
            return { ok: false, error: studentErr.message || "Student validation failed." };
          }
          if (studentRow) {
            matchedStudent = studentRow;
            break;
          }
        }

        if (!matchedStudent) {
          return { ok: false, error: "Student ID not found." };
        }

        const passwordValue = String(password || "").trim();
        const parentContactColumns = ["parent_contact", "parent_phone", "guardian_phone", "guardian_contact", "phone", "parent_password"];
        const hasValidParentContact = parentContactColumns.some((col) => {
          if (matchedStudent[col] == null) return false;
          return String(matchedStudent[col]).trim() === passwordValue;
        });

        if (!hasValidParentContact) {
          return { ok: false, error: "Parent contact does not match our records." };
        }

        const studentName = matchedStudent.full_name || matchedStudent.name || "Student";
        await supabase.auth.signOut();
        const studentSession = {
          authSource: "custom",
          portal: "student",
          user: {
            id: matchedStudent.id || identifier,
            email: `${identifier}@student.local`,
            role: "student",
            name: studentName,
            index: identifier,
          },
        };
        setSession(studentSession);
        writeAppSession(studentSession);
        return { ok: true };
      }

      const { data: tableUsers, error: tableUsersError } = await supabase
        .from("users")
        .select("id, email, password, role, full_name")
        .eq("email", identifier)
        .limit(1);

      if (!tableUsersError && Array.isArray(tableUsers) && tableUsers.length > 0) {
        const matchedUser = tableUsers[0];
        if (String(matchedUser.password || "") !== String(password || "")) {
          return { ok: false, error: "Invalid email or password." };
        }

        await supabase.auth.signOut();
        const tableSession = {
          authSource: "custom",
          portal: matchedUser.role === "admin" || matchedUser.role === "student" ? matchedUser.role : portal,
          user: {
            id: matchedUser.id || user.id,
            email: matchedUser.email || user.email,
            role: matchedUser.role || portal,
            name: matchedUser.full_name || user.name,
          },
        };
        setSession(tableSession);
        writeAppSession(tableSession);
        return { ok: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email: user.email, password });
      if (error) return { ok: false, error: error.message };

      const authUser = data?.user;
      let displayName = user.name;
      let roleFromProfile = portal;

      if (authUser?.id && profilesTableAvailable) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", authUser.id)
          .maybeSingle();
        if (profileError && isProfilesTableMissingError(profileError)) {
          profilesTableAvailable = false;
        } else {
          if (profile?.full_name) displayName = profile.full_name;
          if (profile?.role === "admin" || profile?.role === "student") roleFromProfile = profile.role;
        }
      }

      const s = {
        authSource: "supabase",
        portal: roleFromProfile,
        user: { ...user, name: displayName, id: authUser?.id || user.id, email: authUser?.email || user.email }
      };
      setSession(s);
      writeAppSession(s);
      return { ok: true };
    }

    const s = { authSource: "custom", portal, user };
    setSession(s);
    writeAppSession(s);
    return { ok: true };
  };

  const signUp = async (portal, user, password) => {
    if (!supabase) {
      return { ok: false, error: "Supabase is not configured for sign-up." };
    }

    const { data, error } = await supabase.auth.signUp({
      email: user.email,
      password,
      options: {
        data: { full_name: user.name, role: portal }
      }
    });
    if (error) return { ok: false, error: error.message };

    const authUser = data?.user;
    if (authUser?.id && profilesTableAvailable) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: authUser.id,
        email: user.email,
        full_name: user.name,
        role: portal,
      });
      if (profileError && isProfilesTableMissingError(profileError)) {
        profilesTableAvailable = false;
      }
    }

    const hasSession = !!data?.session;
    if (hasSession && authUser) {
      const signedUpSession = {
        authSource: "supabase",
        portal,
        user: {
          id: authUser.id,
          email: authUser.email,
          role: portal,
          name: user.name,
        },
      };
      setSession(signedUpSession);
      writeAppSession(signedUpSession);
      return { ok: true, requiresEmailVerification: false };
    }

    return { ok: true, requiresEmailVerification: true };
  };
  const logout = () => {
    if (supabase) supabase.auth.signOut();
    setSession(null);
    writeAppSession(null);
  };

  useEffect(() => {
    globalThis.__campus_user_email = session?.user?.email || "demo@campus.local";
  }, [session]);

  useEffect(() => {
    document.title = appSettings.systemName || "Campus Ghana";
    document.body.classList.toggle("dark-mode", !!darkMode);
    document.body.style.background = darkMode ? "#0b1220" : "";
    document.body.style.color = darkMode ? "#e2e8f0" : "";
  }, [darkMode, appSettings.systemName]);

  useEffect(() => {
    const loadSettings = async () => {
      if (!supabase) return;
      const { data } = await supabase.from("app_settings").select("config").eq("id", 1).maybeSingle();
      if (data?.config) setAppSettings(s => ({ ...DEFAULT_SETTINGS, ...s, ...data.config }));
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!supabase) return;

    hydrateSessionFromSupabase();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      hydrateSessionFromSupabase();
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [hydrateSessionFromSupabase]);

  return (
    <SettingsContext.Provider value={{ cfg: appSettings, updateCfg: setAppSettings }}>
      <style>{css}</style>
      {!session
        ? <Landing onSelect={(portal, user, password) => login(portal, user, password)}/>
        : session.portal === "admin"
          ? <AdminPortal user={session.user} onLogout={logout} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)}/>
          : <StudentPortal user={session.user} onLogout={logout} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)}/>
      }
    </SettingsContext.Provider>
  );
}


