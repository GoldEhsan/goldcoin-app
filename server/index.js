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
      .from('users')
      .select(`
        *,
        gameprofiles (
          *,
          tasks ( * )
        )
      `)
      .eq('telegram_id', telegram_id)
      .maybeSingle(); // Use maybeSingle to avoid an error when no user is found

    if (userError) throw userError;

    if (existingUser) {
        user = existingUser;
        // The result is an array because of the one-to-many relationship, so we take the first profile
        gameProfile = user.gameprofiles[0];
        tasks = gameProfile ? gameProfile.tasks : [];
        console.log(`Found existing user with Telegram ID: ${telegram_id}.`);

    } else {
        created = true;
        console.log(`New user with Telegram ID: ${telegram_id}. Creating profile...`);

        // 2. If user doesn't exist, create them
        const { data: newUser, error: newUserError } = await supabase
            .from('users')
            .insert({ telegram_id: telegram_id, full_name: 'Telegram User' })
            .select()
            .single();

        if (newUserError) throw newUserError;
        user = newUser;

        // 3. Create their game profile
        const { data: newProfile, error: newProfileError } = await supabase
            .from('gameprofiles')
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
            .from('tasks')
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

// PATCH endpoint to update a user's game profile (balance, spins)
app.patch('/api/user/:userId/profile', async (req, res) => {
  const { userId: telegram_id } = req.params;
  const { balance, spins } = req.body;

  console.log(`[PATCH] Received request for user: ${telegram_id}`);
  console.log(`[PATCH] Request body:`, req.body);

  if (!telegram_id) {
    console.log('[PATCH] Error: User ID is required.');
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    // 1. Find the user by their Telegram ID to get the associated GameProfile ID
    console.log(`[PATCH] Step 1: Finding user with telegram_id: ${telegram_id}`);
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, gameprofiles ( id )')
      .eq('telegram_id', telegram_id)
      .single();

    if (userError) {
        console.log('[PATCH] Supabase error while finding user:', userError);
        throw userError;
    }
    if (!user) {
      console.log('[PATCH] Error: User not found in database.');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log(`[PATCH] Found user with internal ID: ${user.id}`);

    const gameProfileId = user.gameprofiles[0]?.id;
    if (!gameProfileId) {
        console.log(`[PATCH] Error: No game profile found for user ID: ${user.id}`);
      return res.status(404).json({ error: 'Game profile not found for this user' });
    }
    console.log(`[PATCH] Found game profile with ID: ${gameProfileId}`);

    // 2. Create an object with only the fields to be updated
    const updates = {};
    if (balance !== undefined) updates.balance = balance;
    if (spins !== undefined) updates.spins = spins;

    if (Object.keys(updates).length === 0) {
        console.log('[PATCH] Error: No valid update data provided.');
      return res.status(400).json({ error: 'No update data provided' });
    }
    console.log('[PATCH] Step 2: Preparing updates:', updates);

    // 3. Update the specific row in the GameProfiles table
    console.log(`[PATCH] Step 3: Updating gameprofiles table for id: ${gameProfileId}`);
    const { data: updatedProfile, error: updateError } = await supabase
      .from('gameprofiles')
      .update(updates)
      .eq('id', gameProfileId)
      .select()
      .single();

    if (updateError) {
        console.log('[PATCH] Supabase error during update:', updateError);
        throw updateError;
    }

    console.log(`[PATCH] Successfully updated profile for user ${telegram_id}. Result:`, updatedProfile);
    res.status(200).json(updatedProfile);

  } catch (error) {
    console.error(`[PATCH] Final catch block error for user ${telegram_id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- SERVER STARTUP ---
// Vercel handles the server listening, so we just need to export the app.
module.exports = app;
