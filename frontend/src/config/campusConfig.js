export const DEFAULT_SETTINGS = {
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
  roleDefinitions: [],
  roleMetaOverrides: {},
  rolePrivileges: {},
};

export const getGrade = (score) => {
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