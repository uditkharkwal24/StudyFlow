// DOM Elements
window.onload = function () {
  const theme = localStorage.getItem("theme");

  if (theme === "dark") {
    document.body.classList.add("dark");
  }
};
const navButtons = document.querySelectorAll('.nav-btn');
const sections = {
  assignments: document.getElementById('assignmentsSection'),
  roadmap: document.getElementById('roadmapSection'),
  practice: document.getElementById('practiceSection')
};

const profileBtn = document.getElementById('profileBtn');
const profileModal = document.getElementById('profileModal');
const closeProfileModal = document.getElementById('closeProfileModal');

const addAssignmentBtn = document.getElementById('addAssignmentBtn');
const assignmentModal = document.getElementById('assignmentModal');
const closeAssignmentModal = document.getElementById('closeAssignmentModal');
const assignmentForm = document.getElementById('assignmentForm');
const assignmentsList = document.getElementById('assignmentsList');
assignmentsList.addEventListener('click', (e) => {
  const deleteBtn = e.target.closest('.delete-btn');

  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.id);
    deleteAssignment(id);
  }
});
function updatePendingCount() {
  const count = assignments.length;
  document.getElementById('pendingCount').textContent =
    `You have ${count} assignment${count !== 1 ? 's' : ''}`;
}
const emptyAssignments = document.getElementById('emptyAssignments');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// State
let assignments = [];

// Initialize
function init() {
  loadAssignments(); 
  setInterval(updateTimeRemaining, 60000);
}

// Navigation
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const sectionName = btn.dataset.section;

    // Update active button
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show/hide sections
    Object.entries(sections).forEach(([name, section]) => {
      if (name === sectionName) {
        section.classList.remove('hidden');

        if (name === "roadmap") {
          // loadRoadmap();
        }

      } else {
        section.classList.add('hidden');
      }
    });

    // ✅ ADD THIS PART (ADMIN PANEL LOAD)
    if (sectionName === "admin") {
      document.getElementById("adminSection").classList.remove("hidden");
      loadTeacherRequests();
    } else {
      document.getElementById("adminSection").classList.add("hidden");
    }

  });
});

// Profile Modal
profileBtn.addEventListener('click', () => {
  profileModal.classList.add('active');
});

closeProfileModal.addEventListener('click', () => {
  profileModal.classList.remove('active');
});

profileModal.addEventListener('click', (e) => {
  if (e.target === profileModal) {
    profileModal.classList.remove('active');
  }
});

// Assignment Modal
addAssignmentBtn.addEventListener('click', () => {
  // Set default date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('dueDate').value = tomorrow.toISOString().slice(0, 16);
  
  assignmentModal.classList.add('active');
});

closeAssignmentModal.addEventListener('click', () => {
  assignmentModal.classList.remove('active');
});

assignmentModal.addEventListener('click', (e) => {
  if (e.target === assignmentModal) {
    assignmentModal.classList.remove('active');
  }
});

assignmentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const topic = document.getElementById('topic').value;
  const dueDate = document.getElementById('dueDate').value;
  const course = document.getElementById("assignCourse").value;
  const section = document.getElementById("assignSection").value;
  const teacher = localStorage.getItem("loggedInUser");
  const file = document.getElementById("assignmentFile").files[0];

  if (!file) {
    showToast("Please upload a PDF", "error");
    return;
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("topic", topic);
  formData.append("dueDate", dueDate);
  formData.append("course", course);
  formData.append("section", section);
  formData.append("createdBy", teacher);

  try {
    const res = await fetch("http://localhost:8080/uploadAssignment", {
      method: "POST",
      body: formData
    });

    const msg = await res.text();

    showToast(msg);
    assignmentForm.reset();
    assignmentModal.classList.remove('active');

    loadAssignments();

  } catch (err) {
    showToast("Upload failed", "error");
  }
});

