
-- 1) Schema: add path so dashboards can render any flag as a tile
ALTER TABLE public.feature_flags ADD COLUMN IF NOT EXISTS path text;

-- 2) Seed full catalogue (UPSERT)
INSERT INTO public.feature_flags (key, label, description, category, is_system, display_order, path) VALUES
-- CLIENT
('client.next-session','Upcoming sessions','See & book upcoming sessions','client',true,10,'/portal/booking'),
('client.messages','Messages','Chat with your care team','client',true,20,'/portal/messages'),
('client.tasks','Between-sessions tasks','Things to work on between sessions','client',true,30,'/portal/between-sessions'),
('client.resources','Resources','Shared documents and downloads','client',true,40,'/portal/resources'),
('client.toolkit','Toolkit','ACT, mindfulness, focus tools','client',true,50,'/portal/toolkit'),
('client.pathway','Support pathway','Your stepped care plan','client',true,60,'/portal/support-pathway'),
('client.productivity','Productivity','Daily planner & focus blocks','client',false,70,'/portal/productivity'),
('client.fba-intake','FBA intake','Functional behaviour intake form','client',false,80,'/portal/fba-intake'),
('client.support-agreement','Support agreement','View & sign your support agreement','client',false,90,'/portal/support-agreement'),
('client.act-matrix','ACT matrix','Personal ACT matrix tool','client',false,100,'/portal/toolkit/act-matrix'),
('client.pomodoro','Pomodoro timer','Focus timer','client',false,110,'/portal/toolkit/pomodoro'),
('client.mindfulness','Mindfulness sounds','Calming soundscapes','client',false,120,'/portal/toolkit/mindfulness'),
('client.settings','Settings','Account & notification preferences','client',true,200,'/settings'),

-- STAFF (therapist)
('staff.today','Today','Today''s sessions','staff',true,10,'/staff/calendar'),
('staff.clients','My clients','Assigned clients','staff',true,20,'/staff/clients'),
('staff.notes','Clinical notes','Templates & notes','staff',true,30,'/staff/note-templates'),
('staff.tasks','Internal tasks','Tasks assigned to you','staff',true,40,'/staff/staff-todos'),
('staff.tools','Clinical tools','ACT, FBA, formulation','staff',true,50,'/staff/clinical-tools'),
('staff.calendar','Calendar','Personal & team calendar','staff',true,60,'/staff/calendar'),
('staff.booking','Book session','Book on behalf of a client','staff',true,70,'/staff/booking'),
('staff.session-room','Session room','Live session workspace','staff',true,75,'/staff/calendar'),
('staff.messages','Messages','Chat with clients & team','staff',false,80,'/staff/messages'),
('staff.resources','Resources','Shared documents','staff',false,90,'/staff/resources'),
('staff.productivity','Productivity','Daily planner','staff',false,100,'/staff/productivity'),
('staff.toolkit','Toolkit','Personal ACT, focus & mindfulness','staff',false,110,'/staff/toolkit'),
('staff.fba-intakes','FBA intakes','Parent FBA intake manager','staff',false,120,'/staff/fba-intakes'),
('staff.todos','Client to-dos','To-do manager for clients','staff',false,130,'/staff/todos'),
('staff.clinical-abc','ABC data sheet','Antecedent–Behaviour–Consequence','staff',false,140,'/staff/clinical/abc'),
('staff.clinical-functional','Functional assessment','FBA tool','staff',false,150,'/staff/clinical/functional-assessment'),
('staff.clinical-values','Values bull''s eye','Values clarification tool','staff',false,160,'/staff/clinical/values-bullseye'),
('staff.clinical-hexaflex','Hexaflex tracker','ACT hexaflex','staff',false,170,'/staff/clinical/hexaflex'),
('staff.clinical-behaviour','Behaviour log','Daily behaviour tracking','staff',false,180,'/staff/clinical/behaviour-log'),
('staff.clinical-formulation','Case formulation','Structured case formulation','staff',false,190,'/staff/clinical/case-formulation'),

