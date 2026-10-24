// A placeholder image per town (gamitin mo muna, papalitan mo later)
const townImages = {
    "Coron": "images/coron.jpeg",
    "Cuyo": "images/cuyo.jpg",
    "El Nido": "images/elnidoarc.jpg",
    "Taytay": "images/taytay.jpg",
    "San Vicente": "images/sanvic.jpg",
    "Roxas": "images/roxas.webp",
    "Puerto Princesa": "images/puerto.webp",
    "Aborlan": "images/aborlan.jpg",
    "Narra": "images/narra.jpg",
    "Culion": "images/culion.jpg",
    "Cagayancillo": "images/cagayancillo.jpg",
    "Balabac": "images/balabac.jpg"
};

// Ang town na kasalukuyang bukas (null = lahat nakatago)
let openTown = null;

// Ginagawang safe ang text galing Firestore para hindi masira ang HTML
// kapag may quote (") o < > sa pangalan/description.
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Kinukuha ang mga na-approve na destinations mula Firestore
// (isinumite ng staff, in-approve ng admin). Kung wala pang Firebase
// na naka-load, basta ibalik na lang ang blankong listahan.
async function getApprovedDestinations() {
    if (!window.firebaseDb) return [];

    try {
        const snapshot = await window.firestoreGetDocs(
            window.firestoreCollection(window.firebaseDb, "destinations")
        );

        const approved = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            approved.push({
                name: data.name,
                town: data.town,
                image: data.image || "",
                description: data.description || "",
                distanceKm: data.distanceKm || null
            });
        });
        return approved;

    } catch (error) {
        console.error("Error loading approved destinations:", error);
        return [];
    }
}

// Mga destination id na na-favorite na ng kasalukuyang naka-login na user
let favoriteIds = new Set();

// Kinukuha ang listahan ng favorites ng user mula Firestore
// (users/{uid}/favorites). Kung walang naka-login, blankong Set lang.
async function loadFavoriteIds() {
    if (!window.firebaseDb || !window.currentUserUid) return new Set();

    try {
        const snapshot = await window.firestoreGetDocs(
            window.firestoreCollection(window.firebaseDb, "users", window.currentUserUid, "favorites")
        );
        const ids = new Set();
        snapshot.forEach((docSnap) => ids.add(docSnap.id));
        return ids;

    } catch (error) {
        console.error("Error loading favorites:", error);
        return new Set();
    }
}

