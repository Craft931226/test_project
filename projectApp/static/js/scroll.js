const translations = {
    "主頁": { en: "Home", zh: "主頁" },
    "預約系統": { en: "Reservation System", zh: "預約系統" },
    "注意事項": { en: "Notations", zh: "注意事項" },
    "常見問題": { en: "F&Q", zh: "常見問題" },
    "功能": { en: "Function", zh: "功能" },
    "更改密碼": { en: "Change Password", zh: "更改密碼" },
    "登出": { en: "Logout", zh: "登出" },
    "歡迎": { en: "Welcome,", zh: "歡迎，" },
    "歡迎來到琴房預約系統": { en: "Welcome to the Piano Room Reservation System", zh: "歡迎來到琴房預約系統" },
    "若您是第一次使用，請閱讀以下注意事項": { en: "If this is your first time, please read the following precautions", zh: "若您是第一次使用，請閱讀以下注意事項" },
    "中央鋼琴社預約系統": { en: "National Central University Piano Society Reservation System", zh: "中央鋼琴社預約系統" },
    "每人每周不得預約超過七小時，違規者系統自動取消。": { en: "1.Each person is not allowed to book more than seven hours per week. Violators will have their reservations automatically canceled.", zh: "1.每人每周不得預約超過七小時，違規者系統自動取消。" },
    "為達使用琴房效率最大化，預約後若無法到場請記得取消預約": { en: "2.To maximize the efficiency of using the piano room, please remember to cancel your reservation if you cannot attend.", zh: "2.為達使用琴房效率最大化，預約後若無法到場請記得取消預約" },
    "開完琴房後鑰匙請記得掛回社窩，並鎖上門。": { en: "3.After using the piano room, please remember to hang the key back in the club room and lock the door.", zh: "3.開完琴房後鑰匙請記得掛回社窩，並鎖上門。" },
    "離開琴房時請記得關燈、鎖門。": { en: "4.When leaving the piano room, please remember to turn off the lights and lock the door.", zh: "4.離開琴房時請記得關燈、鎖門。" },
    "有任何問題請聯絡網管。": { en: "5.If you have any questions, please contact the network administrator.Email:yanchaun0970@gmail.com", zh: "5.有任何問題請聯絡網管。Email:yanchaun0970@gmail.com" }
};

function initializeTranslations() {
    const selectedLanguage = document.getElementById('languages').value || 'zh'; // 預設為中文
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key] && translations[key][selectedLanguage]) {
            element.textContent = translations[key][selectedLanguage];
        }
    });
}

// 在頁面載入時初始化
document.addEventListener('DOMContentLoaded', initializeTranslations);

// 切換語言功能
document.getElementById('languages').addEventListener('change', function () {
    const selectedLanguage = this.value;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[key] && translations[key][selectedLanguage]) {
            element.textContent = translations[key][selectedLanguage];
        }
    });
});
function openLoadingDialog() {
    const dialog = document.getElementById('LoadingDialog');
    dialog.showModal();
}
function closeLoadingDialog() {
    const dialog = document.getElementById('LoadingDialog');
    dialog.close();
}
function openDialog(event) {
  const button = event.currentTarget;
  const date = button.getAttribute('data-date');

  // 取得對話框元素
  const dialog = document.getElementById("myDialog");

  openLoadingDialog(); // 開啟載入中對話框
  
  // dialog.showModal(); // 打開對話框

  // 獲取事件並更新對話框
  fetch(`/get-calendar-events/?date=${date}`)
      .then(response => response.json())
      .then(data => {
          if (data.error) {
              console.error(data.error);
              dialog.innerHTML = `<h2>加載失敗，請重試。</h2>`;
              return;
          }

          const timeSlots = generateTimeSlots(data.events, date);
          closeLoadingDialog(); // 關閉載入中對話框
          dialog.innerHTML = `
              <h2>日期：${date}</h2>
              <div class="time-slots">
                  ${timeSlots}
              </div>
              <button onclick="closeDialog()">關閉</button>
          `;
          dialog.showModal(); // 打開對話框
          // 將對話框滾動到頂部
          dialog.scrollTop = 0;
      })
      .catch(error => {
          console.error('Error fetching events:', error);
          dialog.innerHTML = `<h2>發生錯誤，請稍後再試。</h2>`;
      });
}

