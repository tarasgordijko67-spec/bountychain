console.log("collection.js завантажився");

const details = document.querySelector("#collectionDetails");

const params = new URLSearchParams(window.location.search);
const collectionId = Number(params.get("id"));

const collections = JSON.parse(localStorage.getItem("collections")) || [];
const collection = collections.find((item) => item.id === collectionId);

if (!details) {
  console.error("Не знайдено елемент #collectionDetails");
} else if (!collection) {
  details.innerHTML = `
    <h1>Збір не знайдено</h1>
    <p>Можливо, його немає в збережених зборах.</p>
  `;
} else {
  const percent = collection.goal > 0
    ? Math.min(100, Math.round((collection.raised / collection.goal) * 100))
    : 0;

  const title = document.createElement("h1");
  title.textContent = collection.title;

  const description = document.createElement("p");
  description.textContent = collection.description;

  const amount = document.createElement("p");
  amount.textContent = `${collection.raised} SOL з ${collection.goal} SOL`;

  const progress = document.createElement("div");
  progress.className = "progress-track";
  progress.setAttribute("role", "progressbar");
  progress.setAttribute("aria-valuenow", String(percent));
  progress.setAttribute("aria-valuemin", "0");
  progress.setAttribute("aria-valuemax", "100");

  const fill = document.createElement("div");
  fill.className = "progress-fill";
  fill.style.width = `${percent}%`;
  progress.appendChild(fill);

  const percentage = document.createElement("p");
  percentage.textContent = `${percent}% зібрано`;

  const form = document.createElement("form");
  form.className = "contribution-form";

  const formTitle = document.createElement("h2");
  formTitle.textContent = "Тестовий внесок у Devnet";

  const recipientLabel = document.createElement("label");
  recipientLabel.textContent = "Публічна адреса отримувача";

  const recipientInput = document.createElement("input");
  recipientInput.type = "text";
  recipientInput.placeholder = "Встав адресу тестового гаманця";
  recipientInput.required = true;
  recipientInput.autocomplete = "off";

  const amountLabel = document.createElement("label");
  amountLabel.textContent = "Сума тестового внеску (SOL)";

  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.min = "0.001";
  amountInput.max = "0.01";
  amountInput.step = "0.001";
  amountInput.value = "0.001";
  amountInput.required = true;

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Внести тестові SOL";

  const status = document.createElement("p");
  status.setAttribute("aria-live", "polite");

  const warning = document.createElement("p");
  warning.textContent =
    "Лише Devnet. Не використовуй справжні кошти. Перевір адресу та суму у Phantom перед підтвердженням.";

  form.append(
    formTitle,
    recipientLabel,
    recipientInput,
    amountLabel,
    amountInput,
    submitButton,
    status,
    warning
  );

  details.replaceChildren(
    title,
    description,
    amount,
    progress,
    percentage,
    form
  );

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const provider = window.phantom?.solana || window.solana;

    if (!provider || !provider.isPhantom) {
      status.textContent = "Не знайдено Phantom. Перевір, чи встановлено розширення.";
      return;
    }

    if (!window.solanaWeb3) {
      status.textContent = "Бібліотека Solana не завантажилась. Онови сторінку.";
      return;
    }

    const recipientAddress = recipientInput.value.trim();
    const solAmount = Number(amountInput.value);

    if (!Number.isFinite(solAmount) || solAmount < 0.001 || solAmount > 0.01) {
      status.textContent = "Для демо можна вказати від 0.001 до 0.01 SOL.";
      return;
    }

    try {
      const {
        PublicKey,
        Connection,
        Transaction,
        SystemProgram,
        LAMPORTS_PER_SOL
      } = window.solanaWeb3;

      const recipient = new PublicKey(recipientAddress);

      submitButton.disabled = true;
      status.textContent = "Підключаю Phantom…";

      const wallet = await provider.connect();
      const sender = wallet.publicKey;

      const connection = new Connection(
        "https://api.devnet.solana.com",
        "confirmed"
      );

      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash("confirmed");

      const transaction = new Transaction({
        feePayer: sender,
        recentBlockhash: blockhash
      }).add(
        SystemProgram.transfer({
          fromPubkey: sender,
          toPubkey: recipient,
          lamports: Math.round(solAmount * LAMPORTS_PER_SOL)
        })
      );

      status.textContent = "Перевір адресу та суму у Phantom і підтверди транзакцію.";

      const { signature } = await provider.signAndSendTransaction(transaction);

      status.textContent = "Транзакцію надіслано. Очікую підтвердження…";

      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );
      // Оновлюємо прогрес локально — лише для демонстрації
collection.raised = Number(collection.raised) + solAmount;
localStorage.setItem("collections", JSON.stringify(collections));

amount.textContent = `${collection.raised} SOL з ${collection.goal} SOL`;

const updatedPercent = collection.goal > 0
  ? Math.min(100, Math.round((collection.raised / collection.goal) * 100))
  : 0;

fill.style.width = `${updatedPercent}%`;
progress.setAttribute("aria-valuenow", String(updatedPercent));
percentage.textContent = `${updatedPercent}% зібрано`;  

      status.textContent = "Тестовий переказ підтверджено. ";

      const explorerLink = document.createElement("a");
      explorerLink.href =
        `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      explorerLink.target = "_blank";
      explorerLink.rel = "noopener noreferrer";
      explorerLink.textContent = "Переглянути транзакцію в Solana Explorer";

      status.appendChild(explorerLink);
    } catch (error) {
      console.error(error);
      status.textContent =
        error?.message || "Не вдалося виконати переказ. Перевір адресу та Devnet.";
    } finally {
      submitButton.disabled = false;
    }
  });
}