async function renderDestinations() {
    const grid = document.getElementById("destinationsGrid");
    if (!grid) return;

    // May Favorites section lang sa tourist dashboard (may #favoritesGrid).
    // Dito lang tayo magpapakita ng ♡ button sa bawat destination card.
    const hasFavoritesUI = !!document.getElementById("favoritesGrid");
    if (hasFavoritesUI) {
        favoriteIds = await loadFavoriteIds();
    }

    // Kunin ang mga destinations mula sa Firestore (kung meron),
    // tapos pagsamahin sa static na listahan mula destinations.js
    const approvedDestinations = await getApprovedDestinations();
    // Pinagsasama ang static list (destinations.js) at Firestore. Kapag pareho
    // ang town + pangalan, ang Firestore ang nananaig (para sa mga na-edit ng
    // admin) at walang lumalabas na doble.
    const merged = new Map();
    [
        ...(typeof destinations !== "undefined" ? destinations : []),
        ...approvedDestinations
    ].forEach((dest) => {
        const key = slugify(`${dest.town}-${dest.name}`);
        const prev = merged.get(key) || {};
        merged.set(key, {
            ...prev,
            ...dest,
            image: dest.image || prev.image || "images/placeholder.jpg",
            description: dest.description || prev.description || ""
        });
    });
    const allDestinations = Array.from(merged.values());

    // Group destinations by town
    const grouped = {};
    allDestinations.forEach(dest => {
        if (!grouped[dest.town]) {
            grouped[dest.town] = [];
        }
        grouped[dest.town].push(dest);
    });

    let html = `<div class="town-grid">`;

    // 1. Town cards (clickable)
    for (const town in grouped) {
        const townImage = townImages[town] || "images/placeholder.jpg";
        html += `
            <div class="town-card" data-town="${escapeHtml(town)}">
                <img src="${escapeHtml(townImage)}" alt="${escapeHtml(town)}">
                <div class="town-overlay">
                    <h3>${escapeHtml(town)}</h3>
                </div>
            </div>
        `;
    }

    html += `</div>`;

    // 2. Hidden destination lists per town (lalabas lang pag na-click yung town)
    for (const town in grouped) {
        html += `<div class="destination-grid town-destinations" id="town-${slugify(town)}" hidden>`;

        grouped[town].forEach(dest => {
            const distanceLine = dest.distanceKm
                ? `<p class="location-label">~${escapeHtml(dest.distanceKm)} km mula Puerto Princesa City</p>`
                : "";

            const destId = slugify(`${town}-${dest.name}`);
            const isFav = favoriteIds.has(destId);
            const favButton = hasFavoritesUI
                ? `<button type="button"
                        class="fav-btn${isFav ? " active" : ""}"
                        data-dest-id="${destId}"
                        data-name="${escapeHtml(dest.name)}"
                        data-town="${escapeHtml(town)}"
                        data-image="${escapeHtml(dest.image)}"
                        aria-label="${isFav ? "Remove from favorites" : "Add to favorites"}">${isFav ? "♥" : "♡"}</button>`
                : "";

            html += `
                <article class="destination-card">
                    ${favButton}
                    <img src="${escapeHtml(dest.image)}" alt="${escapeHtml(dest.name)}">
                    <div class="destination-info">
                        <p class="location-label">${escapeHtml(town.toUpperCase())}</p>
                        <h3>${escapeHtml(dest.name)}</h3>
                        ${dest.description ? `<p>${escapeHtml(dest.description)}</p>` : ""}
                        ${distanceLine}
                    </div>
                </article>
            `;
        });

        html += `</div>`;
    }

    grid.innerHTML = html;

    // 3. I-attach ang click event sa bawat town card
    document.querySelectorAll(".town-card").forEach(card => {
        card.addEventListener("click", () => {
            toggleTown(card.getAttribute("data-town"));
        });
    });

    // 4. I-attach ang click event sa bawat ♡ button (kung meron)
    if (hasFavoritesUI) {
        document.querySelectorAll("#destinationsGrid .fav-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                toggleFavorite(btn);
            });
        });

        renderFavorites();
    }

    // 5. Ibalik ang bukas na town (kung na-re-render ang grid, hal. pagka-login)
    applyOpenTown(false);

    // 6. Review form (listahan ng destinations) at listahan ng reviews ng user
    if (document.getElementById("reviewForm")) {
        populateReviewForm(allDestinations);
        renderReviews();
    }
}

// Idinadagdag o tinatanggal ang isang destination sa Favorites ng user
async function toggleFavorite(btn) {
    if (!window.firebaseDb || !window.currentUserUid) return;

    const destId = btn.getAttribute("data-dest-id");
    const isActive = btn.classList.contains("active");

    try {
        const favRef = window.firestoreDoc(window.firebaseDb, "users", window.currentUserUid, "favorites", destId);

        if (isActive) {
            await window.firestoreDeleteDoc(favRef);
            favoriteIds.delete(destId);
            btn.classList.remove("active");
            btn.textContent = "♡";
            btn.setAttribute("aria-label", "Add to favorites");

        } else {
            await window.firestoreSetDoc(favRef, {
                name: btn.getAttribute("data-name"),
                town: btn.getAttribute("data-town"),
                image: btn.getAttribute("data-image"),
                addedAt: window.firestoreServerTimestamp()
            });
            favoriteIds.add(destId);
            btn.classList.add("active");
            btn.textContent = "♥";
            btn.setAttribute("aria-label", "Remove from favorites");
        }

        renderFavorites();

    } catch (error) {
        console.error("Error updating favorite:", error);
    }
}

