const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const app = express();
const port = 3001;

// اطلاعات اتصال به Supabase
const supabaseUrl = 'https://ttlhvoabhpvfrytygffz.supabase.co'; // آدرس Supabase خودتان
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // کلید Supabase خودتان
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());

// ** قابلیت جدید: گرفتن پروفایل کاربر بر اساس آیدی تلگرام **
app.get('/api/user-profile/:telegramId', async (req, res) => {
  const { telegramId } = req.params;

  try {
    // ابتدا آیدی داخلی کاربر را از جدول Users پیدا می‌کنیم
    const { data: user, error: userError } = await supabase
      .from('Users')
      .select('id')
      .eq('telegram_id', telegramId)
      .single();

    if (userError || !user) {
      // اگر کاربر وجود نداشت، یک کاربر جدید می‌سازیم
      const { data: newUser, error: newUserError } = await supabase
        .from('Users')
        .insert([{ telegram_id: telegramId, full_name: `User ${telegramId}` }])
        .select('id')
        .single();
      
      if (newUserError) throw newUserError;

      // حالا برای کاربر جدید یک پروفایل بازی می‌سازیم
      const { data: newProfile, error: newProfileError } = await supabase
        .from('GameProfiles')
        .insert([{ user_id: newUser.id }]) // بالانس و اسپین به صورت پیش‌فرض (0 و 3) اضافه می‌شوند
        .select()
        .single();
      
      if (newProfileError) throw newProfileError;
      return res.status(200).send(newProfile);
    }
    
    // اگر کاربر وجود داشت، پروفایل بازی او را پیدا می‌کنیم
    const { data: profile, error: profileError } = await supabase
      .from('GameProfiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;
    res.status(200).send(profile);

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// ** قابلیت آپدیت کردن پروفایل کاربر **
app.post('/api/update-profile', async (req, res) => {
    const { telegramId, newBalance, newSpins } = req.body;

    if (!telegramId) {
        return res.status(400).send('Telegram ID is required');
    }

    try {
        const { data: user } = await supabase.from('Users').select('id').eq('telegram_id', telegramId).single();
        if (!user) return res.status(404).send('User not found');

        const { data, error } = await supabase
            .from('GameProfiles')
            .update({ balance: newBalance, spins: newSpins })
            .eq('user_id', user.id)
            .select();

        if (error) throw error;
        res.status(200).send(data);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


// این بخش برای اجرای برنامه در محیط Vercel است
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});