-- =====================================================
-- COMPLETE DATABASE RECREATION SCRIPT - EXACT SCHEMA
-- =====================================================
-- This script drops all existing tables and recreates them
-- with the EXACT specifications provided
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. DROP ALL EXISTING TABLES AND DEPENDENCIES
-- =====================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.machine_availability CASCADE;
DROP TABLE IF EXISTS public.odp_orders CASCADE;
DROP TABLE IF EXISTS public.orders_master_dump CASCADE;
DROP TABLE IF EXISTS public.phases CASCADE;
DROP TABLE IF EXISTS public.machines CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS sync_orders_from_master_dump() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- 2. CREATE UPDATE TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CREATE PROFILES TABLE
-- =====================================================

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  updated_at timestamp with time zone NULL,
  username text NULL,
  avatar_url text NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_username_key UNIQUE (username),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id),
  CONSTRAINT username_length CHECK ((char_length(username) >= 3))
) TABLESPACE pg_default;

-- =====================================================
-- 4. CREATE MACHINES TABLE - EXACT SCHEMA
-- =====================================================

CREATE TABLE public.machines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  machine_name text NOT NULL,
  machine_type text NOT NULL,
  work_center text NOT NULL,
  department text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE'::text,
  min_web_width integer NOT NULL,
  max_web_width integer NOT NULL,
  min_bag_height integer NOT NULL,
  max_bag_height integer NOT NULL,
  standard_speed integer NOT NULL,
  setup_time_standard real NOT NULL,
  changeover_color real NOT NULL,
  changeover_material real NOT NULL,
  active_shifts text[] NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT machines_pkey PRIMARY KEY (id),
  CONSTRAINT chk_machine_web_width CHECK ((min_web_width <= max_web_width)),
  CONSTRAINT machines_changeover_color_check CHECK ((changeover_color >= (0)::double precision)),
  CONSTRAINT machines_changeover_material_check CHECK ((changeover_material >= (0)::double precision)),
  CONSTRAINT machines_max_bag_height_check CHECK ((max_bag_height >= 0)),
  CONSTRAINT machines_max_web_width_check CHECK ((max_web_width >= 0)),
  CONSTRAINT machines_min_bag_height_check CHECK ((min_bag_height >= 0)),
  CONSTRAINT machines_min_web_width_check CHECK ((min_web_width >= 0)),
  CONSTRAINT machines_setup_time_standard_check CHECK ((setup_time_standard >= (0)::double precision)),
  CONSTRAINT machines_standard_speed_check CHECK ((standard_speed >= 0)),
  CONSTRAINT chk_machine_bag_height CHECK ((min_bag_height <= max_bag_height)),
  CONSTRAINT machines_status_check CHECK (
    (
      status = ANY (ARRAY['ACTIVE'::text, 'INACTIVE'::text])
    )
  )
) TABLESPACE pg_default;

-- =====================================================
-- 5. CREATE PHASES TABLE - EXACT SCHEMA
-- =====================================================

CREATE TABLE public.phases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  department text NOT NULL,
  numero_persone integer NOT NULL DEFAULT 1,
  v_stampa real NOT NULL,
  t_setup_stampa real NOT NULL,
  costo_h_stampa real NOT NULL,
  v_conf real NOT NULL,
  t_setup_conf real NOT NULL,
  costo_h_conf real NOT NULL,
  contenuto_fase text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  work_center text NOT NULL DEFAULT 'ZANICA'::text,
  CONSTRAINT phases_pkey PRIMARY KEY (id),
  CONSTRAINT phases_costo_h_stampa_check CHECK ((costo_h_stampa >= (0)::double precision)),
  CONSTRAINT phases_department_check CHECK (
    (
      department = ANY (ARRAY['STAMPA'::text, 'CONFEZIONAMENTO'::text])
    )
  ),
  CONSTRAINT phases_name_check CHECK (
    (
      (name IS NOT NULL)
      AND (
        TRIM(
          BOTH
          FROM
            name
        ) <> ''::text
      )
    )
  ),
  CONSTRAINT phases_numero_persone_check CHECK ((numero_persone >= 1)),
  CONSTRAINT phases_t_setup_conf_check CHECK ((t_setup_conf >= (0)::double precision)),
  CONSTRAINT phases_t_setup_stampa_check CHECK ((t_setup_stampa >= (0)::double precision)),
  CONSTRAINT phases_v_conf_check CHECK ((v_conf >= (0)::double precision)),
  CONSTRAINT phases_v_stampa_check CHECK ((v_stampa >= (0)::double precision)),
  CONSTRAINT phases_costo_h_conf_check CHECK ((costo_h_conf >= (0)::double precision)),
  CONSTRAINT phases_work_center_check CHECK (
    (
      work_center = ANY (ARRAY['ZANICA'::text, 'BUSTO_GAROLFO'::text])
    )
  )
) TABLESPACE pg_default;

