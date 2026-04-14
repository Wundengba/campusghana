export const SUBJECTS = ["English Language","Mathematics","Integrated Science","Social Studies","Religious & Moral Ed","Home Language","French","Creative Arts","Career Technology","Computing"];
export const GHANA_REGIONS = ["Greater Accra","Ashanti","Western","Central","Eastern","Volta","Northern","Upper East","Upper West","Bono","Oti","Ahafo","Bono East","North East","Savannah","Western North"];
export const SCHOOLS_DATA = [
  { id:1, name:"Achimota School", region:"Greater Accra", category:"A", cutoff:8, slots:300 },
  { id:2, name:"Wesley Girls' High School", region:"Central", category:"A", cutoff:6, slots:250 },
  { id:3, name:"Prempeh College", region:"Ashanti", category:"A", cutoff:7, slots:280 },
  { id:4, name:"St. Augustine's College", region:"Central", category:"B", cutoff:9, slots:200 },
  { id:5, name:"Holy Child School", region:"Central", category:"B", cutoff:10, slots:180 },
  { id:6, name:"Kumasi Academy", region:"Ashanti", category:"B", cutoff:12, slots:220 },
  { id:7, name:"GSTS Takoradi", region:"Western", category:"C", cutoff:14, slots:350 },
  { id:8, name:"Tamale SHS", region:"Northern", category:"C", cutoff:15, slots:400 },
];
export const STUDENTS_DATA = [
  { id:1, full_name:"Kwame Asante", index:"2024001", class:"JHS 3A", region:"Ashanti", aggregate:8, status:"confirmed" },
  { id:2, full_name:"Abena Mensah", index:"2024002", class:"JHS 3A", region:"Greater Accra", aggregate:12, status:"pending" },
  { id:3, full_name:"Kofi Boateng", index:"2024003", class:"JHS 3B", region:"Central", aggregate:6, status:"confirmed" },
  { id:4, full_name:"Akosua Frimpong", index:"2024004", class:"JHS 3B", region:"Western", aggregate:15, status:"pending" },
  { id:5, full_name:"Yaw Darko", index:"2024005", class:"JHS 3C", region:"Volta", aggregate:10, status:"confirmed" },
];
export const SCORES_DATA = STUDENTS_DATA.map((student) => ({
  student_id: student.id,
  name: student.full_name,
  scores: Object.fromEntries(SUBJECTS.map((subject) => [subject, Math.floor(Math.random() * 50) + 40])),
}));
export const ATTENDANCE_DATA = Array.from({length:20}, (_,i) => ({
  id:i+1, date: new Date(Date.now() - i*86400000*1.5).toISOString().split("T")[0],
  status: Math.random() > 0.15 ? "Present" : "Absent"
}));
export const ANNOUNCEMENTS = [
  { id:1, title:"BECE Registration Open", body:"All JHS 3 students should complete BECE registration by April 30, 2024.", date:"2024-04-10", type:"urgent" },
  { id:2, title:"School Selection Window", body:"Students can now select up to 6 secondary schools. Deadline: May 15, 2024.", date:"2024-04-08", type:"info" },
  { id:3, title:"Mid-term Break", body:"School resumes on Monday, April 22, 2024. Enjoy your break!", date:"2024-04-05", type:"notice" },
];
export const FEES_DATA = [
  { id:1, term:"First Term 2024", amount:350, paid:350, date:"2024-01-15", status:"paid" },
  { id:2, term:"Second Term 2024", amount:350, paid:200, date:"2024-04-02", status:"partial" },
  { id:3, term:"Third Term 2024", amount:350, paid:0, date:null, status:"unpaid" },
];
export const FINANCE_DATA = { income: 125000, expenses: 89000, fees_collected: 98000, outstanding: 27000 };
export const TEACHERS_DATA = [
  { id:1, name:"Mr. Kwesi Adjei", subject:"Mathematics", class:"JHS 3A,3B", phone:"0244123456" },
  { id:2, name:"Mrs. Ama Owusu", subject:"English Language", class:"JHS 3A,3C", phone:"0244234567" },
  { id:3, name:"Mr. Baffour Dankwah", subject:"Science", class:"JHS 3B,3C", phone:"0244345678" },
];
export const EVENTS_DATA = [
  { id:1, title:"BECE Mock Exams", date:"2024-04-22", type:"exam", desc:"Three-day mock examination for JHS 3" },
  { id:2, title:"PTA Meeting", date:"2024-04-28", type:"meeting", desc:"Parents & teachers Q1 review" },
  { id:3, title:"Sports Day", date:"2024-05-10", type:"event", desc:"Annual inter-house sports competition" },
];