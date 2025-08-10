import React, { useState, useEffect } from 'react';
import './App.css'; // یا هر فایل CSS دیگری که دارید

function App() {
  const [balance, setBalance] = useState(0); // مقدار اولیه موقت
  const [spins, setSpins] = useState(0);     // مقدار اولیه موقت
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // برای نمایش حالت لودینگ

  // ** این تابع اطلاعات را هنگام باز شدن برنامه از سرور می‌گیرد **
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // منتظر می‌مانیم تا آبجکت تلگرام آماده شود
        await new Promise(resolve => setTimeout(resolve, 100)); 
        
        const tg = window.Telegram.WebApp;
        tg.ready();
        
        const currentUser = tg.initDataUnsafe?.user;
        if (currentUser) {
          setUser(currentUser);
          const response = await fetch(`/api/user-profile/${currentUser.id}`);
          const data = await response.json();

          if (data) {
            setBalance(data.balance);
            setSpins(data.spins);
          }
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false); // پایان حالت لودینگ
      }
    };

    fetchUserData();
  }, []); // [] یعنی این تابع فقط یک بار هنگام باز شدن برنامه اجرا می‌شود


  // ** این تابع اطلاعات جدید را در سرور ذخیره می‌کند **
  const saveUserData = async (newBalance, newSpins) => {
    if (!user) return; // اگر کاربر شناسایی نشده بود، ذخیره نکن

    try {
      await fetch('/api/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: user.id,
          newBalance: newBalance,
          newSpins: newSpins,
        }),
      });
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  };

  // مثال: یک تابع برای مدیریت نتیجه اسپین
  const handleSpinResult = (reward) => {
    const newBalance = balance + reward;
    const newSpins = spins - 1;

    // اول وضعیت را در صفحه آپدیت می‌کنیم
    setBalance(newBalance);
    setSpins(newSpins);

    // سپس اطلاعات جدید را برای ذخیره‌سازی به سرور می‌فرستیم
    saveUserData(newBalance, newSpins);
  };


  if (loading) {
    return <div>Loading...</div>; // نمایش پیغام لودینگ تا اطلاعات از دیتابیس گرفته شود
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>GoldCoin</h1>
        <p>Welcome, {user ? (user.first_name + ' ' + (user.last_name || '')) : 'Browser'}</p>
        <p>Balance: {balance}</p>
        <p>Spins: {spins}</p>

        {/* اینجا کامپوننت گردونه شانس و بقیه بخش‌های برنامه شما قرار می‌گیرد */}
        {/* برای مثال، یک دکمه برای تست */}
        <button onClick={() => handleSpinResult(50)}>Win 50 Coins</button>
      </header>
    </div>
  );
}

export default App;