// Ipinapakita ang lahat ng na-favorite na destinations sa "My Favorites" section
async function renderFavorites() {
    const grid = document.getElementById("favoritesGrid");
    if (!grid || !window.firebaseDb || !window.currentUserUid) return;

    try {
        const snapshot = await window.firestoreGetDocs(
            window.firestoreCollection(window.firebaseDb, "users", window.currentUserUid, "favorites")
        );

        if (snapshot.empty) {
            grid.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">♡</span>
                    <h3>Your favorite places will appear here.</h3>
                    <p>Save destinations you would love to visit.</p>
                </div>
            `;
            return;
        }

        let html = "";
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            html += `
                <article class="destination-card">
                    <button type="button"
                        class="fav-btn active"
                        data-dest-id="${escapeHtml(docSnap.id)}"
                        aria-label="Remove from favorites">♥</button>
                    <img src="${escapeHtml(data.image)}" alt="${escapeHtml(data.name)}">
                    <div class="destination-info">
                        <p class="location-label">${escapeHtml((data.town || "").toUpperCase())}</p>
                        <h3>${escapeHtml(data.name)}</h3>
                    </div>
                </article>
            `;
        });

        grid.innerHTML = html;

        document.querySelectorAll("#favoritesGrid .fav-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const destId = btn.getAttribute("data-dest-id");

                try {
                    await window.firestoreDeleteDoc(
                        window.firestoreDoc(window.firebaseDb, "users", window.currentUserUid, "favorites", destId)
                    );
                    favoriteIds.delete(destId);

                    // I-update din ang puso sa Destinations tab kung nakikita roon
                    document.querySelectorAll(`.fav-btn[data-dest-id="${destId}"]`).forEach((otherBtn) => {
                        if (otherBtn.closest("#favoritesGrid")) return;
                        otherBtn.classList.remove("active");
                        otherBtn.textContent = "♡";
                        otherBtn.setAttribute("aria-label", "Add to favorites");
                    });

                    renderFavorites();

                } catch (error) {
                    console.error("Error removing favorite:", error);
                }
            });
        });

    } catch (error) {
        console.error("Error loading favorites:", error);
    }
}

// Binubuksan ang town kapag na-click; isinasara kung iyon na ang bukas.
// Isang town lang ang bukas sa isang pagkakataon.
function toggleTown(town) {
    openTown = (openTown === town) ? null : town;
    applyOpenTown(true);
}

// Ina-apply ang kasalukuyang `openTown` sa screen:
// - ipinapakita lang ang destinations ng bukas na town
// - nilalagyan ng "selected" ang town card na bukas
function applyOpenTown(scroll) {
    const targetId = openTown ? "town-" + slugify(openTown) : null;

    document.querySelectorAll(".town-destinations").forEach(list => {
        list.hidden = list.id !== targetId;
    });

    document.querySelectorAll(".town-card").forEach(card => {
        card.classList.toggle("selected", card.getAttribute("data-town") === openTown);
    });

    if (scroll && targetId) {
        const list = document.getElementById(targetId);
        if (list) list.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function slugify(text) {
    return String(text).toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

// Kung naka-load na ang Firebase bago pa man mag-DOMContentLoaded, okay lang —
// mapapansin na lang ng renderDestinations gamit ang window.firebaseDb check.
// Kung hindi pa, maghihintay tayo ng "firebase-ready" event (max isang beses).
let hasRendered = false;

function renderOnce() {
    if (hasRendered) return;
    hasRendered = true;
    renderDestinations();
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.firebaseDb) {
        renderOnce();
    } else {
        window.addEventListener("firebase-ready", renderOnce, { once: true });
        // Fallback kung sakaling walang Firebase sa page na ito (hal. admin
        // dashboard bago pa ma-set up), tumakbo pa rin pagkalipas ng ilang segundo
        setTimeout(renderOnce, 1500);
    }
});

// Pag kumpirmado na kung sino ang naka-login (may UID na), i-reload ang
// destinations para tama ang ♡ state at ma-populate ang Favorites section.
// Nananatiling bukas ang town na pinili dahil naka-save sa `openTown`.
window.addEventListener("user-ready", () => {
    renderDestinations();
});

/* ============================================================
   REVIEWS
   Naka-save sa Firestore: users/{uid}/reviews/{destId}
   (isang review per destination; kapag nag-post ulit sa parehong
   destination, napapalitan ang dati niyang review)
   ============================================================ */

// Nilalagay ang lahat ng destinations sa dropdown ng review form
function populateReviewForm(allDestinations) {
    const select = document.getElementById("reviewDestination");
    if (!select) return;

    const previous = select.value;
    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a destination";
    select.appendChild(placeholder);

    allDestinations.forEach((dest) => {
        const option = document.createElement("option");
        option.value = slugify(`${dest.town}-${dest.name}`);
        option.textContent = `${dest.name} (${dest.town})`;
        option.dataset.name = dest.name;
        option.dataset.town = dest.town;
        select.appendChild(option);
    });

    select.value = previous;
}

function setReviewMessage(text, isError) {
    const msg = document.getElementById("reviewMessage");
    if (!msg) return;
    msg.textContent = text;
    msg.classList.toggle("error", !!isError);
}

// Sine-save ang review ng user
async function submitReview(e) {
    e.preventDefault();

    if (!window.firebaseDb || !window.currentUserUid) {
        setReviewMessage("Please wait, your account is still loading.", true);
        return;
    }

    const select = document.getElementById("reviewDestination");
    const comment = document.getElementById("reviewComment").value.trim();
    const checked = document.querySelector('#reviewForm input[name="rating"]:checked');
    const rating = checked ? Number(checked.value) : 0;

    if (!select.value) {
        setReviewMessage("Please choose a destination.", true);
        return;
    }
    if (!rating) {
        setReviewMessage("Please select a star rating.", true);
        return;
    }
    if (!comment) {
        setReviewMessage("Please write your review.", true);
        return;
    }

    const option = select.selectedOptions[0];

    try {
        await window.firestoreSetDoc(
            window.firestoreDoc(window.firebaseDb, "users", window.currentUserUid, "reviews", select.value),
            {
                destName: option.dataset.name,
                town: option.dataset.town,
                rating: rating,
                comment: comment,
                createdAt: window.firestoreServerTimestamp()
            }
        );

        document.getElementById("reviewForm").reset();
        setReviewMessage("Review posted!", false);
        renderReviews();

    } catch (error) {
        console.error("Error saving review:", error);
        setReviewMessage("Something went wrong. Please try again.", true);
    }
}

// Ipinapakita ang mga review ng user sa "My Reviews" section
async function renderReviews() {
    const list = document.getElementById("reviewsList");
    if (!list || !window.firebaseDb || !window.currentUserUid) return;

    try {
        const snapshot = await window.firestoreGetDocs(
            window.firestoreCollection(window.firebaseDb, "users", window.currentUserUid, "reviews")
        );

        if (snapshot.empty) {
            list.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">☆</span>
                    <h3>You haven't posted any reviews yet.</h3>
                    <p>Your destination reviews will appear here.</p>
                </div>
            `;
            return;
        }

        const reviews = [];
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const created = data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : null;
            reviews.push({ id: docSnap.id, created, ...data });
        });

        // Pinakabago muna
        reviews.sort((a, b) => (b.created ? b.created.getTime() : Date.now()) - (a.created ? a.created.getTime() : Date.now()));

        list.innerHTML = reviews.map((r) => {
            const rating = Math.max(0, Math.min(5, Number(r.rating) || 0));
            const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
            const dateText = r.created ? r.created.toLocaleDateString() : "";
            return `
                <article class="review-card">
                    <div class="review-top">
                        <div>
                            <p class="location-label">${escapeHtml((r.town || "").toUpperCase())}</p>
                            <h3>${escapeHtml(r.destName)}</h3>
                        </div>
                        <button type="button" class="review-delete" data-review-id="${escapeHtml(r.id)}">Delete</button>
                    </div>
                    <p class="review-stars" aria-label="${rating} out of 5 stars">${stars}</p>
                    <p class="review-comment">${escapeHtml(r.comment)}</p>
                    ${dateText ? `<p class="review-date">${escapeHtml(dateText)}</p>` : ""}
                </article>
            `;
        }).join("");

        list.querySelectorAll(".review-delete").forEach((btn) => {
            btn.addEventListener("click", async () => {
                if (!confirm("Delete this review?")) return;
                try {
                    await window.firestoreDeleteDoc(
                        window.firestoreDoc(
                            window.firebaseDb, "users", window.currentUserUid,
                            "reviews", btn.getAttribute("data-review-id")
                        )
                    );
                    renderReviews();
                } catch (error) {
                    console.error("Error deleting review:", error);
                }
            });
        });

    } catch (error) {
        console.error("Error loading reviews:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("reviewForm");
    if (form) form.addEventListener("submit", submitReview);
});