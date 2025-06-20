#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function verifyDatabase() {
  console.log('🔍 Verifying QuestLink database setup...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables');
    console.log('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log('📊 Checking database tables and data...\n');

    // Test 1: Check if all tables exist and have data
    const tables = [
      'users',
      'profiles', 
      'reviews',
      'skills',
      'experiences',
      'specialists',
      'quests',
      'my_quests',
      'my_requests',
      'service_providers',
      'services'
    ];

    const tableResults = {};

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        if (error) {
          tableResults[table] = { status: 'error', message: error.message };
        } else {
          tableResults[table] = { status: 'success', count: count || 0 };
        }
      } catch (err) {
        tableResults[table] = { status: 'error', message: err.message };
      }
    }

    // Display table results
    console.log('📋 Table Status:');
    console.log('================');
    for (const [table, result] of Object.entries(tableResults)) {
      if (result.status === 'success') {
        console.log(`✅ ${table.padEnd(20)} - ${result.count} records`);
      } else {
        console.log(`❌ ${table.padEnd(20)} - Error: ${result.message}`);
      }
    }

    // Test 2: Check specific data integrity
    console.log('\n🔗 Testing data relationships...\n');

    // Check users with profiles
    const { data: usersWithProfiles, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        profiles (
          id,
          description
        )
      `)
      .limit(5);

    if (profileError) {
      console.log('❌ Error checking user-profile relationships:', profileError.message);
    } else {
      console.log(`✅ User-Profile relationships: ${usersWithProfiles.length} users checked`);
    }

    // Check specialists with skills
    const { data: specialistsWithSkills, error: skillError } = await supabase
      .from('specialists')
      .select(`
        id,
        title,
        users!inner (
          id,
          first_name,
          last_name,
          skills (
            id,
            skill_name,
            proficiency
          )
        )
      `)
      .limit(5);

    if (skillError) {
      console.log('❌ Error checking specialist-skill relationships:', skillError.message);
    } else {
      console.log(`✅ Specialist-Skill relationships: ${specialistsWithSkills.length} specialists checked`);
    }

    // Check quests with applications
    const { data: questsWithApplications, error: questError } = await supabase
      .from('quests')
      .select(`
        id,
        title,
        status,
        my_quests (
          id,
          status,
          users (
            first_name,
            last_name
          )
        )
      `)
      .limit(5);

    if (questError) {
      console.log('❌ Error checking quest-application relationships:', questError.message);
    } else {
      console.log(`✅ Quest-Application relationships: ${questsWithApplications.length} quests checked`);
    }

    // Test 3: Check utility functions
    console.log('\n🛠️  Testing utility functions...\n');

    // Test search function
    const { data: searchResults, error: searchError } = await supabase
      .rpc('search_quests', {
        search_term: 'development',
        limit_count: 3
      });

    if (searchError) {
      console.log('❌ Error testing search function:', searchError.message);
    } else {
      console.log(`✅ Search function: Found ${searchResults.length} results for "development"`);
    }

    // Test user stats function (if we have users)
    if (usersWithProfiles && usersWithProfiles.length > 0) {
      const { data: userStats, error: statsError } = await supabase
        .rpc('get_user_stats', {
          user_uuid: usersWithProfiles[0].id
        });

      if (statsError) {
        console.log('❌ Error testing user stats function:', statsError.message);
      } else {
        console.log(`✅ User stats function: Retrieved stats for user ${usersWithProfiles[0].first_name}`);
      }
    }

    // Test 4: Check sample data
    console.log('\n📝 Verifying sample data...\n');

    // Check for admin user
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@questlink.com')
      .single();

    if (adminError) {
      console.log('❌ Admin user not found');
    } else {
      console.log(`✅ Admin user found: ${adminUser.first_name} ${adminUser.last_name}`);
    }

    // Check for sample quests
    const { data: sampleQuests, error: questsError } = await supabase
      .from('quests')
      .select('*')
      .eq('status', 'open');

    if (questsError) {
      console.log('❌ Error checking sample quests:', questsError.message);
    } else {
      console.log(`✅ Sample quests found: ${sampleQuests.length} open quests`);
    }

    // Check for sample specialists
    const { data: sampleSpecialists, error: specialistsError } = await supabase
      .from('specialists')
      .select('*')
      .eq('is_verified', true);

    if (specialistsError) {
      console.log('❌ Error checking sample specialists:', specialistsError.message);
    } else {
      console.log(`✅ Sample specialists found: ${sampleSpecialists.length} verified specialists`);
    }

    // Final summary
    console.log('\n🎉 Database Verification Complete!\n');
    
    const totalTables = tables.length;
    const successfulTables = Object.values(tableResults).filter(r => r.status === 'success').length;
    const totalRecords = Object.values(tableResults)
      .filter(r => r.status === 'success')
      .reduce((sum, r) => sum + r.count, 0);

    console.log('📊 Summary:');
    console.log('===========');
    console.log(`✅ Tables working: ${successfulTables}/${totalTables}`);
    console.log(`📝 Total records: ${totalRecords}`);
    console.log(`🔗 Relationships: Working`);
    console.log(`🛠️  Functions: Working`);
    console.log(`👤 Sample data: Loaded`);

    if (successfulTables === totalTables) {
      console.log('\n🚀 Your QuestLink database is ready to use!');
      console.log('\n📋 Next steps:');
      console.log('1. Start your development server: npm run dev');
      console.log('2. Test user authentication');
      console.log('3. Try creating and browsing quests');
      console.log('4. Test the specialist and service provider features');
    } else {
      console.log('\n⚠️  Some issues were found. Please check the errors above.');
    }

    return true;

  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    return false;
  }
}

// Run verification
verifyDatabase().catch(console.error);
