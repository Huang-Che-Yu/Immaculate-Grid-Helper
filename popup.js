// popup.js
(async () => {
  // 找到當前分頁
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        const elements = document.querySelectorAll('div.inline-block.normal-case');

        const texts = Array.from(elements).map(el => {
          const img = el.querySelector("img");
          if (img && img.alt) return img.alt.trim();
          return el.innerText.trim();
        });

        // 建立 4x4 grid
        const grid = Array.from({ length: 4 }, () => Array(4).fill(""));

        // 放文字
        let index = 0;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (r === 0 && c === 0) continue;
            if (index < 3 && r === 0 && c > 0) grid[r][c] = texts[index++];
            else if (index >= 3 && index < texts.length && r > 0 && c === 0) grid[r][c] = texts[index++];
          }
        }

        // 其餘格子 → Google 搜尋網址，顯示 A~I
        const letters = ["A","B","C","D","E","F","G","H","I"];
        let letterIndex = 0;
        for (let r = 1; r < 4; r++) {
          for (let c = 1; c < 4; c++) {
            const query = encodeURIComponent(grid[r][0] + " and " + grid[0][c] + " player");
            grid[r][c] = {
              url: `https://www.google.com/search?q=${query}`,
              label: letters[letterIndex++]
            };
          }
        }

        return grid;
      },
    },
    (results) => {
      if (results && results[0] && results[0].result) {
        const grid = results[0].result;

        // 生成 HTML table
        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";
        for (let r = 0; r < 4; r++) {
          const tr = document.createElement("tr");
          for (let c = 0; c < 4; c++) {
            const td = document.createElement("td");
            td.style.border = "1px solid #ccc";
            td.style.padding = "4px";
            td.style.textAlign = "center";

            if (r === 0 && c === 0) {
              td.textContent = grid[r][c]; // 左上角
            } else if (r >= 1 && c >= 1) {
              const a = document.createElement("a");
              a.href = grid[r][c].url;
              a.target = "_blank";
              a.textContent = grid[r][c].label;
              td.appendChild(a);
            } else {
              td.textContent = grid[r][c];
            }

            tr.appendChild(td);
          }
          table.appendChild(tr);
        }

        const output = document.getElementById("output");
        output.innerHTML = "";
        output.appendChild(table);

      } else {
        document.getElementById("output").textContent = "沒有找到任何文字或圖片";
      }
    }
  );
})();
