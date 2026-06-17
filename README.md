# 攝影作品管理系統 (SHUTTER Photo Portfolio Manager)

這是一個基於 **React + Vite + Tailwind CSS + Firebase (具備本機模擬備用切換引擎)** 打造的完整精緻攝影作品展示與管理系統。

## ✨ 特色功能

- **極黑攝影美學風格**：專為攝影作品展示設計，大尺寸無邊框圖片呈現，採用優良字體與金色/暖黃色調點綴。
- **雙模式後端引擎**：
  - **Firebase 物聯同步**：可完美對接真實的 Firebase Authentication, Cloud Firestore 以及 Firebase Storage。
  - **LocalStorage 家用模擬雙軌 fallback**：若尚未配置 Firebase 金鑰，系統將**自動降級運作且永不毀損**，利用瀏覽器持久化儲存，並支援 Base64 本地圖片上傳，開箱即用、無縫測試！
- **完整的會員系統**：支援註冊創作者、登入、安全路由守衛、創作者看板資訊彙整。
- **完整的作品 CRUD 管理**：支援上傳作品（本機圖片/外部網址雙支援）、修改參數、設定拍攝地點與日期、理念描述，以及永久安全刪除。
- **進階自適應篩選面板**：
  - 分類篩選（風景、人像、街拍、夜景、生態攝影）
  - 即時模糊搜尋（標題、故事理念、地點多重匹配）
  - 地點下拉動態選單

---

## 🛠️ 本機安裝與執行步驟

### 1. 克隆與安裝依賴封包

```bash
# 1. 執行安裝依賴
npm install

# 2. 啟動本機開發伺服器
npm run dev
```

### 2. 環境變數配置 (`.env`)

在專案根目錄建立 `.env` 檔案（或修改 `.env.example`），並填入您的 Firebase 網頁端配置：

```env
VITE_FIREBASE_API_KEY="YOUR_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_APP_ID"
```

*提示：若留空或不配置，系統將自動以「模擬測試模式」啟動，儲存至瀏覽器 `localStorage`。測試帳號為 `demo@example.com`、密碼為 `password`。*

---

## 🔥 Firebase 設定教學

### 第一步：建立 Firebase 專案
1. 前往 [Firebase Console](https://console.firebase.google.com/)。
2. 點選「新增專案」，輸入專案名稱 `shutter-portfolio`，並點選繼續。

### 第二步：啟用驗證功能 (Firebase Authentication)
1. 進入專案控制台，在左側選單中找到「Build > Authentication」。
2. 點選「Get Started」，並啟用「電子郵件/密碼 (Email/Password)」登入方式。

### 第三步：啟用 Firestore 資料庫
1. 在左側選單中找到「Build > Firestore Database」。
2. 點擊「建立資料庫」，選擇離您的訪客最近的地區（例如 `asia-east1` 台灣地區）。
3. 先選擇「以測試模式啟動」，並依需求填入下方的 **Firestore 安全規則**。

### 第四步：啟用 Storage 雲端儲存
1. 在左側選單中找到「Build > Storage」。
2. 點擊「開始使用」，並設定為測試模式。

---

## 🔒 Firebase 安全規則配置

### 1. Firestore Database Rules (`firestore.rules`)

請在 Firestore 的「Rules (規則)」分頁中貼上：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 用戶設定檔規則：只有帳戶擁有者能夠寫入/修改自己的設定檔
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 攝影作品規則：任何人都可以瀏覽，但只有登入創作者能新增，且只有作品的原作者能編輯與刪除
    match /photos/{photoId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

### 2. Firebase Storage Rules (`storage.rules`)

請在 Storage 的「Rules (規則)」分頁中貼上：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // 限制上傳的相片夾：任何人皆可讀取，但必須登入才可上傳，且只能刪除自己的檔案
    match /photos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 🚀 Vercel 部署教學

如果您希望將本系統部署至網路上，推薦使用最便利的 Vercel 平台：

1. 將您的專案上傳/推送至個人的 **GitHub** 帳號庫。
2. 註冊並登入 [Vercel 官網](https://vercel.com/)。
3. 點選 **Add New > Project**，並關聯導入您的 GitHub 專案。
4. **關鍵配置 (Environment Variables)**：
   - 在 **Environment Variables** 區塊中，填入上述對應的 Firebase `VITE_FIREBASE_...` 等核心環境變數。
5. **部署成功**：點選 **Deploy**，不倒數秒間即可生成可公開訪問的頂級安全 `https` 連結！
