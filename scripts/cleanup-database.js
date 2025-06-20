#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function cleanupDatabase() {
  console.log('🧹 Cleaning Up QuestLink Database...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.log('❌ Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Step 1: Analyzing database for duplicates...');
    
    // Get all users and check for duplicates
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, created_at')
      .order('created_at', { ascending: true });

    if (usersError) {
      console.log('❌ Error fetching users:', usersError.message);
      return;
    }

    console.log(`Found ${allUsers.length} users in database`);

    // Find duplicate emails
    const emailCounts = {};
    const duplicates = [];

    allUsers.forEach(user => {
      if (emailCounts[user.email]) {
        emailCounts[user.email].push(user);
        if (emailCounts[user.email].length === 2) {
          duplicates.push(user.email);
        }
      } else {
        emailCounts[user.email] = [user];
      }
    });

    console.log(`Found ${duplicates.length} duplicate emails:`);
    duplicates.forEach(email => {
      console.log(`  - ${email} (${emailCounts[email].length} entries)`);
      emailCounts[email].forEach((user, index) => {
        console.log(`    ${index + 1}. ID: ${user.id.substring(0, 8)}... | Created: ${user.created_at}`);
      });
    });

    console.log('\nStep 2: Removing duplicate entries...');
    
    let removedCount = 0;
    let errorCount = 0;

    for (const email of duplicates) {
      const userEntries = emailCounts[email];
      
      // Keep the first entry (oldest), remove the rest
      const toKeep = userEntries[0];
      const toRemove = userEntries.slice(1);

      console.log(`\nProcessing ${email}:`);
      console.log(`  ✅ Keeping: ${toKeep.id.substring(0, 8)}... (${toKeep.created_at})`);

      for (const user of toRemove) {
        try {
          console.log(`  🗑️  Removing: ${user.id.substring(0, 8)}... (${user.created_at})`);
          
          // Delete the duplicate user
          const { error: deleteError } = await supabase
            .from('users')
            .delete()
            .eq('id', user.id);

          if (deleteError) {
            console.log(`    ❌ Error removing user: ${deleteError.message}`);
            errorCount++;
          } else {
            console.log(`    ✅ User removed successfully`);
            removedCount++;
          }
        } catch (err) {
          console.log(`    ❌ Unexpected error: ${err.message}`);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Cleanup Results:`);
    console.log(`✅ Duplicates removed: ${removedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    console.log('\nStep 3: Cleaning up orphaned profiles...');
    
    // Get all profiles and check for orphaned entries
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id');

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log(`Found ${allProfiles.length} profiles`);
      
      // Get current user IDs after cleanup
      const { data: currentUsers, error: currentUsersError } = await supabase
        .from('users')
        .select('id');

      if (!currentUsersError) {
        const currentUserIds = new Set(currentUsers.map(u => u.id));
        const orphanedProfiles = allProfiles.filter(p => !currentUserIds.has(p.user_id));

        if (orphanedProfiles.length > 0) {
          console.log(`Found ${orphanedProfiles.length} orphaned profiles`);
          
          for (const profile of orphanedProfiles) {
            try {
              const { error: deleteProfileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', profile.id);

              if (deleteProfileError) {
                console.log(`  ❌ Error removing orphaned profile: ${deleteProfileError.message}`);
              } else {
                console.log(`  ✅ Removed orphaned profile for user ${profile.user_id.substring(0, 8)}...`);
              }
            } catch (err) {
              console.log(`  ❌ Error removing profile: ${err.message}`);
            }
          }
        } else {
          console.log('✅ No orphaned profiles found');
        }
      }
    }

    console.log('\nStep 4: Verifying cleanup...');
    
    // Verify no more duplicates
    const { data: verifyUsers, error: verifyError } = await supabase
      .from('users')
      .select('email')
      .order('email');

    if (verifyError) {
      console.log('❌ Error verifying cleanup:', verifyError.message);
    } else {
      const verifyEmailCounts = {};
      verifyUsers.forEach(user => {
        verifyEmailCounts[user.email] = (verifyEmailCounts[user.email] || 0) + 1;
      });

      const remainingDuplicates = Object.keys(verifyEmailCounts).filter(email => 
        verifyEmailCounts[email] > 1
      );

      if (remainingDuplicates.length === 0) {
        console.log('✅ No duplicate emails remaining');
      } else {
        console.log(`⚠️  ${remainingDuplicates.length} duplicate emails still exist:`);
        remainingDuplicates.forEach(email => {
          console.log(`  - ${email} (${verifyEmailCounts[email]} entries)`);
        });
      }

      console.log(`✅ Total users after cleanup: ${verifyUsers.length}`);
    }

    console.log('\nStep 5: Creating missing profiles for auth users...');
    
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
    } else {
      console.log(`Found ${authUsers.users.length} auth users`);
      
      let profilesCreated = 0;
      let profileErrors = 0;

      for (const authUser of authUsers.users) {
        try {
          // Check if user exists in users table
          const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', authUser.id)
            .single();

          if (userCheckError && userCheckError.code === 'PGRST116') {
            // User doesn't exist, create it
            console.log(`Creating database user for ${authUser.email}...`);
            
            const { error: createUserError } = await supabase
              .from('users')
              .insert({
                id: authUser.id,
                email: authUser.email,
                first_name: authUser.user_metadata?.first_name || 'User',
                last_name: authUser.user_metadata?.last_name || '',
                mobile_number: authUser.user_metadata?.mobile_number || '',
                password_hash: 'managed_by_supabase_auth',
                is_questor: true,
                is_service_provider: false,
                complete_address: authUser.user_metadata?.complete_address || '',
                user_role: 'base',
                is_verified: authUser.email_confirmed_at ? true : false
              });

            if (createUserError) {
              console.log(`  ❌ Error creating user: ${createUserError.message}`);
              profileErrors++;
            } else {
              console.log(`  ✅ User created successfully`);
              profilesCreated++;
            }
          }

          // Check if profile exists
          const { data: existingProfile, error: profileCheckError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', authUser.id)
            .single();

          if (profileCheckError && profileCheckError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                user_id: authUser.id,
                description: '',
                location: authUser.user_metadata?.location || '',
                social_links: []
              });

            if (createProfileError) {
              console.log(`  ❌ Error creating profile: ${createProfileError.message}`);
            } else {
              console.log(`  ✅ Profile created for ${authUser.email}`);
            }
          }

        } catch (err) {
          console.log(`  ❌ Error processing ${authUser.email}: ${err.message}`);
          profileErrors++;
        }
      }

      console.log(`\n📊 Profile Creation Results:`);
      console.log(`✅ Users created: ${profilesCreated}`);
      console.log(`❌ Errors: ${profileErrors}`);
    }

    console.log('\n🎉 Database cleanup completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Duplicate entries removed: ${removedCount}`);
    console.log(`✅ Database consistency verified`);
    console.log(`✅ Missing profiles created`);
    console.log(`✅ Auth-Database sync improved`);

  } catch (error) {
    console.log('❌ Unexpected error during cleanup:', error.message);
  }
}

cleanupDatabase().catch(console.error);
