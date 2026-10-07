/* =====================================================
   SKYNULYS — APP.JS
   ===================================================== */


/* ---------- USERS ---------- */

function getUsers() {
    return JSON.parse(
        localStorage.getItem("skynulys_users") || "[]"
    );
}

function saveUsers(users) {
    localStorage.setItem(
        "skynulys_users",
        JSON.stringify(users)
    );
}


/* ---------- CURRENT USER ---------- */

function getCurrentUser() {
    return JSON.parse(
        sessionStorage.getItem("skynulys_current_user") || "null"
    );
}

function setCurrentUser(user) {
    sessionStorage.setItem(
        "skynulys_current_user",
        JSON.stringify(user)
    );
}

function logout() {
    sessionStorage.removeItem(
        "skynulys_current_user"
    );

    window.location.href = "login.html";
}


/* ---------- ROLES ---------- */

function isAdmin() {
    const user = getCurrentUser();

    return user && user.role === "admin";
}

function isOrganizer() {
    const user = getCurrentUser();

    return user &&
        (
            user.role === "organizer" ||
            user.role === "admin"
        );
}

function roleName(role) {
    if (role === "admin") {
        return "ADMIN";
    }

    if (role === "organizer") {
        return "ОРГАНІЗАТОР";
    }

    return "УЧАСНИК";
}


/* ---------- CAMPAIGNS ---------- */

function getCampaigns() {
    return JSON.parse(
        localStorage.getItem("skynulys_campaigns") || "[]"
    );
}

function saveCampaigns(campaigns) {
    localStorage.setItem(
        "skynulys_campaigns",
        JSON.stringify(campaigns)
    );
}


/* ---------- DEMO DATA ---------- */

function createDemoData() {

    const users = getUsers();

    if (users.length === 0) {

        saveUsers([
            {
                id: "admin-demo",
                name: "Admin",
                email: "admin@skynulys.local",
                password: "admin123",
                role: "admin"
            },

            {
                id: "organizer-demo",
                name: "Organizer",
                email: "organizer@skynulys.local",
                password: "organizer123",
                role: "organizer"
            },

            {
                id: "participant-demo",
                name: "Participant",
                email: "user@skynulys.local",
                password: "user123",
                role: "participant"
            }
        ]);
    }

    const campaigns = getCampaigns();

    if (campaigns.length === 0) {

        saveCampaigns([
            {
                id: "campaign-1",
                title: "Поїздка класом",
                description:
                    "Збір коштів на спільну поїздку.",
                goal: 15000,
                collected: 8500,
                ownerId: "organizer-demo",
                ownerName: "Organizer",
                createdAt: new Date().toISOString()
            },

            {
                id: "campaign-2",
                title: "Подарунок другу",
                description:
                    "Збираємо гроші на подарунок.",
                goal: 5000,
                collected: 3200,
                ownerId: "organizer-demo",
                ownerName: "Organizer",
                createdAt: new Date().toISOString()
            },

            {
                id: "campaign-3",
                title: "Спільний проєкт",
                description:
                    "Кошти для реалізації нового проєкту.",
                goal: 20000,
                collected: 12400,
                ownerId: "organizer-demo",
                ownerName: "Organizer",
                createdAt: new Date().toISOString()
            }
        ]);
    }
}


/* ---------- AUTH ---------- */

function requireLogin() {

    const user = getCurrentUser();

    if (!user) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}


/* ---------- REGISTER ---------- */

function initRegister() {

    const form =
        document.getElementById("registerForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName")
                .value
                .trim();

        const email =
            document.getElementById("registerEmail")
                .value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById("registerPassword")
                .value;

        const confirmPassword =
            document
                .getElementById("registerPasswordConfirm")
                .value;

        const role =
            document.getElementById("registerRole")
                .value;

        const message =
            document.getElementById("registerMessage");

        if (name.length < 2) {
            showMessage(
                message,
                "Введи ім'я.",
                "error"
            );

            return;
        }

        if (password.length < 6) {
            showMessage(
                message,
                "Пароль повинен мати мінімум 6 символів.",
                "error"
            );

            return;
        }

        if (password !== confirmPassword) {
            showMessage(
                message,
                "Паролі не співпадають.",
                "error"
            );

            return;
        }

        const users = getUsers();

        const exists = users.find(
            user => user.email === email
        );

        if (exists) {
            showMessage(
                message,
                "Такий email вже зареєстрований.",
                "error"
            );

            return;
        }

        const newUser = {
            id:
                "user-" +
                Date.now(),

            name: name,

            email: email,

            password: password,

            role: role
        };

        users.push(newUser);

        saveUsers(users);

        showMessage(
            message,
            "Акаунт створено! Переходимо до входу...",
            "success"
        );

        form.reset();

        setTimeout(function () {
            window.location.href = "login.html";
        }, 1200);
    });
}


/* ---------- LOGIN ---------- */

