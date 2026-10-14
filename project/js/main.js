/* =========================================================
   SCRIPT.JS - TOÀN BỘ LOGIC NGHIỆP VỤ DANH SÁCH MENTEE & RỦI RO
   ========================================================= */

const STORAGE_KEY = "ONBOARDAI_MENTEE_MODULE_DB";

// Dữ liệu giả lập ban đầu chuẩn tiếng Việt (7 thực thể BTL-20)
const INITIAL_MENTEES = [
  {
    id: "nh-01",
    name: "Trần Minh Anh",
    email: "minhanh.tran@techcorp.vn",
    role: "Frontend Developer (Junior)",
    department: "Công nghệ thông tin (IT)",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    startDate: "2026-09-15",
    probationDays: 60,
    progressPercent: 68,
    riskStatus: "normal",
    riskReason: "Tiến độ rất tốt, đã giải quyết xong starter project và PR #142 đúng hạn.",
    lastCheckinDate: "2026-09-28"
  },
  {
    id: "nh-02",
    name: "Nguyễn Văn An",
    email: "vanan.nguyen@techcorp.vn",
    role: "Backend Developer Intern",
    department: "Công nghệ thông tin (IT)",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    startDate: "2026-09-10",
    probationDays: 60,
    progressPercent: 33,
    riskStatus: "critical",
    riskReason: "Đã qua 23 ngày chỉ đạt 33% tiến độ. 14 ngày chưa có buổi 1-on-1. Gặp bế tắc ở module Docker & ORM.",
    lastCheckinDate: "2026-09-18"
  },
  {
    id: "nh-03",
    name: "Phạm Hải Đăng",
    email: "haidang.pham@techcorp.vn",
    role: "Digital Marketing Specialist",
    department: "Tiếp thị & Truyền thông",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    startDate: "2026-09-20",
    probationDays: 60,
    progressPercent: 45,
    riskStatus: "warning",
    riskReason: "Hơi trễ 2 ngày do chờ cấp quyền tài khoản Agency Google Ads.",
    lastCheckinDate: "2026-09-26"
  },
  {
    id: "nh-04",
    name: "Đỗ Thùy Trang",
    email: "thuytrang.do@techcorp.vn",
    role: "Sales B2B Executive",
    department: "Kinh doanh & Bán hàng",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    startDate: "2026-09-01",
    probationDays: 60,
    progressPercent: 92,
    riskStatus: "normal",
    riskReason: "Xuất sắc vượt tiến độ, đã demo thành công 2 khách hàng doanh nghiệp.",
    lastCheckinDate: "2026-09-30"
  }
];

// 1. Quản lý Đọc/Ghi LocalStorage
function getMenteesData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MENTEES));
    return JSON.parse(JSON.stringify(INITIAL_MENTEES));
  }
  return JSON.parse(raw);
}

function saveMenteesData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  updateStats();
}

// 2. Cập nhật các chỉ số thống kê & Banner cảnh báo
function updateStats() {
  const mentees = getMenteesData();
  const total = mentees.length;
  const normalCount = mentees.filter(m => m.riskStatus === 'normal').length;
  const riskCount = mentees.filter(m => m.riskStatus !== 'normal').length;

  const totalProgress = mentees.reduce((acc, m) => acc + (m.progressPercent || 0), 0);
  const avgProgress = total > 0 ? Math.round(totalProgress / total) : 0;

  document.getElementById("stat-total").textContent = total;
  document.getElementById("stat-normal").textContent = normalCount;
  document.getElementById("stat-risk").textContent = riskCount;
  document.getElementById("stat-avg-progress").textContent = `${avgProgress}%`;

  // Kiểm tra Mentee có nguy cơ cao nhất để đưa lên Banner cảnh báo
  const criticalMentee = mentees.find(m => m.riskStatus === 'critical');
  const banner = document.getElementById("risk-alert-banner");
  if (criticalMentee) {
    banner.style.display = "block";
    document.getElementById("risk-alert-desc").textContent = 
      `${criticalMentee.name} (${criticalMentee.role}): ${criticalMentee.riskReason}`;
  } else {
    banner.style.display = "none";
  }
}

