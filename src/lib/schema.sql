-- ============================================================
-- Le Fil - Vivre Ensemble : Schema SQL (Supabase)
-- Tables complémentaires : daily_logs, reminders, contact_submissions
-- ============================================================

-- ============ DAILY LOGS / JOURNAL QUOTIDIEN ============

CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  sleep_quality TEXT CHECK (sleep_quality IN ('bonne', 'moyenne', 'mauvaise')),
  sleep_hours NUMERIC(3,1),
  appetite TEXT CHECK (appetite IN ('bon', 'moyen', 'faible')),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  crises_count INTEGER DEFAULT 0,
  crises_details TEXT,
  treatment_taken BOOLEAN DEFAULT true,
  positive_moments TEXT,
  concerns TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, log_date)
);

ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their children's logs"
  ON public.daily_logs FOR ALL
  USING (parent_id = auth.uid());

-- Indexes for daily_logs
CREATE INDEX IF NOT EXISTS idx_daily_logs_child_id ON public.daily_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_parent_id ON public.daily_logs(parent_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_log_date ON public.daily_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_child_date ON public.daily_logs(child_id, log_date DESC);


-- ============ REMINDERS / RAPPELS ============

CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT CHECK (reminder_type IN ('rdv', 'traitement', 'document', 'suivi', 'autre')) DEFAULT 'autre',
  remind_at TIMESTAMPTZ NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- e.g. 'daily', 'weekly', 'monthly'
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their own reminders"
  ON public.reminders FOR ALL
  USING (parent_id = auth.uid());

-- Indexes for reminders
CREATE INDEX IF NOT EXISTS idx_reminders_parent_id ON public.reminders(parent_id);
CREATE INDEX IF NOT EXISTS idx_reminders_child_id ON public.reminders(child_id);
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON public.reminders(remind_at);
CREATE INDEX IF NOT EXISTS idx_reminders_pending ON public.reminders(parent_id, is_completed, remind_at)
  WHERE is_completed = false;


-- ============ CONTACT SUBMISSIONS ============

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- No RLS needed — inserts come from the API route (service role or anon with insert-only policy)
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact form"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Only service role can read contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (false); -- Readable only via service_role key / Supabase dashboard


-- ============ MEDICATIONS / MÉDICAMENTS ============

CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT,
  unit TEXT DEFAULT 'mg',
  frequency TEXT, -- e.g. 'matin', 'midi', 'soir', '2x/jour'
  times TEXT[], -- array of times e.g. ['08:00', '20:00']
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  prescriber TEXT,
  notes TEXT,
  side_effects TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their children's medications"
  ON public.medications FOR ALL
  USING (parent_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_medications_child_id ON public.medications(child_id);
CREATE INDEX IF NOT EXISTS idx_medications_parent_id ON public.medications(parent_id);
CREATE INDEX IF NOT EXISTS idx_medications_active ON public.medications(child_id, is_active);


-- ============ MEDICATION LOGS / HISTORIQUE DES PRISES ============

CREATE TABLE IF NOT EXISTS public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_time TEXT,
  taken BOOLEAN DEFAULT true,
  skip_reason TEXT,
  notes TEXT,
  side_effects_noted TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their children's medication logs"
  ON public.medication_logs FOR ALL
  USING (parent_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_medication_logs_medication_id ON public.medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_child_id ON public.medication_logs(child_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_taken_at ON public.medication_logs(taken_at DESC);


-- ============ HEALTH RECORDS / CARNET DE SANTÉ ============

CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  record_type TEXT CHECK (record_type IN ('vaccine', 'growth', 'allergy', 'exam', 'note')) NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their children's health records"
  ON public.health_records FOR ALL
  USING (parent_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_health_records_child_id ON public.health_records(child_id);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON public.health_records(child_id, record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON public.health_records(child_id, record_date DESC);


-- ============ THERAPEUTIC GOALS / OBJECTIFS THÉRAPEUTIQUES ============

CREATE TABLE IF NOT EXISTS public.therapeutic_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general', -- e.g. 'motricite', 'langage', 'comportement', 'autonomie'
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT CHECK (status IN ('en_cours', 'atteint', 'abandonne', 'en_pause')) DEFAULT 'en_cours',
  start_date DATE DEFAULT CURRENT_DATE,
  target_date DATE,
  achieved_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.therapeutic_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can manage their children's therapeutic goals"
  ON public.therapeutic_goals FOR ALL
  USING (parent_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_therapeutic_goals_child_id ON public.therapeutic_goals(child_id);
CREATE INDEX IF NOT EXISTS idx_therapeutic_goals_status ON public.therapeutic_goals(child_id, status);
CREATE INDEX IF NOT EXISTS idx_therapeutic_goals_practitioner ON public.therapeutic_goals(practitioner_id);
