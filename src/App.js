import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [balance, setBalance] = useState(0);
  const [spins, setSpins] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loginAndFetchData = async () => {
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          
          const currentUser = tg.initDataUnsafe?.user;

          if (currentUser) {
            // اطلاعات کامل کاربر را به سرور می‌فرستیم
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegramId: currentUser.id,
                firstName: currentUser.first_name,
                lastName: currentUser.last_name,
                username: currentUser.username,
              }),
            });

            if (!response.ok) throw new Error('Failed to login');
            
            const data = await response.json();
            
            // وضعیت برنامه را با اطلاعات دریافتی آپدیت می‌کنیم
            setBalance(data.balance);
            setSpins(data.spins);
            setUser({ ...currentUser, fullName: data.fullName }); // اسم کامل را هم ذخیره می‌کنیم
          } else {
             setUser({ fullName: 'Guest' });
          }
        } else {
           setUser({ fullName: 'Guest' });
        }
      } catch (error) {
        console.error("Login failed:", error);
      } finally {
        setLoading(false);
      }
    };

    loginAndFetchData();
  }, []);

  // تابع ذخیره‌سازی بدون تغییر باقی می‌ماند
  const saveUserData = async (newBalance, newSpins) => {
      // ... (کد این بخش را از پیام قبلی کپی کنید یا بگذارید بماند) ...
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
       {/* حالا می‌توانید اسم کامل را نمایش دهید */}
       <p>Welcome, {user ? user.fullName : 'Guest'}</p>
       <p>Balance: {balance}</p>
       {/* بقیه کدهای UI شما ... */}
    </div>
  );
}

export default App;