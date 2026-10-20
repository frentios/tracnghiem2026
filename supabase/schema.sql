-- Run in Supabase SQL Editor as project owner. Public signup must be disabled.
begin;
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
create table if not exists public.submissions (
 id uuid primary key, created_at timestamptz not null default now(),
 student_id text not null check(length(student_id)<=120), name text not null check(length(name)<=120),
 class_name text not null check(length(class_name)<=120), code text not null check(code ~ '^[EI?][SN?][TF?][JP?]$'), points jsonb not null);
alter table public.submissions add column if not exists market_snapshot jsonb;
create table if not exists public.answers (
 submission_id uuid references public.submissions(id) on delete cascade,
 question_id integer check(question_id between 1 and 40), choice integer not null check(choice in (0,1)), primary key(submission_id,question_id));
create table if not exists public.recommendations (
 submission_id uuid references public.submissions(id) on delete cascade,
 career_id text check(career_id in ('1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16')),
 primary key(submission_id,career_id));
alter table public.admins enable row level security;
alter table public.submissions enable row level security;
alter table public.answers enable row level security;
alter table public.recommendations enable row level security;
revoke all on public.admins,public.submissions,public.answers,public.recommendations from public,anon,authenticated;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public,anon,authenticated;
grant execute on function public.is_admin() to authenticated;
drop policy if exists admin_read on public.admins;
create policy admin_read on public.admins for select to authenticated using (public.is_admin());
drop policy if exists admin_read on public.submissions;
create policy admin_read on public.submissions for select to authenticated using (public.is_admin());
drop policy if exists admin_read on public.answers;
create policy admin_read on public.answers for select to authenticated using (public.is_admin());
drop policy if exists admin_read on public.recommendations;
create policy admin_read on public.recommendations for select to authenticated using (public.is_admin());
grant select on public.admins,public.submissions,public.answers,public.recommendations to authenticated;
create or replace function public.submit_result(p jsonb) returns uuid
language plpgsql security definer set search_path = '' as $function$
declare
 q jsonb := '[["E", "I"], ["N", "S"], ["T", "F"], ["P", "J"], ["I", "E"], ["S", "N"], ["F", "T"], ["J", "P"], ["E", "I"], ["N", "S"], ["T", "F"], ["P", "J"], ["I", "E"], ["S", "N"], ["F", "T"], ["J", "P"], ["E", "I"], ["N", "S"], ["T", "F"], ["P", "J"], ["I", "E"], ["S", "N"], ["F", "T"], ["J", "P"], ["E", "I"], ["N", "S"], ["T", "F"], ["P", "J"], ["I", "E"], ["S", "N"], ["F", "T"], ["J", "P"], ["E", "I"], ["N", "S"], ["T", "F"], ["P", "J"], ["I", "E"], ["S", "N"], ["F", "T"], ["J", "P"]]'::jsonb;
 mapping jsonb := '{"ISTJ": ["7", "8", "14", "2", "15"], "ISFJ": ["4", "5", "11", "12", "13"], "INFJ": ["11", "5", "9", "10", "4"], "INTJ": ["1", "2", "3", "15", "6"], "ISTP": ["2", "1", "14", "15", "13"], "ISFP": ["10", "13", "4", "12", "16"], "INFP": ["10", "11", "5", "9", "16"], "INTP": ["1", "3", "2", "7", "16"], "ESTP": ["6", "14", "2", "12", "8"], "ESFP": ["12", "9", "10", "6", "5"], "ENFP": ["9", "10", "5", "11", "6"], "ENTP": ["1", "6", "9", "3", "16"], "ESTJ": ["6", "7", "14", "8", "2"], "ESFJ": ["5", "4", "12", "11", "6"], "ENFJ": ["5", "11", "9", "8", "4"], "ENTJ": ["6", "8", "1", "14", "7"]}'::jsonb;
 pts jsonb := '{"E":0,"I":0,"S":0,"N":0,"T":0,"F":0,"J":0,"P":0}';
 letters text[] := array['EI','SN','TF','JP'];
 rec record; ident uuid; i integer; ch integer; trait text; code_value text := ''; pair text; ids text[]; inserted integer;
 student jsonb; market_value jsonb;