function initLogin() {

    const form =
        document.getElementById("loginForm");

    if (!form) {
        return;
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail")
                .value
                .trim()
                .toLowerCase();

        const password =
            document.getElementById("loginPassword")
                .value;

        const message =
            document.getElementById("loginMessage");

        const users = getUsers();

        const user = users.find(
            item =>
                item.email === email &&
                item.password === password
        );

        if (!user) {
            showMessage(
                message,
                "Неправильний email або пароль.",
                "error"
            );

            return;
        }

        setCurrentUser(user);

        showMessage(
            message,
            "Успішний вхід!",
            "success"
        );

        setTimeout(function () {
            window.location.href = "index.html";
        }, 500);
    });
}


/* ---------- MESSAGE ---------- */

function showMessage(element, text, type) {

    if (!element) {
        return;
    }

    element.className = type;

    element.textContent = text;
}


/* ---------- SIDEBAR ---------- */

function updateUserInfo() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    document
        .querySelectorAll("[data-user-name]")
        .forEach(function (element) {
            element.textContent = user.name;
        });

    document
        .querySelectorAll("[data-user-role]")
        .forEach(function (element) {
            element.textContent =
                roleName(user.role);
        });
}


function updatePermissions() {

    if (isOrganizer()) {
        return;
    }

    document
        .querySelectorAll('a[href="create.html"]')
        .forEach(function (element) {
            element.style.display = "none";
        });

    document
        .querySelectorAll('a[href="users.html"]')
        .forEach(function (element) {
            element.style.display = "none";
        });
}


/* ---------- LOGOUT ---------- */

function initLogout() {

    document
        .querySelectorAll("[data-logout]")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {
                    logout();
                }
            );
        });
}


/* ---------- CAMPAIGNS PAGE ---------- */

function renderCampaigns(search = "") {

    const container =
        document.getElementById("campaignList");

    if (!container) {
        return;
    }

    const campaigns = getCampaigns();

    const filtered =
        campaigns.filter(function (campaign) {

            return campaign.title
                .toLowerCase()
                .includes(search.toLowerCase());
        });

    container.innerHTML = "";

    if (filtered.length === 0) {

        container.innerHTML = `
            <div class="campaign-card">
                Кампаній не знайдено.
            </div>
        `;

        return;
    }

    filtered.forEach(function (campaign) {

        const percent =
            Math.min(
                100,
                Math.round(
                    campaign.collected /
                    campaign.goal *
                    100
                )
            );

        const card =
            document.createElement("div");

        card.className = "campaign-card";

        card.innerHTML = `
            <h3>
                ${escapeHTML(campaign.title)}
            </h3>

            <p>
                ${escapeHTML(campaign.description)}
            </p>

            <div class="progress">
                <div style="width:${percent}%"></div>
            </div>

            <div class="campaign-money">
                <span>
                    ${campaign.collected} ₴
                </span>

                <span>
                    ${campaign.goal} ₴
                </span>
            </div>

            <button
                class="btn"
                style="width:100%;margin-top:18px"
                onclick="makeContribution('${campaign.id}')"
            >
                Зробити внесок
            </button>
        `;

        container.appendChild(card);
    });
}


/* ---------- CONTRIBUTION ---------- */

function makeContribution(id) {

    const campaigns = getCampaigns();

    const campaign =
        campaigns.find(
            item => item.id === id
        );

    if (!campaign) {
        return;
    }

    const amount =
        Number(
            prompt(
                "Введи суму внеску:"
            )
        );

    if (!amount || amount <= 0) {
        return;
    }

    campaign.collected += amount;

    saveCampaigns(campaigns);

    alert(
        `Внесок ${amount} ₴ додано!`
    );

    renderCampaigns(
        document.getElementById(
            "campaignSearch"
        )?.value || ""
    );
}


/* ---------- CREATE CAMPAIGN ---------- */

function initCreateCampaign() {

    const form =
        document.getElementById(
            "createCampaignForm"
        );

    if (!form) {
        return;
    }

    if (!isOrganizer()) {

        window.location.href =
            "index.html";

        return;
    }

    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const user =
                getCurrentUser();

            const title =
                document.getElementById(
                    "campaignTitle"
                ).value.trim();

            const description =
                document.getElementById(
                    "campaignDescription"
                ).value.trim();

            const goal =
                Number(
                    document.getElementById(
                        "campaignGoal"
                    ).value
                );

            if (
                !title ||
                !description ||
                goal <= 0
            ) {

                alert(
                    "Заповни всі поля."
                );

                return;
            }

            const campaigns =
                getCampaigns();

            campaigns.push({

                id:
                    "campaign-" +
                    Date.now(),

                title: title,

                description: description,

                goal: goal,

                collected: 0,

                ownerId: user.id,

                ownerName: user.name,

                createdAt:
                    new Date().toISOString()
            });

            saveCampaigns(campaigns);

            alert(
                "Кампанію створено!"
            );

            window.location.href =
                "campaigns.html";
        }
    );
}


/* ---------- USERS ---------- */

