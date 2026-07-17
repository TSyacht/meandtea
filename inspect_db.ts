import { createClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://ftqyzxrvghfdspgjampd.supabase.co';
const DEFAULT_KEY = 'sb_publishable_PRsJAks9Nw0fcT7Bvd0Y2Q_abzmKtne';

const supabase = createClient(DEFAULT_URL, DEFAULT_KEY);

async function main() {
  console.log("Checking settings table keys...");
  const { data: settingsData, error: settingsError } = await supabase
    .from('settings')
    .select('*');
  
  if (settingsError) {
    console.error("Settings error:", settingsError);
  } else {
    console.log("Settings keys:", settingsData.map(d => d.key));
  }

  const possibleTables = [
    'profiles', 'beginner_village', 'user_village_results', 'novice_village', 
    'user_village_scores', 'beginner_village_answers', 'village_results',
    'beginner_village_results', 'test_results', 'user_profiles', 'avatar_management',
    'avatars', 'user_results', 'test_scores'
  ];

  for (const table of possibleTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      if (!error) {
        console.log(`Table exists and is readable: "${table}"`);
        if (data && data.length > 0) {
          console.log(`Columns for "${table}":`, Object.keys(data[0]));
        } else {
          console.log(`Table "${table}" is empty but exists.`);
        }
      } else {
        if (error.code !== '42P01') {
          console.log(`Table "${table}" returned error code ${error.code}:`, error.message);
        }
      }
    } catch (e) {
      // Ignored
    }
  }
}

main().catch(console.error);
