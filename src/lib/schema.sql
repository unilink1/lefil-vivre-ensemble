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
