"# Book-Recaps-Frontend" 

Chia folder theo role.
Ví dụ, book_recaps_staff, book_recaps_audience,...

Build bằng Vite + React

Chạy Project: npm install -> npm run dev

tạo file .env -> copy paste đoạn này

VITE_RECAPTCHA_KEY="6LdFTgMqAAAAAPMELcBY4rySQ1UpT5ZcXvVcj-_J"

npm install react-google-recaptcha-v3

Dùng GoogleReCaptchaProvider để bọc toàn bộ <App />

Login function: const token = await executeRecaptcha("login");

Register function: const token = await executeRecaptcha("signup");

Tham khảo App.jsx và Login.jsx của folder book_recaps_staff 



