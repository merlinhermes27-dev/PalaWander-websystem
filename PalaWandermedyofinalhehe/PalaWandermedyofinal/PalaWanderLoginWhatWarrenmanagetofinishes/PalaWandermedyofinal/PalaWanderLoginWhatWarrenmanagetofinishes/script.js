const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
 
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
 
const showLogin = document.getElementById("showLogin");
const showRegister = document.getElementById("showRegister");
 
const message = document.getElementById("message");
 
function showForm(formName) {
    const isLogin = formName === "login";
 
    loginForm.hidden = !isLogin;
    registerForm.hidden = isLogin;
 
    loginTab.classList.toggle("active", isLogin);
    registerTab.classList.toggle("active", !isLogin);
 
    message.textContent = "";
    message.className = "message";
}
 
loginTab.addEventListener("click", () => {
    showForm("login");
});
 
registerTab.addEventListener("click", () => {
    showForm("register");
});
 
showLogin.addEventListener("click", () => {
    showForm("login");
});
 
showRegister.addEventListener("click", () => {
    showForm("register");
});
 
function displayMessage(text, type) {
    message.textContent = text;
    message.className = "message " + type;
}
 
// Ipinapadala ang bawat role sa kaukulang dashboard page
const roleRedirects = {
    admin: "admin-dashboard.html",
    staff: "staff-dashboard.html",
    user: "tourist-dashboard.html"
};
 
// --- REGISTER ---
registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();
 
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const role = document.getElementById("registerRole").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
 
    if (password !== confirmPassword) {
        displayMessage("Your passwords do not match. Please try again.", "error");
        return;
    }
 
    try {
        const userCredential = await window.firebaseCreateUser(
            window.firebaseAuth,
            email,
            password
        );
        const user = userCredential.user;
 
        await window.firebaseSetDoc(
            window.firebaseDoc(window.firebaseDb, "users", user.uid),
            {
                fullName: fullName,
                email: email,
                role: role,
                status: role === "staff" ? "pending" : "active",
                createdAt: new Date().toISOString()
            }
        );
 
        displayMessage(
            "Account created! Pumunta na sa iyong dashboard...",
            "success"
        );
 
        setTimeout(() => {
            window.location.href = roleRedirects[role] || "tourist-dashboard.html";
        }, 1200);
 
    } catch (error) {
        displayMessage(firebaseErrorToText(error), "error");
    }
});
 
// --- LOGIN ---
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
 
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
 
    try {
        const userCredential = await window.firebaseSignIn(
            window.firebaseAuth,
            email,
            password
        );
        const user = userCredential.user;
 
        const userDocSnap = await window.firebaseGetDoc(
            window.firebaseDoc(window.firebaseDb, "users", user.uid)
        );
 
        if (!userDocSnap.exists()) {
            displayMessage(
                "Login successful.",
                "success"
            );
            return;
        }
 
        const userData = userDocSnap.data();
        displayMessage("Login successful!", "success");
 
        setTimeout(() => {
            window.location.href = roleRedirects[userData.role] || "tourist-dashboard.html";
        }, 800);
 
    } catch (error) {
        displayMessage(firebaseErrorToText(error), "error");
    }
});
 
function firebaseErrorToText(error) {
    const code = error.code || "";
 
    switch (code) {
        case "auth/email-already-in-use":
            return "Email address is already in use.";
        case "auth/invalid-email":
            return "Invalid email address.";
        case "auth/weak-password":
            return "Password must be at least 6 characters long.";
        case "auth/user-not-found":
        case "auth/invalid-credential":
        case "auth/wrong-password":
            return "Invalid email or password.";
        default:
            return "An error has occured: " + (error.message || code);
    }
}
