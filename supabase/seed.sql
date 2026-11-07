-- Seed data for local Supabase verification (two accounts: Alice & Bob, plus labelled sample profiles)
insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'alice@example.local'),
  ('22222222-2222-4222-8222-222222222222', 'bob@example.local')
on conflict (id) do nothing;

insert into public.profiles (id, handle, display_name, bio, interests, is_public, is_sample)
values
  ('11111111-1111-4111-8111-111111111111', 'alice-harbour', 'Alice Harbour', 'Fingerstyle guitarist and landscape photographer.', array['guitar', 'photography'], true, false),
  ('22222222-2222-4222-8222-222222222222', 'bob-mariner', 'Bob Mariner', 'Songwriter charting acoustic hooks.', array['songwriting', 'guitar'], true, false)
on conflict (id) do nothing;

insert into public.islands (id, owner_id, title, category, experience, session_minutes, xp, is_public, public_summary, roadmap, starter_goals)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '11111111-1111-4111-8111-111111111111',
    'The Chord Coast',
    'guitar',
    'intermediate',
    20,
    250,
    true,
    'Play an acoustic fingerstyle arrangement from start to finish',
    '{"focus":"Fingerstyle arrangement","checkpoint":"Record a complete fingerstyle arrangement."}'::jsonb,
    '[{"id":"goal-1","title":"Balance bass and melody","description":"Choose four bars with an alternating bass and melody. Record them slowly.","practice":"Choose four bars with an alternating bass and melody. Record them slowly.","finish":"Keep the bass even while the melody stays clearly audible.","minutes":15,"prerequisites":[]}]'::jsonb
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '11111111-1111-4111-8111-111111111111',
    'Private Journal Island',
    'custom',
    'beginner',
    15,
    100,
    false,
    'Private notes',
    '{"focus":"Personal notes","checkpoint":"Keep private."}'::jsonb,
    '[]'::jsonb
  )
on conflict (id) do nothing;
