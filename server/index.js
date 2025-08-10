const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const app = express();
const port = 3001;

// اطلاعات اتصال به Supabase - مقادیر خودتان را جایگزین کنید
const supabaseUrl = 'https://ttlhvoabhpvfrytygffz.supabase.co';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // کلید anon خود را اینجا قرار دهید
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// قابلیت جدید و اصلی: لاگین یا ساخت کاربر و بازگرداندن پروفایل کامل
app.post('/api/login', async (req, res) => {
  const { telegramId, firstName, lastName, username } = req.body;

  if (!telegramId) {
    return res.status(400).send({ error: 'Telegram ID is required' });
  }

  try {
    // ۱. بررسی می‌کنیم آیا کاربر از قبل وجود دارد یا نه
    let { data: user, error: userSelectError } = await supabase
      .from('Users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    // ۲. اگر کاربر وجود نداشت، او را می‌سازیم
    if (userSelectError || !user) {
      const fullName = `${firstName || ''} ${lastName || ''}`.trim() || username;
      const { data: newUser, error: newUserError } = await supabase
        .from('Users')
        .insert([{ telegram_id: telegramId, full_name: fullName }])
        .select('id')
        .single();
      
      if (newUserError) throw newUserError;
      
      // حالا برای کاربر جدید پروفایل بازی می‌سازیم
      await supabase.from('GameProfiles').insert([{ user_id: newUser.id }]);
      user = newUser; // کاربر جدید را به عنوان کاربر فعلی در نظر می‌گیریم
    }

    // ۳. پروفایل بازی کاربر را پیدا کرده و برمی‌گردانیم
    const { data: profile, error: profileError } = await supabase
      .from('GameProfiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (profileError) throw profileError;
    
    // ۴. اسم کاربر را هم به پروفایل اضافه می‌کنیم تا در فرانت‌اند نمایش دهیم
    const finalResponse = { ...profile, fullName: (await supabase.from('Users').select('full_name').eq('id', user.id).single()).data.full_name };
    res.status(200).send(finalResponse);

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


// قابلیت آپدیت کردن پروفایل کاربر (این کد بدون تغییر باقی می‌ماند)
app.post('/api/update-profile', async (req, res) => {
    // ... (کد این بخش را از پیام قبلی کپی کنید یا بگذارید بماند) ...
});

// بقیه کدهای سرور...
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});