// 3. Render danh sách Mentee với tìm kiếm & lọc
function renderMentees() {
  const mentees = getMenteesData();
  const riskFilter = document.getElementById("filter-risk").value;
  const deptFilter = document.getElementById("filter-dept").value;
  const search = document.getElementById("search-input").value.toLowerCase().trim();

  let filtered = mentees;

  if (riskFilter !== 'all') {
    filtered = filtered.filter(m => m.riskStatus === riskFilter);
  }
  if (deptFilter !== 'all') {
    filtered = filtered.filter(m => m.department === deptFilter);
  }
  if (search) {
    filtered = filtered.filter(m => 
      m.name.toLowerCase().includes(search) || 
      m.email.toLowerCase().includes(search) ||
      m.role.toLowerCase().includes(search)
    );
  }

  const tbody = document.getElementById("mentees-tbody");

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:2.5rem; color:#94a3b8;">
          🔍 Không tìm thấy nhân sự phù hợp với bộ lọc
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(m => {
    let badgeHtml = `<span class="badge badge-success">✓ Đúng hạn</span>`;
    let fillCol = "var(--success)";
    if (m.riskStatus === 'warning') {
      badgeHtml = `<span class="badge badge-warning">⏳ Cần lưu ý</span>`;
      fillCol = "var(--warning)";
    } else if (m.riskStatus === 'critical') {
      badgeHtml = `<span class="badge badge-danger">⚠️ Nguy cơ chậm</span>`;
      fillCol = "var(--danger)";
    }

    return `
      <tr>
        <td>
          <div class="user-cell">
            <img src="${m.avatar}" alt="${m.name}" />
            <div>
              <div style="font-weight:700;">${m.name}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${m.email}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight:600; font-size:0.85rem;">${m.role}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${m.department}</div>
        </td>
        <td style="width:160px;">
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:3px;">
            <span style="font-weight:700;">${m.progressPercent}%</span>
            <span style="color:var(--text-muted);">60 ngày</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-fill" style="width:${m.progressPercent}%; background:${fillCol};"></div>
          </div>
        </td>
        <td>${m.startDate}</td>
        <td><strong>${m.lastCheckinDate}</strong></td>
        <td>${badgeHtml}</td>
        <td style="text-align:right;">
          <div style="display:flex; gap:0.4rem; justify-content:flex-end;">
            <button class="btn btn-outline btn-sm" onclick="showMenteeDetail('${m.id}')">Hồ sơ</button>
            <button class="btn btn-outline btn-sm" style="color:var(--danger);" onclick="deleteMentee('${m.id}')" title="Xóa">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// 4. Modal xem chi tiết hồ sơ & Phân tích nguyên nhân rủi ro
function showMenteeDetail(menteeId) {
  const mentees = getMenteesData();
  const m = mentees.find(item => item.id === menteeId);
  if (!m) return;

  document.getElementById("modal-mentee-title").textContent = `Hồ sơ: ${m.name}`;
  document.getElementById("modal-mentee-content").innerHTML = `
    <div style="display:flex; gap:1rem; align-items:center; margin-bottom:1.25rem;">
      <img src="${m.avatar}" style="width:64px; height:64px; border-radius:50%; object-fit:cover; border:2px solid var(--primary);" />
      <div>
        <div style="font-size:1.15rem; font-weight:700;">${m.name}</div>
        <div style="font-size:0.85rem; color:var(--text-muted);">${m.role} • ${m.department}</div>
        <div style="font-size:0.8rem; color:var(--primary);">${m.email}</div>
      </div>
    </div>
    
    <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1rem; margin-bottom:1rem; font-size:0.85rem; display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
      <div><strong>Ngày nhận việc:</strong> ${m.startDate}</div>
      <div><strong>Thời gian thử việc:</strong> ${m.probationDays} ngày</div>
      <div><strong>Tiến độ hoàn thành:</strong> ${m.progressPercent}%</div>
      <div><strong>Check-in gần nhất:</strong> ${m.lastCheckinDate}</div>
    </div>

    <div class="form-group">
      <label class="form-label">🔍 Phân tích nguyên nhân rủi ro & Trở ngại hòa nhập:</label>
      <div style="background:#fff; border:1px dashed var(--border-color); padding:0.85rem; border-radius:var(--radius-md); font-size:0.85rem; color:#475569; line-height:1.5;">
        ${m.riskReason}
      </div>
    </div>
  `;

  openModal('mentee-modal');
}

// 5. Thêm Mentee mới (CRUD)
function openAddMenteeModal() {
  document.getElementById("add-mentee-form").reset();
  document.getElementById("m-date").value = new Date().toISOString().split("T")[0];
  openModal('add-mentee-modal');
}

function handleAddMentee(e) {
  e.preventDefault();
  const name = document.getElementById("m-name").value.trim();
  const email = document.getElementById("m-email").value.trim();
  const role = document.getElementById("m-role").value.trim();
  const dept = document.getElementById("m-dept").value;
  const startDate = document.getElementById("m-date").value;
  const progressPercent = parseInt(document.getElementById("m-progress").value, 10);
  const reason = document.getElementById("m-reason").value.trim();

  let riskStatus = "normal";
  if (progressPercent < 40) riskStatus = "critical";
  else if (progressPercent < 60) riskStatus = "warning";

  const newMentee = {
    id: "nh-" + Date.now().toString(36),
    name,
    email,
    role,
    department: dept,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    startDate,
    probationDays: 60,
    progressPercent,
    riskStatus,
    riskReason: reason || "Nhân sự mới gia nhập, đang thực hiện lộ trình.",
    lastCheckinDate: "Chưa gặp"
  };

  const mentees = getMenteesData();
  mentees.unshift(newMentee);
  saveMenteesData(mentees);

  closeModal('add-mentee-modal');
  showToast(`Đã tiếp nhận mentee mới: ${name}!`);
  renderMentees();
}

// 6. Xóa Mentee (CRUD)
function deleteMentee(id) {
  if (confirm("Bạn có chắc chắn muốn xóa nhân sự này khỏi danh sách quản lý?")) {
    let mentees = getMenteesData();
    mentees = mentees.filter(m => m.id !== id);
    saveMenteesData(mentees);
    showToast("Đã xóa nhân sự khỏi danh sách!");
    renderMentees();
  }
}

// 7. Các hàm tiện ích Modal, Toast & Khôi phục dữ liệu
function openModal(id) { document.getElementById(id).classList.add("active"); }
function closeModal(id) { document.getElementById(id).classList.remove("active"); }

function showToast(msg) {
  const box = document.getElementById("toast-box");
  document.getElementById("toast-text").textContent = msg;
  box.classList.add("show");
  setTimeout(() => box.classList.remove("show"), 3500);
}

function showInterventionPlan() {
  alert("Kế hoạch can thiệp được AI đề xuất:\n1. Lên lịch buổi gặp 1-on-1 trong vòng 48h tới.\n2. Cặp đôi lập trình (Pair-programming) 1 buổi với Senior.\n3. Gia hạn mốc nộp bài tập database thêm 3 ngày.");
}

function alertScheduleCheckin() {
  closeModal('mentee-modal');
  showToast("Đã gửi thông báo hẹn lịch 1-on-1 tới Mentee!");
}

function resetDefaultData() {
  if (confirm("Khôi phục danh sách Mentee ban đầu?")) {
    localStorage.removeItem(STORAGE_KEY);
    getMenteesData();
    showToast("Đã nạp lại cơ sở dữ liệu mẫu!");
    updateStats();
    renderMentees();
  }
}

function exportDataJSON() {
  const mentees = getMenteesData();
  const blob = new Blob([JSON.stringify(mentees, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `mentees_list_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  showToast("Đã xuất file sao lưu JSON!");
}

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", () => {
  getMenteesData();
  updateStats();
  renderMentees();
});
