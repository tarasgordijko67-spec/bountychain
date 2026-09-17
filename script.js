const defaultCollections = [
  {
    id: 1,
    title: "Подарунок класному керівнику",
    description: "Збираємо на спільний подарунок від класу.",
    raised: 1.2,
    goal: 2
  },
  {
    id: 2,
    title: "Поїздка класу",
    description: "Спільний збір на поїздку.",
    raised: 3.5,
    goal: 5
  }
];

let collections;

try {
  const savedCollections = localStorage.getItem("collections");
  collections = savedCollections
    ? JSON.parse(savedCollections)
    : defaultCollections;
} catch (error) {
  console.error("Не вдалося прочитати збережені збори:", error);
  collections = defaultCollections;
}

function saveCollections() {
  localStorage.setItem("collections", JSON.stringify(collections));
}

if (!localStorage.getItem("collections")) {
  saveCollections();
}

const collectionGrid = document.querySelector("#collectionGrid");
const collectionCount = document.querySelector("#collectionCount");
const createForm = document.querySelector("#createForm");

function escapeHTML(value) {
  const symbols = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };

  return String(value).replace(/[&<>"']/g, (character) => {
    return symbols[character];
  });
}

function renderCollections() {
  if (!collectionGrid) {
    console.error('Не знайдено елемент із id="collectionGrid".');
    return;
  }

  collectionGrid.innerHTML = "";

  collections.forEach((collection) => {
    const goal = Number(collection.goal);
    const raised = Number(collection.raised) || 0;

    const percent =
      goal > 0
        ? Math.min(100, Math.round((raised / goal) * 100))
        : 0;

    const card = document.createElement("article");
    card.className = "collection-card";

    card.innerHTML = `
      <h3>${escapeHTML(collection.title)}</h3>
      <p>${escapeHTML(collection.description)}</p>

      <div class="progress-info">
        <strong>${raised} SOL з ${goal} SOL</strong>
        <span>${percent}%</span>
      </div>

      <div
        class="progress-track"
        role="progressbar"
        aria-valuenow="${percent}"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Прогрес збору"
      >
        <div class="progress-fill" style="width: ${percent}%"></div>
      </div>

      <a class="details-button" href="collection.html?id=${encodeURIComponent(collection.id)}">
        Детальніше
      </a>
    `;

    collectionGrid.appendChild(card);
  });

  if (collectionCount) {
    const count = collections.length;
    collectionCount.textContent = `${count} ${
      count === 1 ? "збір" : count >= 2 && count <= 4 ? "збори" : "зборів"
    }`;
  }
}

if (createForm) {
  createForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = document.querySelector("#title")?.value.trim() || "";
    const description =
      document.querySelector("#description")?.value.trim() || "";
    const goal = Number(document.querySelector("#goal")?.value);

    if (!title || !description || !Number.isFinite(goal) || goal <= 0) {
      alert("Заповни всі поля та вкажи ціль більше нуля.");
      return;
    }

    collections.push({
      id: Date.now(),
      title,
      description,
      raised: 0,
      goal
    });

    saveCollections();
    renderCollections();
    createForm.reset();
  });
} else {
  console.warn('Не знайдено форму з id="createForm".');
}

renderCollections();

// Підключення Phantom
const connectWalletButton = document.querySelector("#connectWallet");
const walletStatus = document.querySelector("#walletStatus");

let walletProvider = null;

function getWalletProvider() {
  if (window.phantom?.solana?.isPhantom) {
    return window.phantom.solana;
  }

  if (window.solana?.isPhantom) {
    return window.solana;
  }

  return null;
}

function showWalletAddress(publicKey) {
  if (!publicKey || !walletStatus || !connectWalletButton) {
    return;
  }

  const address = publicKey.toString();
  const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;

  walletStatus.textContent = `Підключено: ${shortAddress}`;
  connectWalletButton.textContent = "Гаманець підключено";
}

if (connectWalletButton && walletStatus) {
  connectWalletButton.addEventListener("click", async () => {
    walletProvider = getWalletProvider();

    if (!walletProvider) {
      walletStatus.textContent =
        "Phantom не знайдено. Встанови розширення Phantom і перезавантаж сторінку.";
      return;
    }

    try {
      const response = await walletProvider.connect();
      showWalletAddress(response.publicKey);
    } catch (error) {
      walletStatus.textContent = "Підключення скасовано або не вдалося.";
      console.error("Помилка підключення Phantom:", error);
    }
  });

  const provider = getWalletProvider();

  if (provider) {
    provider.on("accountChanged", (publicKey) => {
      if (publicKey) {
        showWalletAddress(publicKey);
      } else {
        walletStatus.textContent = "Гаманець не підключено";
        connectWalletButton.textContent = "Підключити гаманець";
      }
    });
  }
}