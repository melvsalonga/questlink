#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testQuestCreationPerformance() {
  console.log('⚡ Testing Quest Creation Performance...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('Step 1: Authenticating user...');
    const startAuth = Date.now();
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@questlink.com',
      password: 'admin123'
    });

    if (loginError) {
      console.log(`❌ Login failed: ${loginError.message}`);
      return;
    }

    const authTime = Date.now() - startAuth;
    console.log(`✅ Authentication completed in ${authTime}ms`);

    const userId = loginData.user.id;

    console.log('\nStep 2: Testing quest creation performance...');
    
    const questData = {
      quest_owner_id: userId,
      title: 'Performance Test Quest',
      description: 'This is a test quest to measure creation performance and identify any bottlenecks.',
      start_date: '2025-07-01',
      end_date: '2025-07-15',
      start_time: '09:00',
      end_time: '17:00',
      pricing: 5000,
      tags: ['Performance', 'Testing', 'Database'],
      status: 'open',
      location: 'Test Location',
      requirements: 'Performance testing requirements'
    };

    // Test multiple quest creations to measure average performance
    const numTests = 5;
    const times = [];

    for (let i = 0; i < numTests; i++) {
      const startCreate = Date.now();
      
      const { data: questResult, error: questError } = await supabase
        .from('quests')
        .insert([{
          ...questData,
          title: `${questData.title} #${i + 1}`
        }])
        .select()
        .single();

      const createTime = Date.now() - startCreate;
      times.push(createTime);

      if (questError) {
        console.log(`❌ Quest creation ${i + 1} failed: ${questError.message}`);
      } else {
        console.log(`✅ Quest ${i + 1} created in ${createTime}ms`);
        
        // Clean up immediately
        await supabase.from('quests').delete().eq('id', questResult.id);
      }
    }

    console.log('\nStep 3: Performance Analysis...');
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    console.log(`📊 Performance Results:`);
    console.log(`   Average time: ${avgTime.toFixed(2)}ms`);
    console.log(`   Fastest time: ${minTime}ms`);
    console.log(`   Slowest time: ${maxTime}ms`);
    console.log(`   Total tests: ${numTests}`);

    // Performance assessment
    if (avgTime < 500) {
      console.log(`✅ Performance: Excellent (< 500ms)`);
    } else if (avgTime < 1000) {
      console.log(`✅ Performance: Good (< 1s)`);
    } else if (avgTime < 2000) {
      console.log(`⚠️  Performance: Acceptable (< 2s)`);
    } else {
      console.log(`❌ Performance: Slow (> 2s) - Investigation needed`);
    }

    console.log('\nStep 4: Testing quest fetching performance...');
    
    // Create a test quest for fetching
    const { data: testQuest, error: createError } = await supabase
      .from('quests')
      .insert([questData])
      .select()
      .single();

    if (createError) {
      console.log(`❌ Test quest creation failed: ${createError.message}`);
      return;
    }

    // Test quest fetching with relations
    const startFetch = Date.now();
    
    const { data: fetchedQuest, error: fetchError } = await supabase
      .from('quests')
      .select(`
        *,
        users!quest_owner_id (
          first_name,
          last_name,
          profiles (
            profile_picture,
            location
          )
        )
      `)
      .eq('id', testQuest.id)
      .single();

    const fetchTime = Date.now() - startFetch;

    if (fetchError) {
      console.log(`❌ Quest fetch failed: ${fetchError.message}`);
    } else {
      console.log(`✅ Quest fetched with relations in ${fetchTime}ms`);
    }

    // Clean up test quest
    await supabase.from('quests').delete().eq('id', testQuest.id);

    console.log('\nStep 5: Testing database connection latency...');
    
    const pingTimes = [];
    for (let i = 0; i < 3; i++) {
      const startPing = Date.now();
      
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      const pingTime = Date.now() - startPing;
      pingTimes.push(pingTime);

      if (!error) {
        console.log(`✅ Database ping ${i + 1}: ${pingTime}ms`);
      }
    }

    const avgPing = pingTimes.reduce((a, b) => a + b, 0) / pingTimes.length;
    console.log(`📊 Average database latency: ${avgPing.toFixed(2)}ms`);

    // Sign out
    await supabase.auth.signOut();

    console.log('\n🎉 Performance Test Complete!');
    console.log('\n📋 Summary:');
    console.log(`✅ Authentication time: ${authTime}ms`);
    console.log(`✅ Average quest creation: ${avgTime.toFixed(2)}ms`);
    console.log(`✅ Quest fetch with relations: ${fetchTime}ms`);
    console.log(`✅ Average database latency: ${avgPing.toFixed(2)}ms`);

    console.log('\n💡 Performance Tips:');
    if (avgTime > 1000) {
      console.log('- Consider adding database indexes for quest creation');
      console.log('- Check network latency to Supabase');
      console.log('- Optimize RLS policies if needed');
    }
    if (fetchTime > 500) {
      console.log('- Consider optimizing the quest fetch query');
      console.log('- Add indexes for foreign key relationships');
    }
    if (avgPing > 200) {
      console.log('- High database latency detected');
      console.log('- Check internet connection');
      console.log('- Consider using a closer Supabase region');
    }

  } catch (error) {
    console.log('❌ Unexpected error during performance testing:', error.message);
  }
}

testQuestCreationPerformance().catch(console.error);
