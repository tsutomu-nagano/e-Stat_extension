chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openDrawer",
    title: "ドロワーを開く",
    contexts: ["all"],
    visible: false
  });
});

let lastElementId = null;

// content.js からのメッセージを受け取る
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateContextMenu") {
    lastElementId = message.targetElementId || null;
    chrome.contextMenus.update("openDrawer", { visible: !!message.showMenu });
  }
});

// コンテキストメニュークリック時
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openDrawer" && lastElementId) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      args: [lastElementId],
      func: (elementId) => {
        if (!elementId) return;
        const element = document.getElementById(elementId);
        if (!element) return;

        // 重複ドロワーがあれば削除
        const existingDrawer = document.getElementById("custom-drawer");
        if (existingDrawer) existingDrawer.remove();

        // スタイルがまだなければ追加
        if (!document.getElementById("custom-drawer-style")) {
          const style = document.createElement("style");
          style.id = "custom-drawer-style";
          style.textContent = `
            #custom-drawer {
              position: fixed;
              top: 0;
              right: -300px;
              width: 300px;
              height: 100%;
              background: white;
              box-shadow: -2px 0 5px rgba(0,0,0,0.2);
              transition: right 0.3s ease-in-out;
              padding: 20px;
              z-index: 10000;
            }
            #custom-drawer.open { right: 0; }
            #drawer-close {
              position: absolute;
              top: 10px;
              left: 10px;
              cursor: pointer;
            }
          `;
          document.head.appendChild(style);
        }

        // ドロワー作成
        const drawer = document.createElement("div");
        drawer.id = "custom-drawer";
        drawer.innerHTML = `
          <button id="drawer-close">✖</button>
          <h3>ドロワー</h3>
          <p>選択した要素: ${element.tagName.toLowerCase()}#${element.id || "(IDなし)"}</p>
        `;
        document.body.appendChild(drawer);

        // ドロワー表示
        setTimeout(() => drawer.classList.add("open"), 10);

        // 閉じる処理
        document.getElementById("drawer-close").addEventListener("click", () => {
          drawer.classList.remove("open");
          setTimeout(() => drawer.remove(), 300);
        });
      }
    });
  }
});
