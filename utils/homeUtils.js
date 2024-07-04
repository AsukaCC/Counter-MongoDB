const path = require('path');
const { getDirectories } = require('./themesTypeUtils');

async function renderHome(req, res) {
  try {
    const themesDir = path.join(__dirname, '../assets/theme');
    const themes = await getDirectories(themesDir);

    // 构建HTML内容
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API Demos</title>
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            const themes = ${JSON.stringify(themes)};

            // Counter Section
            const counterSelect = document.getElementById('counter-theme-select');
            const counterInput = document.getElementById('counter-name-input');
            const counterButton = document.getElementById('counter-generate-btn');
            const counterResult = document.getElementById('counter-result-path');
            const counterImg = document.getElementById('counter-dynamic-img');

            // Set default input value to 'test'
            counterInput.value = 'test';

            // Populate the select element with themes
            themes.forEach(theme => {
              const option = document.createElement('option');
              option.value = theme;
              option.textContent = theme;
              counterSelect.appendChild(option);
            });

            // Generate URL and display it
            const generateCounterUrl = () => {
              let name = counterInput.value.trim();
              if (name === '') {
                name = 'test'; // 默认值
                counterInput.value = name;
              }
              const selectedTheme = counterSelect.value;
              const baseUrl = window.location.origin;
              const url = \`\${baseUrl}/api/counter/\${name}?type=\${selectedTheme}\`;
              counterResult.textContent = url;
              counterImg.src = url;
            };

            // Initial URL generation
            generateCounterUrl();

            // Add event listener to button
            counterButton.addEventListener('click', generateCounterUrl);

            // Emoji Section
            const emojiInput = document.getElementById('emoji-name-input');
            const emojiButton = document.getElementById('emoji-generate-btn');
            const emojiResult = document.getElementById('emoji-result-path');
            const emojiImg = document.getElementById('emoji-dynamic-img');

            // Set default input value to ''
            emojiInput.value = '';

            // Generate URL and display it
            const generateEmojiUrl = () => {
              let name = emojiInput.value.trim();
              const baseUrl = window.location.origin;
              const url = name ? \`\${baseUrl}/api/emoji/\${name}\` : \`\${baseUrl}/api/emoji\`;
              emojiResult.textContent = url;
              emojiImg.src = url;
            };

            // Initial URL generation
            generateEmojiUrl();

            // Add event listener to button
            emojiButton.addEventListener('click', generateEmojiUrl);
          });
        </script>
        <style>
          body {
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-y:auto;
            overflow-x:hidden;
            margin: 0;
            padding: 0;
          }
          img {
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 100%;
          }
          .warp {
            width: 80%;
            height: 100%;
            display: flex;
            align-items: flex-start;
            flex-direction: column;
            margin: 0 auto;
          }
          .section {
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="warp">
          <div class="section">
            <h1>计数器</h1>
            <div id="api-description">
              <h2>API 参数说明 (API Parameter Explanation)</h2>
              <p><strong>name:</strong> 唯一标识，不为空。</p>
              <p><strong>type:</strong> 选择的主题，可不传默认为theme下第一个</p>
            </div>
            <label for="counter-name-input">Name: </label>
            <input type="text" id="counter-name-input" placeholder="Enter name" />
            <label for="counter-theme-select">Theme: </label>
            <select id="counter-theme-select"></select>
            <button id="counter-generate-btn">Generate URL</button>
            <p id="counter-result-path"></p>
            <img id="counter-dynamic-img" src="" alt="Counter Image" />
          </div>
          <div class="section">
            <h1>表情符号</h1>
            <div id="api-description">
              <h2>API 参数说明 (API Parameter Explanation)</h2>
              <p><strong>name:</strong> 表情名称，可不传。</p>
            </div>
            <label for="emoji-name-input">Name: </label>
            <input type="text" id="emoji-name-input" placeholder="Enter emoji name" />
            <button id="emoji-generate-btn">Generate URL</button>
            <p id="emoji-result-path"></p>
            <img id="emoji-dynamic-img" src="" alt="Emoji Image" />
          </div>
        </div>
      </body>
      </html>
    `;

    // 返回渲染后的HTML
    res.send(html);
  } catch (error) {
    res.status(500).send(error);
  }
}

module.exports = {
  renderHome,
};