function renderUsers() {

    const container =
        document.getElementById(
            "usersList"
        );

    if (!container) {
        return;
    }

    if (!isAdmin()) {

        window.location.href =
            "index.html";

        return;
    }

    const users =
        getUsers();

    const currentUser =
        getCurrentUser();

    container.innerHTML = "";

    users.forEach(function (user) {

        const item =
            document.createElement("div");

        item.className = "user-item";

        item.innerHTML = `
            <div>
                <strong>
                    ${escapeHTML(user.name)}
                </strong>

                <div>
                    ${escapeHTML(user.email)}
                </div>

                <small>
                    ${roleName(user.role)}
                </small>
            </div>

            <div class="user-actions">

                ${
                    user.id === currentUser.id
                    ?
                    "<span>Це ви</span>"
                    :
                    `
                    <select
                        onchange="changeRole(
                            '${user.id}',
                            this.value
                        )"
                    >
                        <option value="participant"
                            ${user.role === "participant"
                                ? "selected"
                                : ""}
                        >
                            Учасник
                        </option>

                        <option value="organizer"
                            ${user.role === "organizer"
                                ? "selected"
                                : ""}
                        >
                            Організатор
                        </option>

                        <option value="admin"
                            ${user.role === "admin"
                                ? "selected"
                                : ""}
                        >
                            Адмін
                        </option>
                    </select>

                    <button
                        class="btn danger"
                        onclick="deleteUser(
                            '${user.id}'
                        )"
                    >
                        Видалити
                    </button>
                    `
                }

            </div>
        `;

        container.appendChild(item);
    });
}


function changeRole(userId, role) {

    if (!isAdmin()) {
        return;
    }

    const users =
        getUsers();

    const currentUser =
        getCurrentUser();

    if (userId === currentUser.id) {
        return;
    }

    const user =
        users.find(
            item => item.id === userId
        );

    if (!user) {
        return;
    }

    user.role = role;

    saveUsers(users);

    renderUsers();
}


function deleteUser(userId) {

    if (!isAdmin()) {
        return;
    }

    const currentUser =
        getCurrentUser();

    if (userId === currentUser.id) {
        alert(
            "Не можна видалити себе."
        );

        return;
    }

    const users =
        getUsers();

    const user =
        users.find(
            item => item.id === userId
        );

    if (!user) {
        return;
    }

    if (
        !confirm(
            `Видалити ${user.name}?`
        )
    ) {
        return;
    }

    saveUsers(
        users.filter(
            item => item.id !== userId
        )
    );

    renderUsers();
}


/* ---------- ACTIVITY ---------- */

function renderActivity() {

    const container =
        document.getElementById(
            "activityList"
        );

    if (!container) {
        return;
    }

    const campaigns =
        getCampaigns();

    container.innerHTML = "";

    campaigns
        .slice()
        .reverse()
        .forEach(function (campaign) {

            const item =
                document.createElement("div");

            item.className =
                "activity-item";

            item.innerHTML = `
                Створено кампанію
                <strong>
                    ${escapeHTML(campaign.title)}
                </strong>
                · Зібрано
                <strong>
                    ${campaign.collected} ₴
                </strong>
            `;

            container.appendChild(item);
        });

    if (campaigns.length === 0) {

        container.innerHTML =
            `
            <div class="activity-item">
                Активності поки немає.
            </div>
            `;
    }
}


/* ---------- HOME ---------- */

function renderHome() {

    const count =
        document.getElementById(
            "homeCampaignCount"
        );

    const collected =
        document.getElementById(
            "homeCollected"
        );

    const users =
        document.getElementById(
            "homeUserCount"
        );

    if (!count) {
        return;
    }

    const campaigns =
        getCampaigns();

    const allUsers =
        getUsers();

    const total =
        campaigns.reduce(
            function (sum, campaign) {
                return sum + campaign.collected;
            },
            0
        );

    count.textContent =
        campaigns.length;

    collected.textContent =
        total + " ₴";

    users.textContent =
        allUsers.length;
}


/* ---------- SETTINGS ---------- */

function initReset() {

    const button =
        document.querySelector(
            "[data-reset-data]"
        );

    if (!button) {
        return;
    }

    if (!isAdmin()) {
        button.style.display = "none";
        return;
    }

    button.addEventListener(
        "click",
        function () {

            if (
                !confirm(
                    "Скинути всі демо-дані?"
                )
            ) {
                return;
            }

            localStorage.removeItem(
                "skynulys_users"
            );

            localStorage.removeItem(
                "skynulys_campaigns"
            );

            sessionStorage.removeItem(
                "skynulys_current_user"
            );

            createDemoData();

            window.location.href =
                "login.html";
        }
    );
}


/* ---------- SEARCH ---------- */

function initSearch() {

    const search =
        document.getElementById(
            "campaignSearch"
        );

    if (!search) {
        return;
    }

    search.addEventListener(
        "input",
        function () {

            renderCampaigns(
                search.value
            );
        }
    );
}


/* ---------- SECURITY ---------- */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


/* ---------- PAGE START ---------- */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        createDemoData();

        const page =
            document.body.dataset.page;

        if (
            page !== "login" &&
            page !== "register"
        ) {
            if (!requireLogin()) {
                return;
            }
        }

        initRegister();

        initLogin();

        initLogout();

        initCreateCampaign();

        initReset();

        initSearch();

        updateUserInfo();

        updatePermissions();

        renderCampaigns();

        renderUsers();

        renderActivity();

        renderHome();
    }
);