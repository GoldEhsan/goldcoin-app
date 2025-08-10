const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient'); // Import the configured Supabase client

const app = express();
const PORT = process.env.PORT || 3001;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- API ROUTES ---

// GET endpoint to fetch or create a user's data based on their Telegram ID
app.get('/api/user/:userId', async (req, res) => {
  const { userId: telegram_id } = req.params;

  if (!telegram_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    let user, gameProfile, tasks;
    let created = false;

    // 1. Find the user by their Telegram ID, joining related tables
    const { data: existingUser, error: userError } = await supabase
      .from('Users')
      .select(`
        *,
        GameProfiles (
          *,
          Tasks ( * )
        )
      `)
      .eq('telegram_id', telegram_id)
      .maybeSingle(); // Use maybeSingle to avoid an error when no user is found

    if (userError) throw userError;

    if (existingUser) {
        user = existingUser;
        // The result is an array because of the one-to-many relationship, so we take the first profile
        gameProfile = user.GameProfiles[0];
        tasks = gameProfile ? gameProfile.Tasks : [];
        console.log(`Found existing user with Telegram ID: ${telegram_id}.`);

    } else {
        created = true;
        console.log(`New user with Telegram ID: ${telegram_id}. Creating profile...`);

        // 2. If user doesn't exist, create them
        const { data: newUser, error: newUserError } = await supabase
            .from('Users')
            .insert({ telegram_id: telegram_id, full_name: 'Telegram User' })
            .select()
            .single();

        if (newUserError) throw newUserError;
        user = newUser;

        // 3. Create their game profile
        const { data: newProfile, error: newProfileError } = await supabase
            .from('GameProfiles')
            .insert({ user_id: user.id })
            .select()
            .single();

        if (newProfileError) throw newProfileError;
        gameProfile = newProfile;

        // 4. Create default tasks for them
        const defaultTasks = [
            { profile_id: gameProfile.id, title: 'Win your first game!', reward: 50 },
            { profile_id: gameProfile.id, title: 'Invite a Friend', reward: 50 },
            { profile_id: gameProfile.id, title: 'Spin the Wheel 3 Times', reward: 20 },
        ];
        const { data: newTasks, error: newTasksError } = await supabase
            .from('Tasks')
            .insert(defaultTasks)
            .select();

        if (newTasksError) throw newTasksError;
        tasks = newTasks;
    }

    // 5. Format the response to match the frontend's expected structure
    const responseData = {
      balance: gameProfile.balance,
      spins: gameProfile.spins,
      isVip: gameProfile.is_vip,
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        reward: t.reward,
        completed: t.completed,
      })),
    };

    const statusCode = created ? 201 : 200;
    res.status(statusCode).json(responseData);

  } catch (error) {
    console.error(`Error processing user ${telegram_id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- SERVER STARTUP ---
// Vercel handles the server listening, so we just need to export the app.
module.exports = app;
