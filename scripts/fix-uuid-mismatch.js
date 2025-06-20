#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function fixUuidMismatch() {
  console.log('🔧 Fixing UUID Mismatch Issues...\n');

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
    console.log('Step 1: Getting auth users...');
    
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error listing auth users:', authError.message);
      return;
    }

    console.log(`Found ${authUsers.users.length} auth users`);

    console.log('\nStep 2: Getting database users...');
    
    // Get all database users
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, created_at');

    if (dbError) {
      console.log('❌ Error fetching database users:', dbError.message);
      return;
    }

    console.log(`Found ${dbUsers.length} database users`);

    console.log('\nStep 3: Analyzing mismatches...');
    
    const mismatches = [];
    
    for (const authUser of authUsers.users) {
      const dbUser = dbUsers.find(u => u.email === authUser.email);
      
      if (dbUser && dbUser.id !== authUser.id) {
        mismatches.push({
          email: authUser.email,
          authId: authUser.id,
          dbId: dbUser.id,
          authUser,
          dbUser
        });
      }
    }

    console.log(`Found ${mismatches.length} UUID mismatches:`);
    mismatches.forEach(mismatch => {
      console.log(`  - ${mismatch.email}`);
      console.log(`    Auth ID: ${mismatch.authId.substring(0, 8)}...`);
      console.log(`    DB ID:   ${mismatch.dbId.substring(0, 8)}...`);
    });

    if (mismatches.length === 0) {
      console.log('✅ No UUID mismatches found!');
      return;
    }

    console.log('\nStep 4: Fixing mismatches...');
    
    let fixedCount = 0;
    let errorCount = 0;

    for (const mismatch of mismatches) {
      try {
        console.log(`\nFixing ${mismatch.email}...`);
        
        // First, delete the old database user and related data
        console.log('  🗑️  Deleting old database user...');
        
        // Delete related data first (due to foreign key constraints)
        await supabase.from('profiles').delete().eq('user_id', mismatch.dbId);
        await supabase.from('skills').delete().eq('user_id', mismatch.dbId);
        await supabase.from('quests').delete().eq('quest_owner_id', mismatch.dbId);
        await supabase.from('services').delete().eq('service_provider_id', mismatch.dbId);
        await supabase.from('my_quests').delete().eq('user_id', mismatch.dbId);
        await supabase.from('my_requests').delete().eq('requester_id', mismatch.dbId);
        
        // Delete the user
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', mismatch.dbId);

        if (deleteError) {
          console.log(`    ❌ Error deleting old user: ${deleteError.message}`);
          errorCount++;
          continue;
        }

        console.log('  ✅ Old user deleted');

        // Create new user with correct auth ID
        console.log('  ➕ Creating new user with correct ID...');
        
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: mismatch.authId,
            email: mismatch.authUser.email,
            first_name: mismatch.authUser.user_metadata?.first_name || mismatch.dbUser.first_name || 'User',
            last_name: mismatch.authUser.user_metadata?.last_name || mismatch.dbUser.last_name || '',
            mobile_number: mismatch.authUser.user_metadata?.mobile_number || '',
            password_hash: 'managed_by_supabase_auth',
            is_questor: true,
            is_service_provider: false,
            complete_address: mismatch.authUser.user_metadata?.complete_address || '',
            user_role: 'base',
            is_verified: mismatch.authUser.email_confirmed_at ? true : false
          });

        if (createUserError) {
          console.log(`    ❌ Error creating new user: ${createUserError.message}`);
          errorCount++;
          continue;
        }

        console.log('  ✅ New user created');

        // Create profile
        console.log('  ➕ Creating profile...');
        
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            user_id: mismatch.authId,
            description: '',
            location: mismatch.authUser.user_metadata?.location || '',
            social_links: []
          });

        if (createProfileError) {
          console.log(`    ⚠️  Profile creation failed: ${createProfileError.message}`);
        } else {
          console.log('  ✅ Profile created');
        }

        fixedCount++;
        console.log(`  ✅ Fixed ${mismatch.email}`);

      } catch (err) {
        console.log(`  ❌ Unexpected error fixing ${mismatch.email}: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Fix Results:`);
    console.log(`✅ Fixed: ${fixedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

    console.log('\nStep 5: Verifying fixes...');
    
    // Re-run the mismatch check
    const { data: newDbUsers, error: newDbError } = await supabase
      .from('users')
      .select('id, email');

    if (newDbError) {
      console.log('❌ Error verifying fixes:', newDbError.message);
      return;
    }

    const newMismatches = [];
    for (const authUser of authUsers.users) {
      const dbUser = newDbUsers.find(u => u.email === authUser.email);
      if (dbUser && dbUser.id !== authUser.id) {
        newMismatches.push({ email: authUser.email });
      }
    }

    if (newMismatches.length === 0) {
      console.log('✅ All UUID mismatches fixed!');
    } else {
      console.log(`⚠️  ${newMismatches.length} mismatches still exist`);
    }

    console.log('\n🎉 UUID mismatch fix completed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Mismatches found: ${mismatches.length}`);
    console.log(`✅ Mismatches fixed: ${fixedCount}`);
    console.log(`✅ Remaining mismatches: ${newMismatches.length}`);

    console.log('\n🚀 Next Steps:');
    console.log('1. Test login with sample credentials');
    console.log('2. Run: npm run test-complete-auth');
    console.log('3. Check if profile fetching works correctly');

  } catch (error) {
    console.log('❌ Unexpected error during UUID fix:', error.message);
  }
}

fixUuidMismatch().catch(console.error);
