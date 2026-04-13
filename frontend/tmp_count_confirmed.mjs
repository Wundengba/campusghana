import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xokkodxaygqljmtocxbq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhva2tvZHhheWdxbGptdG9jeGJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzM4NTcsImV4cCI6MjA4ODkwOTg1N30.98QSvx9DDAdYgJRbfx2pYsP3bWowDzVyOBd9Kwbet4k'
);

const approved = await supabase
  .from('school_selections')
  .select('id', { count: 'exact', head: true })
  .eq('approved', true);

if (approved.error) {
  console.log(JSON.stringify({
    approved: null,
    confirmed: null,
    error: approved.error.message,
    code: approved.error.code,
    status: approved.error.status,
  }));
  process.exit(0);
}

const confirmed = await supabase
  .from('school_selections')
  .select('id', { count: 'exact', head: true })
  .eq('status', 'confirmed');

if (confirmed.error) {
  console.log(JSON.stringify({
    approved: approved.count ?? 0,
    confirmed: null,
    note: 'No status column or no permission for status filter',
  }));
  process.exit(0);
}

console.log(JSON.stringify({
  approved: approved.count ?? 0,
  confirmed: confirmed.count ?? 0,
}));