function generateTimeSlots(events, targetDate) {
  const slots = [];
  const timeStart = new Date(targetDate);
  timeStart.setHours(8, 0, 0, 0); // 設定為當天的 08:00:00

  const timeEnd = new Date(targetDate);
  timeEnd.setHours(22, 0, 0, 0); // 設定為當天的 23:00:00

  for (let time = new Date(timeStart); time <= timeEnd; time.setMinutes(time.getMinutes() + 30)) {
      const timeString = time.toTimeString().split(' ')[0].slice(0, 5); // 獲取本地時間 HH:mm 格式
      // console.log(timeString);
      const isOccupied = events.some(event => {
          const eventStart = new Date(event.start).getTime();
          const eventEnd = new Date(event.end).getTime();
          return time.getTime() >= eventStart && time.getTime() < eventEnd;
      });

      // 每個時間段單獨用 <div> 包裹，實現一行一個時間
      slots.push(`
          <div class="time-slot-container">
              <a class="time-slot ${isOccupied ? 'occupied' : 'available'}">
                  ${timeString} ${isOccupied ? '(已預約)' : ''}
              </a>
          </div>
      `);
  }

  return slots.join(''); // 返回 HTML 字符串
}


function closeDialog() {
  const dialog = document.getElementById("myDialog");
  dialog.close();
}
// 新增點擊灰色背景關閉對話框的功能
document.addEventListener('click', function (event) {
  const dialog = document.getElementById("myDialog");

  // 確保對話框是打開的
  if (dialog.open) {
      // 判斷點擊是否發生在對話框外部
      const rect = dialog.getBoundingClientRect();
      const isInDialog =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

      if (!isInDialog) {
          dialog.close(); // 關閉對話框
      }
  }
});

// 新增點擊灰色背景關閉對話框的功能
document.addEventListener('click', function (event) {
  const dialog = document.getElementById("LoadingDialog");

  // 確保對話框是打開的
  if (dialog.open) {
      // 判斷點擊是否發生在對話框外部
      const rect = dialog.getBoundingClientRect();
      const isInDialog =
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom;

      if (!isInDialog) {
          dialog.close(); // 關閉對話框
      }
  }
});

function calculateWeekDates() {
  const today = new Date(); // 當前日期
  const dayOfWeek = today.getDay(); // 今天是星期幾 (0: 星期日, 1: 星期一, ...)
  const startOfWeek = new Date(today); // 複製當前日期

  // const offset = (dayOfWeek + 1) % 7; // 從今天向前偏移到最近的星期六
  // startOfWeek.setDate(today.getDate() - offset); // 設定為當週星期六
  startOfWeek.setDate(today.getDate() - dayOfWeek); // 設定為當週星期日

  // 生成當週 7 天的日期
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i); // 增加 i 天
    weekDates.push(
      new Date(date.getFullYear(), date.getMonth(), date.getDate()) // 確保是本地時間
    );
  }
  return weekDates;
}


// 格式化日期為 "月/日 星期X"
function formatDate(date) {
  const options = { month: 'numeric', day: 'numeric' }; // 格式：月/日
  const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']; // 星期名稱
  const formattedDate = date.toLocaleDateString('zh-TW', options);
  const weekday = weekdayNames[date.getDay()];
  return `${formattedDate} 星期${weekday}`;
}

function updateReservationButtons() {
  const weekDates = calculateWeekDates(); // 獲取當週日期
  const today = new Date(); // 獲取今天日期
  today.setHours(0, 0, 0, 0); // 將今天的時間設為 0 點，便於比較

  // 找到每個琴房區塊中的按鈕
  const roomContainers = document.querySelectorAll('.button-container');
  roomContainers.forEach((container) => {
    const buttons = container.querySelectorAll('.reservation-btn');
    buttons.forEach((button, index) => {
      if (index < weekDates.length) {
        const buttonDate = weekDates[index];
        button.innerText = formatDate(buttonDate); // 更新按鈕文字

        // 使用本地日期作為 data-date
        const localDate = `${buttonDate.getFullYear()}-${(buttonDate.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${buttonDate.getDate().toString().padStart(2, '0')}`;
        button.setAttribute('data-date', localDate); // 設定 data-date 屬性

        // 禁用過去的日期按鈕
        if (buttonDate < today) {
          button.style.backgroundColor = 'gray'; // 設定灰色背景
          button.style.cursor = 'not-allowed'; // 改變游標為不可用樣式
          button.onclick = null; // 禁止點擊事件
        } else {
          button.style.backgroundColor = ''; // 還原按鈕背景
          button.style.cursor = 'pointer'; // 還原游標樣式
          button.onclick = (event) => openDialog(event); // 綁定點擊事件
        }
      }
    });
  });
}



// 初始化
document.addEventListener('DOMContentLoaded', () => {
  updateReservationButtons(); // 在頁面加載時更新按鈕文字
});