-- =====================================================
-- 6. CREATE ODP_ORDERS TABLE - EXACT SCHEMA
-- =====================================================

CREATE TABLE public.odp_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  odp_number text NOT NULL,
  article_code text NOT NULL,
  production_lot text NULL,
  work_center text NOT NULL,
  nome_cliente text NOT NULL,
  description text NULL,
  bag_height integer NULL,
  bag_width integer NULL,
  bag_step integer NULL,
  seal_sides integer NULL,
  product_type text NULL,
  quantity integer NOT NULL,
  delivery_date timestamp with time zone NOT NULL,
  internal_customer_code text NULL,
  external_customer_code text NULL,
  customer_order_ref text NOT NULL,
  department text NOT NULL,
  fase uuid NULL,
  duration real NULL,
  cost real NULL,
  status text NOT NULL DEFAULT 'NOT SCHEDULED'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  scheduled_start_time timestamp with time zone NULL,
  scheduled_end_time timestamp with time zone NULL,
  scheduled_machine_id uuid NULL,
  quantity_completed integer NOT NULL DEFAULT 0,
  progress integer GENERATED ALWAYS AS (
    round(
      CASE
        WHEN (quantity = 0) THEN (0)::numeric
        ELSE (
          ((quantity_completed)::numeric * 100.0) / (quantity)::numeric
        )
      END
    )
  ) STORED NULL,
  time_remaining real GENERATED ALWAYS AS (
    CASE
      WHEN (
        (quantity = 0)
        OR (quantity_completed = 0)
      ) THEN duration
      ELSE (
        trunc(
          (
            (
              duration * (
                (
                  (1)::numeric - (
                    ((quantity_completed)::numeric * 1.0) / (quantity)::numeric
                  )
                )
              )::double precision
            )
          )::numeric,
          2
        )
      )::real
    END
  ) STORED NULL,
  user_notes text NULL,
  material_availability_isp integer NULL,
  material_availability_lotti integer NULL,
  asd_notes text NULL,
  material_availability_global integer NULL,
  CONSTRAINT odp_orders_pkey PRIMARY KEY (id),
  CONSTRAINT odp_orders_odp_number_key UNIQUE (odp_number),
  CONSTRAINT odp_orders_fase_fkey FOREIGN KEY (fase) REFERENCES phases (id),
  CONSTRAINT odp_orders_scheduled_machine_id_fkey FOREIGN KEY (scheduled_machine_id) REFERENCES machines (id),
  CONSTRAINT odp_orders_cost_check CHECK (
    (
      (cost IS NULL)
      OR (cost >= (0)::double precision)
    )
  ),
  CONSTRAINT odp_orders_customer_order_ref_not_empty_check CHECK ((customer_order_ref <> ''::text)),
  CONSTRAINT odp_orders_department_check CHECK (
    (
      department = ANY (ARRAY['STAMPA'::text, 'CONFEZIONAMENTO'::text])
    )
  ),
  CONSTRAINT odp_orders_duration_check CHECK (
    (
      (duration IS NULL)
      OR (duration >= (0)::double precision)
    )
  ),
  CONSTRAINT odp_orders_external_customer_code_not_empty_check CHECK (
    (
      (external_customer_code IS NULL)
      OR (external_customer_code <> ''::text)
    )
  ),
  CONSTRAINT odp_orders_internal_customer_code_not_empty_check CHECK (
    (
      (internal_customer_code IS NULL)
      OR (internal_customer_code <> ''::text)
    )
  ),
  CONSTRAINT odp_orders_mat_avail_isp_check CHECK (
    (
      (material_availability_isp IS NULL)
      OR (
        (material_availability_isp >= 0)
        AND (material_availability_isp <= 100)
      )
    )
  ),
  CONSTRAINT odp_orders_mat_avail_lotti_check CHECK (
    (
      (material_availability_lotti IS NULL)
      OR (
        (material_availability_lotti >= 0)
        AND (material_availability_lotti <= 100)
      )
    )
  ),
  CONSTRAINT odp_orders_nome_cliente_not_empty_check CHECK ((nome_cliente <> ''::text)),
  CONSTRAINT odp_orders_product_type_check CHECK (
    (
      (product_type IS NULL)
      OR (
        product_type = ANY (
          ARRAY['CREMA'::text, 'LIQUIDO'::text, 'POLVERI'::text]
        )
      )
    )
  ),
  CONSTRAINT odp_orders_quantity_check CHECK ((quantity >= 0)),
  CONSTRAINT odp_orders_quantity_completed_check CHECK ((quantity_completed <= quantity)),
  CONSTRAINT odp_orders_quantity_completed_positive_check CHECK ((quantity_completed >= 0)),
  CONSTRAINT odp_orders_scheduled_time_order_check CHECK (
    (
      (scheduled_end_time IS NULL)
      OR (scheduled_start_time IS NULL)
      OR (scheduled_end_time > scheduled_start_time)
    )
  ),
  CONSTRAINT odp_orders_scheduling_logic_check CHECK (
    (
      (
        (scheduled_start_time IS NULL)
        AND (scheduled_end_time IS NULL)
        AND (scheduled_machine_id IS NULL)
      )
      OR (
        (scheduled_start_time IS NOT NULL)
        AND (scheduled_end_time IS NOT NULL)
        AND (scheduled_machine_id IS NOT NULL)
      )
    )
  ),
  CONSTRAINT odp_orders_seal_sides_check CHECK (
    (
      (seal_sides IS NULL)
      OR (seal_sides = ANY (ARRAY[3, 4]))
    )
  ),
  CONSTRAINT odp_orders_status_check CHECK (
    (
      status = ANY (
        ARRAY[
          'NOT SCHEDULED'::text,
          'SCHEDULED'::text,
          'IN PROGRESS'::text,
          'COMPLETED'::text,
          'CANCELLED'::text
        ]
      )
    )
  ),
  CONSTRAINT chk_odp_bag_dimensions CHECK (
    (
      (bag_width >= bag_step)
      OR (bag_width IS NULL)
      OR (bag_step IS NULL)
    )
  ),
  CONSTRAINT odp_orders_work_center_check CHECK (
    (
      work_center = ANY (ARRAY['ZANICA'::text, 'BUSTO_GAROLFO'::text])
    )
  ),
  CONSTRAINT odp_orders_bag_height_check CHECK (
    (
      (bag_height IS NULL)
      OR (bag_height >= 0)
    )
  ),
  CONSTRAINT odp_orders_bag_step_check CHECK (
    (
      (bag_step IS NULL)
      OR (bag_step >= 0)
    )
  ),
  CONSTRAINT odp_orders_bag_width_check CHECK (
    (
      (bag_width IS NULL)
      OR (bag_width >= 0)
    )
  )
) TABLESPACE pg_default;

