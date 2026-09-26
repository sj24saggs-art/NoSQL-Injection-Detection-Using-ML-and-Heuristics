document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = this.username.value;
  const password = this.password.value;

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  const msg = document.getElementById("loginMsg");

  if (data.success) {
    msg.textContent = "";
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("searchSection").style.display = "block";
    document.getElementById("navBar").style.display = "flex";
    document.getElementById("welcomeUser").textContent = `Welcome, ${data.role}`;

    if (data.role === 'admin' || data.role === 'student') {
    document.getElementById("adminPanel").style.display = "block";
    } 
  } else {
    msg.textContent = data.msg;
    msg.style.color = "red";
  }
});

async function performSearch() {
  const query = document.getElementById("searchInput").value;
  const res = await fetch(`/search?query=${encodeURIComponent(query)}`);
  const data = await res.json();

  const resultsList = document.getElementById("results");
  resultsList.innerHTML = "";

  if (data.results && data.results.length > 0) {
    data.results.forEach(user => {
      const li = document.createElement("li");
      li.textContent = `Username: ${user.username}, Branch: ${user.branch}, Marks: ${user.marks}`;
      resultsList.appendChild(li);
    });
  } else {
    resultsList.innerHTML = "<li>No results found</li>";
  }
}

async function addUser() {
  const data = collectData();
  await fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  alert("User added");
}

async function updateUser() {
  const data = collectData();
  await fetch("/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  alert("User updated");
}

async function deleteUser() {
  const username = document.getElementById("uName").value;
  await fetch("/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });
  alert("User deleted");
}

function collectData() {
  return {
    username: document.getElementById("uName").value,
    password: document.getElementById("uPass").value,
    role: document.getElementById("uRole").value,
    branch: document.getElementById("uBranch").value,
    marks: parseInt(document.getElementById("uMarks").value)
  };
}

function logout() {
  location.reload(); // quick reset of frontend UI
}

async function viewAllUsers() {
  const res = await fetch("/all-users");
  const data = await res.json();

  const resultsList = document.getElementById("results");
  resultsList.innerHTML = "";

  if (!res.ok) {
    const li = document.createElement("li");
    li.textContent = data.error || "Access denied";
    li.style.color = "red";
    resultsList.appendChild(li);
    return;
  }

  data.results.forEach(user => {
    const li = document.createElement("li");
    li.textContent =
      `Username: ${user.username}, Branch: ${user.branch}, Marks: ${user.marks}, Role: ${user.role}`;
    resultsList.appendChild(li);
  });
}