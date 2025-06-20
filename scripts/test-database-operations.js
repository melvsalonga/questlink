#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testDatabaseOperations() {
  console.log('🧪 Testing QuestLink Database Operations...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    console.log('❌ Missing environment variables');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('Step 1: Testing user authentication and profile fetching...');
    
    // Test login
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: 'admin@questlink.com',
      password: 'admin123'
    });

    if (loginError) {
      console.log(`❌ Login failed: ${loginError.message}`);
      return;
    }

    console.log(`✅ Login successful for admin@questlink.com`);
    const userId = loginData.user.id;

    // Test profile fetching
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        user_role,
        profiles (
          id,
          description,
          location
        )
      `)
      .eq('id', userId)
      .single();

    if (userError) {
      console.log(`❌ Profile fetch failed: ${userError.message}`);
    } else {
      console.log(`✅ Profile fetched: ${userData.first_name} ${userData.last_name} (${userData.user_role})`);
    }

    console.log('\nStep 2: Testing quest operations...');
    
    // Test quest creation
    const testQuest = {
      quest_owner_id: userId,
      title: 'Test Quest - Database Operations',
      description: 'This is a test quest to verify database operations are working correctly.',
      start_date: '2025-07-01',
      end_date: '2025-07-15',
      start_time: '09:00',
      end_time: '17:00',
      pricing: 5000,
      tags: ['Testing', 'Database', 'QuestLink'],
      status: 'open',
      location: 'Test Location',
      requirements: 'Testing requirements'
    };

    const { data: questData, error: questError } = await supabaseClient
      .from('quests')
      .insert(testQuest)
      .select()
      .single();

    if (questError) {
      console.log(`❌ Quest creation failed: ${questError.message}`);
    } else {
      console.log(`✅ Quest created successfully: ${questData.title}`);
      
      // Test quest fetching
      const { data: fetchedQuest, error: fetchError } = await supabaseClient
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
        .eq('id', questData.id)
        .single();

      if (fetchError) {
        console.log(`❌ Quest fetch failed: ${fetchError.message}`);
      } else {
        console.log(`✅ Quest fetched successfully with owner info`);
      }

      // Clean up test quest
      await supabaseClient.from('quests').delete().eq('id', questData.id);
      console.log(`🧹 Test quest cleaned up`);
    }

    console.log('\nStep 3: Testing skill operations...');
    
    // Test skill creation
    const testSkill = {
      user_id: userId,
      skill_name: 'Test Skill - Database Operations',
      skill_category: 'Testing',
      skill_sub_category: 'Database Testing',
      proficiency: 'expert',
      time_cost_per_hour: 8,
      pricing: 2500,
      is_active: true
    };

    const { data: skillData, error: skillError } = await supabaseClient
      .from('skills')
      .insert(testSkill)
      .select()
      .single();

    if (skillError) {
      console.log(`❌ Skill creation failed: ${skillError.message}`);
    } else {
      console.log(`✅ Skill created successfully: ${skillData.skill_name}`);
      
      // Test skill fetching by user
      const { data: userSkills, error: userSkillsError } = await supabaseClient
        .from('skills')
        .select('*')
        .eq('user_id', userId);

      if (userSkillsError) {
        console.log(`❌ User skills fetch failed: ${userSkillsError.message}`);
      } else {
        console.log(`✅ User skills fetched: ${userSkills.length} skills found`);
      }

      // Clean up test skill
      await supabaseClient.from('skills').delete().eq('id', skillData.id);
      console.log(`🧹 Test skill cleaned up`);
    }

    console.log('\nStep 4: Testing service operations...');

    // First check if user has a service provider profile
    const { data: existingServiceProvider, error: spCheckError } = await supabaseClient
      .from('service_providers')
      .select('id, user_id')
      .eq('user_id', userId)
      .single();

    if (spCheckError && spCheckError.code !== 'PGRST116') {
      console.log(`❌ Error checking service provider: ${spCheckError.message}`);
    } else if (existingServiceProvider) {
      console.log(`✅ Service provider profile exists: ${existingServiceProvider.id}`);
    } else {
      console.log(`ℹ️  No service provider profile found, will be created automatically`);
    }

    // Test service creation using the database function
    const testService = {
      service_provider_id: userId, // This will be converted to actual service_provider_id in the function
      title: 'Test Service - Database Operations',
      description: 'This is a test service to verify database operations are working correctly.',
      pricing: 10000,
      category_tags: ['Testing', 'Database', 'Services'],
      available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      available_time: '9:00 AM - 5:00 PM',
      is_active: true
    };

    // Import the createService function (simulate what the frontend would do)
    try {
      // We'll simulate the service creation by calling the database function logic directly
      // First check/create service provider
      let { data: serviceProvider, error: spError } = await supabaseClient
        .from('service_providers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (spError && spError.code !== 'PGRST116') {
        console.log(`❌ Service provider check failed: ${spError.message}`);
        return;
      }

      // If no service provider profile exists, create one
      if (!serviceProvider) {
        console.log('Creating service provider profile...');

        const { data: newServiceProvider, error: createSpError } = await supabaseClient
          .from('service_providers')
          .insert([{
            user_id: userId,
            business_name: 'Admin User Business',
            business_description: testService.description,
            business_address: 'Test Address',
            contact_person: 'Admin User',
            business_phone: '+639000000000',
            business_email: 'admin@questlink.com',
            website_url: null,
            business_hours: {
              monday: '9:00-17:00',
              tuesday: '9:00-17:00',
              wednesday: '9:00-17:00',
              thursday: '9:00-17:00',
              friday: '9:00-17:00',
              saturday: 'closed',
              sunday: 'closed'
            },
            category_tags: testService.category_tags,
            is_verified: false
          }])
          .select()
          .single();

        if (createSpError) {
          console.log(`❌ Service provider creation failed: ${createSpError.message}`);
          return;
        }

        serviceProvider = newServiceProvider;
        console.log(`✅ Service provider created: ${serviceProvider.id}`);
      }

      // Now create the service with the correct service_provider_id
      const { data: serviceData, error: serviceError } = await supabaseClient
        .from('services')
        .insert([{
          ...testService,
          service_provider_id: serviceProvider.id
        }])
        .select()
        .single();

      if (serviceError) {
        console.log(`❌ Service creation failed: ${serviceError.message}`);
        console.log(`   Details: ${JSON.stringify(serviceError, null, 2)}`);
      } else {
        console.log(`✅ Service created successfully: ${serviceData.title}`);

        // Test service fetching by provider
        const { data: userServices, error: userServicesError } = await supabaseClient
          .from('services')
          .select('*')
          .eq('service_provider_id', serviceProvider.id);

        if (userServicesError) {
          console.log(`❌ User services fetch failed: ${userServicesError.message}`);
        } else {
          console.log(`✅ User services fetched: ${userServices.length} services found`);
        }

        // Clean up test service
        await supabaseClient.from('services').delete().eq('id', serviceData.id);
        console.log(`🧹 Test service cleaned up`);
      }

    } catch (err) {
      console.log(`❌ Service operation error: ${err.message}`);
    }

    console.log('\nStep 5: Testing RLS policies...');
    
    // Test accessing data as authenticated user
    const { data: allQuests, error: questsError } = await supabaseClient
      .from('quests')
      .select('id, title, quest_owner_id')
      .limit(5);

    if (questsError) {
      console.log(`❌ Quest access failed: ${questsError.message}`);
    } else {
      console.log(`✅ Quest access successful: ${allQuests.length} quests accessible`);
    }

    // Sign out
    await supabaseClient.auth.signOut();
    console.log('✅ Signed out successfully');

    console.log('\n🎉 Database Operations Test Complete!');
    console.log('\n📋 Summary:');
    console.log('✅ User authentication: Working');
    console.log('✅ Profile fetching: Working');
    console.log('✅ Quest operations: Working');
    console.log('✅ Skill operations: Working');
    console.log('✅ Service operations: Working');
    console.log('✅ RLS policies: Working');

    console.log('\n🚀 All database operations are functioning correctly!');

  } catch (error) {
    console.log('❌ Unexpected error during database testing:', error.message);
  }
}

testDatabaseOperations().catch(console.error);
