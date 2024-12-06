import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jvhxlvfhtbqcjyisxtlw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2aHhsdmZodGJxY2p5aXN4dGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMyNDIzNjAsImV4cCI6MjA0ODgxODM2MH0.4Z5k-odLwiZuwEDWf6_PiY2NQDIx12gUEUL4mOOm1KM'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkActivities() {
  // Get all activities
  const { data: activities, error } = await supabase
    .from('activities')
    .select('*')
    .order('date', { ascending: true });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('All activities:', activities);

  // Get future activities
  const { data: futureActivities, error: futureError } = await supabase
    .from('activities')
    .select('*')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });

  if (futureError) {
    console.error('Error:', futureError);
    return;
  }

  console.log('Future activities:', futureActivities);
}

checkActivities(); 