// Render Assignments
function renderAssignments() {
  if (assignments.length === 0) {
    assignmentsList.innerHTML = '';
    emptyAssignments.style.display = 'block';
    return;
  }

  emptyAssignments.style.display = 'none';

  assignmentsList.innerHTML = assignments.map(assignment => {
    const timeInfo = getTimeRemaining(assignment.dueDate);

    return `
      <div class="assignment-card" style="
        background: linear-gradient(145deg, #1e293b, #0f172a);
        padding:18px;
        margin-bottom:20px;
        border-radius:14px;
        border:1px solid rgba(255,255,255,0.06);
        box-shadow:0 6px 25px rgba(0,0,0,0.35);
      ">

        <!-- HEADER -->
        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-bottom:10px;
        ">
          <span style="
            font-size:18px;
            font-weight:600;
            color:#f8fafc;
          ">
            ${assignment.topic}
          </span>

          <span style="
            background:#facc15;
            color:#1e293b;
            padding:5px 10px;
            border-radius:20px;
            font-size:12px;
            font-weight:500;
          ">
            ${timeInfo.text}
          </span>
        </div>

        <!-- DUE -->
        <div style="
          color:#94a3b8;
          font-size:13px;
          margin-bottom:12px;
        ">
          Due: ${formatDate(assignment.dueDate)}
        </div>

        ${assignment.note ? `
          <div style="margin-bottom:10px; color:#cbd5f5;">
            ${escapeHtml(assignment.note)}
          </div>
        ` : ""}

        <!-- BUTTON GROUP -->
        <div style="
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top:10px;
        ">

          ${assignment.filePath ? `
            <a href="http://localhost:8080/${assignment.filePath}" target="_blank" style="
              padding:6px 12px;
              background:#6366f1;
              color:white;
              border-radius:6px;
              text-decoration:none;
              font-size:13px;
            ">
              View 📄
            </a>
          ` : ""}

          ${localStorage.getItem("userRole") === "student" ? `
            <div id="submission-area-${assignment.id}">
              <p style="font-size:12px; color:#94a3b8;">Checking submission...</p>
            </div>
          ` : ""}

          ${localStorage.getItem("userRole") === "teacher" ? `
            <button class="delete-btn" data-id="${assignment.id}" style="
              background:#ef4444;
              color:white;
              border:none;
              padding:6px 12px;
              border-radius:6px;
              cursor:pointer;
              font-size:13px;
            ">
              Delete
            </button>

            <button onclick="viewSubmissions(${assignment.id})" style="
              background:#3b82f6;
              color:white;
              border:none;
              padding:6px 12px;
              border-radius:6px;
              cursor:pointer;
              font-size:13px;
            ">
              Submissions 📥
            </button>
          ` : ""}

        </div>

      </div>
    `;
  }).join('');

  setTimeout(() => {
    assignments.forEach(a => {
      if (localStorage.getItem("userRole") === "student") {
        checkSubmissionStatus(a.id);
      }
    });
  }, 0);
}
async function loadAssignments() {
  const user = localStorage.getItem("loggedInUser");

  if (!user) return;

  try {
    const res = await fetch(
      `http://localhost:8080/getAssignmentsForUser?username=${encodeURIComponent(user)}`
    );

    const data = await res.json();

    assignments = data;
    renderAssignments();

  } catch (err) {
    console.error("Error loading assignments", err);
  }
}

