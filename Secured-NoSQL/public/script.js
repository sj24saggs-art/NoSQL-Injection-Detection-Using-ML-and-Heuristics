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

  if (!res.ok) {
    const li = document.createElement("li");
    li.textContent = data.msg || "Search blocked.";
    li.style.color = "red";
    resultsList.appendChild(li);
    return;
  }

  if (data.results && data.results.length > 0) {
    data.results.forEach(user => {
      const li = document.createElement("li");
      li.textContent = `Username: ${user.username}, Branch: ${user.branch}, Marks: ${user.marks}`;
      resultsList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No results found";
    resultsList.appendChild(li);
  }
}

async function addUser() {
  const data = collectData();

  const res = await fetch("/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (res.ok) {
    alert("User added");
  } else {
    alert(result.msg || "Add blocked");
  }
}

async function updateUser() {
  const data = collectData();

  const res = await fetch("/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (res.ok) {
    alert("User updated");
  } else {
    alert(result.msg || "Update blocked");
  }
}

async function deleteUser() {
  const username = document.getElementById("uName").value;

  const res = await fetch("/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  });

  const result = await res.json();

  if (res.ok) {
    alert("User deleted");
  } else {
    alert(result.msg || "Delete blocked");
  }
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