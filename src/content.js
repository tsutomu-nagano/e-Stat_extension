if (location.href.startsWith("https://www.e-stat.go.jp/regional-statistics/ssdsview/")) {

  const observer = new MutationObserver((mutations, obs) => {
    const target = document.querySelector(".stat-display-selector-errors.js-display-selector-errors");
    if (!target) return;

    const prev = target.previousElementSibling;
    if (!prev || prev.tagName.toLowerCase() !== "div") return;

    if (!prev.dataset.customAdded) {
      prev.innerHTML += "※選択状態でダブルクリックをすると詳細が確認できます。";
      prev.dataset.customAdded = "true";
      console.log("✔ テキスト追加完了");
    }

    obs.disconnect(); // 監視終了
  });

  observer.observe(document.body, {
    childList: true, // 直接の子の変化を監視
    subtree: true    // body 以下すべての変化を監視
  });
}


(() => {

  function createDrawer(optionValue) {
    if (!optionValue) return;

    // 既存ドロワーを削除
    const existingDrawer = document.getElementById("custom-drawer");
    if (existingDrawer) existingDrawer.remove();

    // URLを生成（例）
    const firstChar = optionValue.charAt(0);
    const targetUrl = `https://www.e-stat.go.jp/koumoku/koumoku_teigi/${firstChar}#${encodeURIComponent(optionValue)}`;

    // スタイル追加（1回だけ）
    if (!document.getElementById("custom-drawer-style")) {
      const style = document.createElement("style");
      style.id = "custom-drawer-style";
      style.textContent = `
        #custom-drawer {
          position: fixed;
          top: 0;
          right: -50%;
          width: 50%;
          height: 100%;
          background: white;
          box-shadow: -2px 0 5px rgba(0,0,0,0.2);
          transition: right 0.3s ease-in-out;
          padding: 0;
          z-index: 10000;
          display: flex;
          flex-direction: column;
          border-radius: 8px;
          overflow: hidden;
        }
        #custom-drawer.open { right: 0; }
        #drawer-header {
          flex: 0 0 40px;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          padding: 0 10px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        #drawer-close {
          cursor: pointer;
          font-size: 18px;
          margin-right: 10px;
        }
        #drawer-iframe {
          flex: 1 1 auto;
          border: none;
          width: 100%;
        }
      `;
      document.head.appendChild(style);
    }

    // ドロワー作成
    const drawer = document.createElement("div");
    drawer.id = "custom-drawer";
    drawer.innerHTML = `
      <div id="drawer-header">
        <button id="drawer-close">✖</button>
        <span>SSDS 項目定義</span>
      </div>
      <iframe id="drawer-iframe" src="${targetUrl}"></iframe>
    `;
    document.body.appendChild(drawer);

    // 表示アニメーション
    setTimeout(() => drawer.classList.add("open"), 10);

    // 閉じる処理
    document.getElementById("drawer-close").addEventListener("click", () => {
      drawer.classList.remove("open");
      setTimeout(() => drawer.remove(), 300);
    });
  }

  const select = document.getElementById("display-selector-select-box-items-from");

  if (select) {
    select.addEventListener("dblclick", () => {
      const selectedOption = select.selectedOptions[0];
      if (!selectedOption) return;

      const optionValue = selectedOption.value;
      if (!optionValue) return;

      createDrawer(optionValue);
    });
  }

})();


let popup = null;

document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  // 選択解除
  if (!text) {
    hidePopup();
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  showPopup(rect, text);
});

function showPopup(rect, text) {
  hidePopup();

  popup = document.createElement("div");
  popup.className = "selection-popup";
  popup.textContent = `選択: ${text}`;

  // 位置設定（画面スクロール量を加味）
  popup.style.top = `${rect.top + window.scrollY - 40}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;

  document.body.appendChild(popup);

  // クリックで閉じる
  popup.addEventListener("click", hidePopup);
}

function hidePopup() {
  if (popup) {
    popup.remove();
    popup = null;
  }
}