// Calculate time remaining
function getTimeRemaining(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  
  if (diff < 0) {
    return { text: 'Overdue', status: 'overdue' };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return { 
      text: `${days} day${days > 1 ? 's' : ''} left`, 
      status: days <= 2 ? 'urgent' : 'safe' 
    };
  } else if (hours > 0) {
    return { 
      text: `${hours} hour${hours > 1 ? 's' : ''} left`, 
      status: 'urgent' 
    };
  } else {
    return { 
      text: `${minutes} min left`, 
      status: 'urgent' 
    };
  }
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Delete assignment
async function deleteAssignment(id) {
  await fetch(`http://localhost:8080/deleteAssignment/${id}`, {
    method: "DELETE"
  });

  showToast('Assignment deleted');
  loadAssignments(); // reload from backend
}
function updateTimeRemaining() {
  renderAssignments();
}

function showToast(message, type = "success") {
  toastMessage.textContent = message;

  const icon = toast.querySelector("svg");

  if (type === "error") {
    icon.innerHTML = `
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    `;
    icon.style.color = "#ef4444"; // red
  } else {
    icon.innerHTML = `
      <path d="M22 4 12 14.01 9 11.01"></path>
    `;
    icon.style.color = "#10b981"; // green
  }

  toast.classList.add("active");

  setTimeout(() => {
    toast.classList.remove("active");
  }, 3000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
function checkLoginOnLoad() {
  const user = localStorage.getItem("loggedInUser");
  const adminEmail = "uditkharkwal24@gmail.com";

  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const tabs = document.querySelector(".modal-tabs");
  const adminBtn = document.querySelector('[data-section="admin"]');

  if (user) {
    document.getElementById("registerForm").style.display = "none";
document.getElementById("loginForm").style.display = "none";
document.querySelector(".modal-tabs").style.display = "none";
document.getElementById("logoutSection").style.display = "block";
    hideOverlay();

    const profileBtn = document.getElementById("profileBtn");
    const username = localStorage.getItem("loggedInUser");
profileBtn.innerHTML = username.charAt(0).toUpperCase();

    registerForm.style.display = "none";
    loginForm.style.display = "none";
    tabs.style.display = "none";

    // ✅ ADMIN VISIBILITY CONTROL
    if (adminBtn) {
      if (user === adminEmail) {
        adminBtn.style.display = "flex";
      } else {
        adminBtn.style.display = "none";
      }
    }

    
const addBtn = document.getElementById("addAssignmentBtn");

fetch(`http://localhost:8080/getUser/${user}`)
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("userRole", data.role); 
    if (data.role !== "teacher") {
      addBtn.style.display = "none";
    } else {
      addBtn.style.display = "block";
    }
    const roadmapBtn = document.getElementById("navRoadmap");
const practiceBtn = document.getElementById("navPractice");

const adminBtn = document.querySelector('[data-section="admin"]');

if (data.role === "teacher") {
  if (roadmapBtn) roadmapBtn.style.display = "none";
  if (practiceBtn) practiceBtn.style.display = "none";
}

// ✅ ADMIN ONLY (your email)
if (data.username === "uditkharkwal24@gmail.com") {
  if (adminBtn) adminBtn.style.display = "flex";
} else {
  if (adminBtn) adminBtn.style.display = "none";
}
const roadmapSection = document.getElementById("roadmapSection");
const practiceSection = document.getElementById("practiceSection");

if (data.role === "teacher") {
  if (roadmapSection) roadmapSection.style.display = "none";
  if (practiceSection) practiceSection.style.display = "none";
}
  });
  } else {
    document.getElementById("logoutSection").style.display = "none";
    showOverlay();

    // ❗ hide admin if not logged in
    if (adminBtn) {
      adminBtn.style.display = "none";
    }
  }
}
// Initialize app
checkLoginOnLoad();
checkProfileCompletion();
init();
// Tab switching
const registerTab = document.getElementById("registerTab");
const loginTab = document.getElementById("loginTab");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

registerTab.addEventListener("click", () => {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");

  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

loginTab.addEventListener("click", () => {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");

  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});
// Register form submit
const registerFormElement = document.getElementById("registerForm");

document.addEventListener("submit", async function (e) {

  if (e.target.id === "registerForm") {
    e.preventDefault();

    const username = document.getElementById("regUsername").value;
    const password = document.getElementById("regPassword").value;
    const role = selectedRole;

    try {
      const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password,
          role
        })
      });

      const result = await res.text();

// ✅ HANDLE DUPLICATE USERNAME
if (result === "Username already exists") {
  showToast("⚠️ Username already taken", "error");
  return;
}

alert(result);

      // auto login after student register
      if (role === "student") {
        localStorage.setItem("loggedInUser", username);
        location.reload();
      }

    } catch (err) {
      alert("Registration failed");
    }
  }
});
// Login form submit
const loginFormElement = document.getElementById("loginForm");

loginFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const result = await response.text();
if (result.toLowerCase().includes("success")) {

  localStorage.setItem("loggedInUser", username);
  loginFormElement.reset();

  showToast(`Welcome back, ${username}!`);
  profileModal.classList.remove("active");
  checkLoginOnLoad();
  loadAssignments();
  checkProfileCompletion();

} 
else if (result.toLowerCase().includes("not approved")) {

  showToast("⏳ Your teacher account is pending approval", "error");

} 
else {

  showToast(result, "error");
}

  } catch (error) {
    console.error(error);
    showToast("Server error!");
  }
});
function showLogoutButton(username) {
  const modal = document.querySelector(".modal");

  // Remove old logout if exists
  const oldBtn = document.getElementById("logoutBtn");
  if (oldBtn) oldBtn.remove();

  const btn = document.createElement("button");
  btn.id = "logoutBtn";
  btn.className = "submit-btn";
  btn.textContent = `Logout (${username})`;
  btn.style.position = "fixed";
btn.style.bottom = "80px";
btn.style.right = "20px";
btn.style.zIndex = "999";

  btn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    showToast("Logged out!");

    location.reload(); // refresh app
  });

  document.body.appendChild(btn);
}
function showOverlay() {
  document.getElementById("loginOverlay").classList.remove("hidden");
}

function hideOverlay() {
  document.getElementById("loginOverlay").classList.add("hidden");
}

function openProfileModal() {
  profileModal.classList.add("active");
}
async function loadRoadmap() {
  const container = document.getElementById("roadmapContent");
  // ✅ check if roadmap already saved
const saved = localStorage.getItem("roadmap");

if (saved) {
  container.innerHTML = saved;
  return;
}
// ✅ prevent multiple API calls
if (container.dataset.loaded === "true") return;
container.dataset.loaded = "true";

  container.innerHTML = "<p>Loading roadmap...</p>";

  try {
    const res = await fetch("http://localhost:8080/getRoadmap");
    let data = await res.text();

    // Split by year sections (clean now)
    const sections = data.split(/\n(?=\d+(?:st|nd|rd|th)\s+Year:)/);

    let formatted = "";

    sections.forEach(section => {
      const lines = section
        .split("\n")
        .map(l => l.trim())
        .filter(l => l !== "");

      if (lines.length === 0) return;

      const title = lines[0];
      const points = lines.slice(1);

      formatted += `
        <div style="
          background: white;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        ">
          <h3 style="color:#6366f1; margin-bottom:10px;">
            ${title}
          </h3>
          <ul style="padding-left:20px;">
            ${points.map(p => `<li>${p.replace("-", "").trim()}</li>`).join("")}
          </ul>
        </div>
      `;
    });

    container.innerHTML = formatted;
    // ✅ save roadmap for future use
// ✅ only save if valid roadmap
if (!data.includes("error") && formatted.trim() !== "") {
  localStorage.setItem("roadmap", formatted);
}

  } catch (err) {
  container.innerHTML = `
    <p style="color:red;">
      Roadmap unavailable (API limit reached). Try again later.
    </p>
  `;
}
}
function toggleDarkMode(event) {
  const circle = document.createElement("div");

  const x = event.clientX;
  const y = event.clientY;

  // Calculate max distance to screen corners
  const maxX = Math.max(x, window.innerWidth - x);
  const maxY = Math.max(y, window.innerHeight - y);
  const radius = Math.sqrt(maxX * maxX + maxY * maxY);

  circle.style.position = "fixed";
  circle.style.borderRadius = "50%";
  circle.style.background = document.body.classList.contains("dark")
    ? "#ffffff"
    : "#0f172a";
  circle.style.width = "20px";
  circle.style.height = "20px";
  circle.style.left = x + "px";
  circle.style.top = y + "px";
  circle.style.transform = "scale(0)";
  circle.style.transition = "transform 0.6s ease-out";
  circle.style.zIndex = "9999";
  circle.style.pointerEvents = "none";

  document.body.appendChild(circle);

  // Scale based on screen size
  setTimeout(() => {
    circle.style.transform = `scale(${radius / 10})`;
  }, 10);

  // Toggle theme
  setTimeout(() => {
    const isDark = document.body.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    const btn = document.querySelector(".theme-btn");
    btn.textContent = isDark ? "☀️" : "🌙";
  }, 200);

  // Remove ripple
  setTimeout(() => {
    circle.remove();
  }, 700);
}
// 🌐 Google Login Setup
window.onload = function () {
  const theme = localStorage.getItem("theme");

  if (theme === "dark") {
    document.body.classList.add("dark");
  }

  google.accounts.id.initialize({
    client_id: "223647633006-8c0v0bge3ncmhkur4cr830j8crd4abl3.apps.googleusercontent.com",
    callback: handleGoogleLogin
  });

  google.accounts.id.renderButton(
    document.getElementById("googleSignInDiv"),
    {
      theme: "outline",
      size: "large",
      width: "100%"
    }
  );
  // ✅ Google button for Register section
google.accounts.id.renderButton(
  document.getElementById("googleRegisterDiv"),
  {
    theme: "outline",
    size: "large",
    width: "100%"
  }
);
};