begin
 if jsonb_typeof(p) is distinct from 'object' or jsonb_typeof(p->'answers') is distinct from 'array' then raise exception 'Invalid payload'; end if;
 if jsonb_array_length(p->'answers') <> 40 then raise exception 'Exactly 40 answers required'; end if;
 ident := (p->>'id')::uuid;
 if ident is null then raise exception 'ID required'; end if;
 student := p->'student';
 if jsonb_typeof(student) is distinct from 'object' then raise exception 'Student object required'; end if;
 foreach trait in array array['studentId','name','className'] loop
  if jsonb_typeof(student->trait) is distinct from 'string' or length(student->>trait)>120 then raise exception 'Invalid student field'; end if;
 end loop;
 if jsonb_typeof(p->'recommendations') is distinct from 'array' then raise exception 'Recommendations required'; end if;
 if jsonb_array_length(p->'recommendations')>5 then raise exception 'At most 5 recommendations'; end if;
 for rec in select value from jsonb_array_elements_text(p->'recommendations') loop
  if not (rec.value = any(array['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16'])) then raise exception 'Unknown career'; end if;
 end loop;
 for i in 0..39 loop
  if jsonb_typeof(p->'answers'->i) is distinct from 'number' or (p->'answers'->>i) not in ('0','1') then raise exception 'Invalid answer at %',i+1; end if;
  ch := (p->'answers'->>i)::integer;
  trait := q->i->>ch;
  pts := jsonb_set(pts,array[trait],to_jsonb((pts->>trait)::integer+1));
 end loop;
 foreach pair in array letters loop
  if (pts->>substr(pair,1,1))::integer = (pts->>substr(pair,2,1))::integer then code_value := code_value || '?';
  elsif (pts->>substr(pair,1,1))::integer > (pts->>substr(pair,2,1))::integer then code_value := code_value || substr(pair,1,1);
  else code_value := code_value || substr(pair,2,1); end if;
 end loop;
 -- Derive canonical recommendations from possible profiles; never trust client points/code.
 select array_agg(career order by n desc, career::integer) into ids from (
 select x.career,count(*) n from jsonb_each(mapping) m cross join lateral jsonb_array_elements_text(m.value) x(career)
 where m.key like replace(code_value,'?','_') group by x.career order by n desc,x.career::integer limit 5) ranked;
 -- Market snapshots are client references, never trusted for personality points.
 market_value := nullif(p->'market','null'::jsonb);
 if market_value is not null then
  if jsonb_typeof(market_value) is distinct from 'object' or octet_length(market_value::text)>262144 then raise exception 'Invalid market snapshot'; end if;
  if (market_value->>'provider') is null or (market_value->>'provider') not in ('jooble','arbeitnow') then raise exception 'Unknown market provider'; end if;
  if jsonb_typeof(market_value->'recommendations') is distinct from 'array' then raise exception 'Invalid market recommendations'; end if;
  if jsonb_array_length(market_value->'recommendations') not between 1 and 5 then raise exception 'Invalid market recommendation count'; end if;
  for rec in select value from jsonb_array_elements(market_value->'recommendations') loop
   if jsonb_typeof(rec.value->'title') is distinct from 'string' or length(rec.value->>'title')>200 then raise exception 'Invalid market title'; end if;
   if (rec.value->>'groupId') is null or (rec.value->>'groupId') !~ '^(?:[1-9]|1[0-6])$' then raise exception 'Invalid market group'; end if;
  end loop;
  market_value := market_value || '{"provenance":"client_reference"}'::jsonb;
 end if;
 insert into public.submissions(id,student_id,name,class_name,code,points,market_snapshot)
 values(ident,student->>'studentId',student->>'name',student->>'className',code_value,pts,market_value) on conflict(id) do nothing;
 get diagnostics inserted = row_count;
 if inserted=0 then return ident; end if;
 for i in 0..39 loop
  insert into public.answers values(ident,i+1,(p->'answers'->>i)::integer);
 end loop;
 insert into public.recommendations select ident,unnest(ids);
 return ident;
end;
$function$;
revoke all on function public.submit_result(jsonb) from public,anon,authenticated;
grant execute on function public.submit_result(jsonb) to anon,authenticated;
commit;