-- SUPERVISEE
('sup.next-supervision','Next supervision','Upcoming supervision sessions','supervisee',true,10,'/supervisee'),
('sup.caselog','Case log','BCBA-style case log','supervisee',true,20,'/supervisee/case-logs'),
('sup.competencies','Competencies','Tracked competencies','supervisee',true,30,'/supervisee/competencies'),
('sup.documents','Documents','Supervision documents','supervisee',true,40,'/supervisee/documents'),
('sup.calendar','Calendar','Supervision calendar','supervisee',false,50,'/supervisee/calendar'),

-- ADMIN
('admin.calendar','Practice calendar','Calendar across the practice','admin',true,10,'/admin/calendar'),
('admin.clients','Clients','Client directory','admin',true,20,'/admin/clients'),
('admin.team','Team','Manage team members','admin',true,30,'/admin/team-members'),
('admin.finance','Finance','Xero finance hub','admin',true,40,'/admin/finance'),
('admin.content','Site content','Edit landing & marketing content','admin',true,50,'/admin/site-content'),
('admin.features','Feature toggles','Manage feature access','admin',true,60,'/admin/features'),
('admin.team-requests','Team requests','Approve new team members','admin',false,70,'/admin/team-requests'),
('admin.hero-images','Hero images','Manage hero carousel','admin',false,80,'/admin/hero-images'),
('admin.service-options','Service options','Bookable services','admin',false,90,'/admin/service-options'),
('admin.users','Users','User management','admin',false,100,'/admin/users'),
('admin.staff-todos','Staff to-dos','Cross-team task manager','admin',false,110,'/admin/staff-todos'),
('admin.task-board','Task board','Kanban board','admin',false,120,'/admin/task-board'),
('admin.auth-settings','Auth settings','Email & OAuth settings','admin',false,130,'/admin/auth-settings'),
('admin.security','Security','Security dashboard','admin',false,140,'/admin/security'),
('admin.courses','Courses','Course manager','admin',false,150,'/admin/courses'),
('admin.business','Business','Business analytics','admin',false,160,'/admin/business'),
('admin.payouts','Therapist payouts','Pay therapists','admin',false,170,'/admin/payouts'),
('admin.blog','Blog & insights','Edit blog posts','admin',false,180,'/admin/blog'),
('admin.badges','Partner badges','Manage badges','admin',false,190,'/admin/badges'),
('admin.note-templates','Note templates','Shared clinical templates','admin',false,200,'/admin/note-templates'),
('admin.manual-clients','Manual clients','Non-registered client records','admin',false,210,'/admin/manual-clients'),
('admin.assistant','AI assistant','Configure assistant','admin',false,220,'/admin/assistant'),
('admin.fba-report','FBA report tool','Generate FBA reports','admin',false,230,'/admin/fba-report'),
('admin.story-engine','Story engine','Content & story engine','admin',false,240,'/admin/story-engine'),
('admin.pathway-templates','Pathway templates','Care pathway templates','admin',false,250,'/admin/pathway-templates'),
('admin.pathway-quiz','Pathway quiz','Pathway recommendation quiz','admin',false,260,'/admin/pathway-quiz'),
('admin.supervision','Supervision tracker','Track supervisee progress','admin',false,270,'/admin/supervision')
ON CONFLICT (key) DO UPDATE
  SET label = EXCLUDED.label,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      display_order = EXCLUDED.display_order,
      path = EXCLUDED.path;

-- 3) Seed default role access (don't overwrite existing toggles)
INSERT INTO public.role_feature_access (role, feature_key, enabled)
SELECT 'client'::app_role, key, true FROM public.feature_flags WHERE category = 'client'
ON CONFLICT (role, feature_key) DO NOTHING;

INSERT INTO public.role_feature_access (role, feature_key, enabled)
SELECT 'team_member'::app_role, key, true FROM public.feature_flags WHERE category = 'staff'
ON CONFLICT (role, feature_key) DO NOTHING;

INSERT INTO public.role_feature_access (role, feature_key, enabled)
SELECT 'supervisee'::app_role, key, true FROM public.feature_flags WHERE category = 'supervisee'
ON CONFLICT (role, feature_key) DO NOTHING;

INSERT INTO public.role_feature_access (role, feature_key, enabled)
SELECT 'admin'::app_role, key, true FROM public.feature_flags WHERE category = 'admin'
ON CONFLICT (role, feature_key) DO NOTHING;