-- =====================================================
-- 7. CREATE MACHINE_AVAILABILITY TABLE - EXACT SCHEMA
-- =====================================================

CREATE TABLE public.machine_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL,
  date date NOT NULL,
  unavailable_hours text[] NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT machine_availability_pkey PRIMARY KEY (id),
  CONSTRAINT unique_machine_date UNIQUE (machine_id, date),
  CONSTRAINT fk_machine_availability_machine FOREIGN KEY (machine_id) REFERENCES machines (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- =====================================================
-- 8. CREATE INDEXES FOR MACHINES TABLE - EXACT
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_machines_status ON public.machines USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_machines_department ON public.machines USING btree (department) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_machines_work_center ON public.machines USING btree (work_center) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_machines_type ON public.machines USING btree (machine_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_machines_name ON public.machines USING btree (machine_name) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_machines_work_center_department ON public.machines USING btree (work_center, department) TABLESPACE pg_default;

-- =====================================================
-- 9. CREATE INDEXES FOR PHASES TABLE - EXACT
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_phases_name ON public.phases USING btree (name) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_phases_work_center ON public.phases USING btree (work_center) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_phases_work_center_department ON public.phases USING btree (work_center, department) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_phases_department ON public.phases USING btree (department) TABLESPACE pg_default;

-- =====================================================
-- 10. CREATE INDEXES FOR ODP_ORDERS TABLE - EXACT
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_odp_orders_product_type ON public.odp_orders USING btree (product_type) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_scheduled_start_time ON public.odp_orders USING btree (scheduled_start_time) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_scheduled_machine_id ON public.odp_orders USING btree (scheduled_machine_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_quantity_completed ON public.odp_orders USING btree (quantity_completed) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_status_delivery_date ON public.odp_orders USING btree (status, delivery_date) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_department_work_center ON public.odp_orders USING btree (department, work_center) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_status ON public.odp_orders USING btree (status) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_department ON public.odp_orders USING btree (department) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_work_center ON public.odp_orders USING btree (work_center) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_odp_number ON public.odp_orders USING btree (odp_number) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_delivery_date ON public.odp_orders USING btree (delivery_date) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_odp_orders_fase ON public.odp_orders USING btree (fase) TABLESPACE pg_default;

-- =====================================================
-- 11. CREATE INDEXES FOR MACHINE_AVAILABILITY TABLE - EXACT
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_machine_availability_machine_id ON public.machine_availability USING btree (machine_id) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_machine_availability_date ON public.machine_availability USING btree (date) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS idx_machine_availability_machine_date ON public.machine_availability USING btree (machine_id, date) TABLESPACE pg_default;

-- =====================================================
-- 12. CREATE TRIGGERS - EXACT
-- =====================================================

CREATE TRIGGER update_machines_updated_at 
  BEFORE UPDATE ON machines 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phases_updated_at 
  BEFORE UPDATE ON phases 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_odp_orders_updated_at 
  BEFORE UPDATE ON odp_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 13. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odp_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_availability ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Machines policies (allow all authenticated users to read/write)
CREATE POLICY "Authenticated users can view machines" ON public.machines
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert machines" ON public.machines
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update machines" ON public.machines
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete machines" ON public.machines
    FOR DELETE USING (auth.role() = 'authenticated');

-- Phases policies
CREATE POLICY "Authenticated users can view phases" ON public.phases
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert phases" ON public.phases
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update phases" ON public.phases
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete phases" ON public.phases
    FOR DELETE USING (auth.role() = 'authenticated');

-- ODP Orders policies
CREATE POLICY "Authenticated users can view odp_orders" ON public.odp_orders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert odp_orders" ON public.odp_orders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update odp_orders" ON public.odp_orders
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete odp_orders" ON public.odp_orders
    FOR DELETE USING (auth.role() = 'authenticated');

-- Machine Availability policies
CREATE POLICY "Authenticated users can view machine_availability" ON public.machine_availability
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert machine_availability" ON public.machine_availability
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update machine_availability" ON public.machine_availability
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete machine_availability" ON public.machine_availability
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- 14. PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users (for signup)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.profiles TO anon;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- The database has been completely recreated with the EXACT specifications
-- All tables, indexes, constraints, triggers, and permissions are configured
-- =====================================================