async function handleGoogleLogin(response) {
  const data = parseJwt(response.credential);

  const user = {
    username: data.email,   // use email as unique id
    password: "google_user" // dummy password
  };

  try {
    const res = await fetch("http://localhost:8080/google-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    });

    const result = await res.text();

    localStorage.setItem("loggedInUser", user.username);

    alert("Logged in as " + user.username);
    location.reload();

  } catch (err) {
    alert("Google login failed");
  }
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = atob(base64Url);
  return JSON.parse(base64);
}
let selectedRole = "student";

function selectRole(role) {
  selectedRole = role;

  document.getElementById("roleChoice").style.display = "none";
  document.getElementById("actualRegisterForm").style.display = "block";

  document.getElementById("loginTab").style.display = "none";
  document.getElementById("registerTab").style.display = "none";
}
function goBackRole() {
  // hide form
  document.getElementById("actualRegisterForm").style.display = "none";

  // show role selection
  document.getElementById("roleChoice").style.display = "block";

  // show tabs again
  document.getElementById("loginTab").style.display = "block";
  document.getElementById("registerTab").style.display = "block";

  // reset tab styles (IMPORTANT)
  document.getElementById("registerTab").classList.add("active");
  document.getElementById("loginTab").classList.remove("active");

  // also make sure login form is hidden
  document.getElementById("loginForm").classList.add("hidden");
}
async function loadTeacherRequests() {
  const container = document.getElementById("teacherRequests");

  container.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch("http://localhost:8080/pending-teachers");
    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = "<p>No pending requests</p>";
      return;
    }

    let html = "";

    data.forEach(user => {
      html += `
        <div style="
          background:white;
          padding:10px;
          margin-bottom:10px;
          border-radius:8px;
          box-shadow:0 2px 5px rgba(0,0,0,0.1);
        ">
          <p><strong>${user.username}</strong></p>

          <button onclick="approveTeacher(${user.id})" style="
            padding:6px 10px;
            background:#22c55e;
            color:white;
            border:none;
            border-radius:6px;
            cursor:pointer;
          ">
            Approve
          </button>
        </div>
      `;
    });

    container.innerHTML = html;

  } catch (err) {
    container.innerHTML = "<p>Error loading requests</p>";
  }
}
async function approveTeacher(id) {
  try {
    const res = await fetch(`http://localhost:8080/approve-teacher/${id}`, {
      method: "PUT"
    });

    const msg = await res.text();
    alert(msg);

    // reload list after approval
    loadTeacherRequests();

  } catch (err) {
    alert("Error approving teacher");
  }
}
async function checkProfileCompletion() {
  const user = localStorage.getItem("loggedInUser");

  if (!user) return;

  try {
    const res = await fetch(`http://localhost:8080/getUser/${user}`);
    const data = await res.json();

    // if fullName is missing → profile not completed
    if (!data.fullName || data.fullName === "" || data.fullName === null) {
      document.getElementById("profileSetupModal").classList.add("active");

      // hide student fields if teacher
      if (data.role === "teacher") {
        document.getElementById("studentFields").style.display = "none";
      }
    }

  } catch (err) {
    console.log("Profile check failed");
  }
}
function logout() {
  localStorage.removeItem("loggedInUser");

  showToast("Logged out successfully");

  // reset UI
  location.reload();
}
async function submitProfile() {
  const user = localStorage.getItem("loggedInUser");

  const fullName = document.getElementById("fullName").value;
  const course = document.getElementById("course").value;
  const section = document.getElementById("section").value;
  const rollNumber = document.getElementById("rollNumber")?.value || null;

  try {
    const res = await fetch(`http://localhost:8080/updateProfile/${user}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName,
        course,
        section,
        rollNumber
      })
    });

    const msg = await res.text();
    if (msg.toLowerCase().includes("success")) {
  showToast(msg);
} else {
  showToast(msg, "error");
}

    // ✅ hide popup after saving
    document.getElementById("profileSetupModal").classList.remove("active");

  } catch (err) {
    showToast("Error saving profile", "error");
  }
}
async function submitAssignment(assignmentId) {

  const input = document.querySelector(`input[data-id='${assignmentId}']`);
  const file = input.files[0];
  const username = localStorage.getItem("loggedInUser");

  if (!file) {
    showToast("Please select a file", "error");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("assignmentId", assignmentId);
  formData.append("studentUsername", username);

  try {
    const res = await fetch("http://localhost:8080/submitAssignment", {
      method: "POST",
      body: formData
    });

    const msg = await res.text();
if (msg.toLowerCase().includes("success")) {
  showToast("Submitted successfully");

  // 🔥 REMOVE INPUT + BUTTON AFTER SUBMIT
  const input = document.querySelector(`input[data-id='${assignmentId}']`);
  if (input) {
    const parent = input.parentElement;
    parent.innerHTML = `
      <p style="color:#10b981; font-size:13px;">
        ✅ Submitted
      </p>
    `;
  }
} else {
      showToast(msg, "error");
    }

  } catch (err) {
    showToast("Submission failed", "error");
  }
}
async function viewSubmissions(assignmentId) {

  try {
    const res = await fetch(`http://localhost:8080/getSubmissions/${assignmentId}`);
    const data = await res.json();

    const container = document.getElementById("submissionList");

    if (data.length === 0) {
      container.innerHTML = `
  <div style="
    text-align:center;
    padding:30px;
    color:#94a3b8;
  ">
    <p style="font-size:16px;">No submissions yet 😴</p>
  </div>
`;
    } else {
      container.innerHTML = data.map(sub => `
  <div style="
    background:#1e293b;
    padding:16px;
    margin-top:15px;
    border-radius:12px;
    border:1px solid rgba(255,255,255,0.08);
    box-shadow:0 4px 15px rgba(0,0,0,0.3);
    transition:0.2s;
  ">

    <div style="display:flex; justify-content:space-between; align-items:center;">
      
      <div>
        <p style="
          margin:0;
          font-weight:600;
          font-size:15px;
          color:#f1f5f9;
        ">
          ${sub.studentUsername}
        </p>

        <p style="
          margin:0;
          font-size:12px;
          color:#94a3b8;
        ">
          Submitted ✔
        </p>
      </div>

      <a href="http://localhost:8080/${sub.filePath}" target="_blank" style="
        padding:6px 12px;
        background:#3b82f6;
        color:white;
        border-radius:6px;
        text-decoration:none;
        font-size:13px;
      ">
        Open 📄
      </a>

    </div>

  </div>
`).join("");
    }

    document.getElementById("submissionModal").style.display = "block";

  } catch (err) {
    alert("Error loading submissions");
  }
}
function closeSubmissionModal() {
  document.getElementById("submissionModal").style.display = "none";
}
async function checkSubmissionStatus(assignmentId) {
  const username = localStorage.getItem("loggedInUser");

  const container = document.getElementById(`submission-area-${assignmentId}`);

  try {
    const res = await fetch(
      `http://localhost:8080/hasSubmitted?assignmentId=${assignmentId}&username=${encodeURIComponent(username)}`
    );

    const text = await res.text();   // ✅ FIX
    const submitted = text === "true";  // ✅ FIX

    if (submitted) {
      container.innerHTML = `
        <p style="color:#10b981; font-size:13px;">
          ✅ Submitted
        </p>
      `;
    } else {
      container.innerHTML = `
        <input type="file" data-id="${assignmentId}" accept="application/pdf" style="font-size:12px;">
        <button onclick="submitAssignment(${assignmentId})" style="
          margin-top:5px;
          padding:6px 12px;
          background:#10b981;
          color:white;
          border:none;
          border-radius:6px;
          cursor:pointer;
          font-size:13px;
        ">
          Submit 📤
        </button>
      `;
    }

  } catch (err) {
    container.innerHTML = `<p style="color:red;">Error</p>`;
  }
}