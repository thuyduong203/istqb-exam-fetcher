// content-loader.js
console.log('🚀 ISTQB Downloader loaded - watching for SPA changes...');

let downloadButton = null;
let isButtonAdded = false;
let title = 'ISTQB-Exam';

// Hàm tạo download button
function createDownloadButton() {
  const button = document.createElement('button');
  button.innerHTML = '📥 Tải PDF';
  button.id = 'istqb-download-btn';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 10000;
    background: #4CAF50;
    color: white;
    border: none;
    padding: 7px 13px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    transition: all 0.3s ease;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.background = '#45a049';
    button.style.transform = 'scale(1.05)';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = '#4CAF50';
    button.style.transform = 'scale(1)';
  });

  button.addEventListener('click', handleDownload);
  return button;
}

// Hàm xử lý download
async function handleDownload() {
  if (!downloadButton) return;

  const originalText = downloadButton.innerHTML;
  downloadButton.innerHTML = '⏳ Đang xử lý...';
  downloadButton.disabled = true;

  try {
    await injectScript('html2canvas.min.js');
    await injectScript('jspdf.umd.min.js');
    await injectScript('content.js');

    // Gửi title sang content.js
    window.postMessage({ type: 'ISTQB_SET_TITLE', title: title }, '*');

    console.log('✅ All scripts injected successfully!');
  } catch (error) {
    console.error('❌ Lỗi inject script:', error);
    downloadButton.innerHTML = '❌ Lỗi!';
    setTimeout(() => {
      downloadButton.innerHTML = originalText;
      downloadButton.disabled = false;
    }, 2000);
  }
}

// Hàm inject script
function injectScript(scriptName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(scriptName);
    script.onload = () => {
      script.remove();
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${scriptName}`));
    document.head.appendChild(script);
  });
}

// === HÀM CHÍNH: kiểm tra và thêm button sau khi bấm nút chơi quiz ===
function addButtonAfterPlay() {
  if (!isButtonAdded) {
    console.log('🎯 Quiz started — adding download button...');
    downloadButton = createDownloadButton();
    document.body.appendChild(downloadButton);
    isButtonAdded = true;
  }
}

// Theo dõi thay đổi DOM để tìm nút "Play Quiz"
const observer = new MutationObserver(() => {
  const playBtn = document.querySelector('.btn-play-quiz');
  if (playBtn && !playBtn.dataset.istqbBound) {
    playBtn.dataset.istqbBound = 'true';
    playBtn.addEventListener('click', () => {
      title = document.getElementsByClassName('container')[0].innerText.trim();
      setTimeout(addButtonAfterPlay, 1000);
    });
  }
});

// Bắt đầu quan sát toàn trang
observer.observe(document.body, { childList: true, subtree: true });

// Cleanup khi trang unload
window.addEventListener('beforeunload', () => observer.disconnect());
