// DOM Elements
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
  loadAssignments(); // 🔥 IMPORTANT
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
      } else {
        section.classList.add('hidden');
      }
    });
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
const note = document.getElementById('note').value;

  const user = localStorage.getItem("loggedInUser");

  await fetch("http://localhost:8080/addAssignment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      topic: topic,
      dueDate: dueDate,
      note: note,
      userId: user
    })
  });

  showToast("Assignment added successfully!");
  assignmentForm.reset();
  assignmentModal.classList.remove('active');

  loadAssignments(); // reload from backend
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
      <div class="assignment-card">
        <div class="assignment-header">
          <span class="assignment-topic">${escapeHtml(assignment.topic)}</span>
          <span class="assignment-time ${timeInfo.status}">${timeInfo.text}</span>
        </div>
        <div class="assignment-due">Due: ${formatDate(assignment.dueDate)}</div>
        ${assignment.note ? `<div class="assignment-note">${escapeHtml(assignment.note)}</div>` : ''}
        <button class="delete-btn" data-id="${assignment.id}">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"/>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
          Delete
        </button>
      </div>
    `;
  }).join('');
  updatePendingCount();
}
async function loadAssignments() {
  const user = localStorage.getItem("loggedInUser");

  if (!user) return;

  const res = await fetch(`http://localhost:8080/getAssignments/${user}`);
  const data = await res.json();

  assignments = data;
  renderAssignments();
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

// Save assignments to localStorage
function saveAssignments() {
  localStorage.setItem('assignments', JSON.stringify(assignments));
}

// Update time remaining periodically
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

  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const tabs = document.querySelector(".modal-tabs");

  if (user) {
    hideOverlay();
    const profileBtn = document.getElementById("profileBtn");
    profileBtn.innerHTML = user.charAt(0).toUpperCase();
    registerForm.style.display = "none";
    loginForm.style.display = "none";
    tabs.style.display = "none";

    showLogoutButton(user);

  } else {
    showOverlay();
  }
}
// Initialize app
checkLoginOnLoad();
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

registerFormElement.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  try {
    const response = await fetch("http://localhost:8080/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (response.ok) {
      const result = await response.text();

      if (result.includes("successful")) {
      profileModal.classList.remove("active");
      registerFormElement.reset();
      showToast(`Welcome, ${username}! Registered successfully`);
      } else {
      showToast(result, "error");
}
    }

  } catch (error) {
    console.error(error);
    showToast("Server error!");
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
    } else {
      showToast("Invalid username or password!", "error");
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

  btn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    showToast("Logged out!");

    location.reload(); // refresh app
  });

  modal.appendChild(btn);
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