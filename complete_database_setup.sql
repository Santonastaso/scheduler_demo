-- =====================================================
-- COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- =====================================================
-- This script creates all tables, functions, and permissions
-- needed for the scheduler application
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (Authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    work_center TEXT CHECK (work_center IN ('ZANICA', 'BUSTO_GAROLFO')),
    department TEXT CHECK (department IN ('STAMPA', 'CONFEZIONAMENTO')),
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. MACHINES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.machines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_name TEXT NOT NULL,
    machine_type TEXT NOT NULL,
    department TEXT NOT NULL CHECK (department IN ('STAMPA', 'CONFEZIONAMENTO')),
    work_center TEXT NOT NULL CHECK (work_center IN ('ZANICA', 'BUSTO_GAROLFO')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    
    -- Technical specifications
    min_web_width INTEGER,
    max_web_width INTEGER,
    min_bag_height INTEGER,
    max_bag_height INTEGER,
    
    -- Performance metrics
    standard_speed INTEGER,
    setup_time_standard DECIMAL(5,2),
    changeover_color DECIMAL(5,2),
    changeover_material DECIMAL(5,2),
    
    -- Availability
    active_shifts TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_web_width CHECK (min_web_width IS NULL OR max_web_width IS NULL OR min_web_width <= max_web_width),
    CONSTRAINT valid_bag_height CHECK (min_bag_height IS NULL OR max_bag_height IS NULL OR min_bag_height <= max_bag_height),
    CONSTRAINT valid_shifts CHECK (active_shifts <@ ARRAY['T1', 'T2', 'T3'])
);

-- =====================================================
-- 3. PHASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.phases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL CHECK (department IN ('STAMPA', 'CONFEZIONAMENTO')),
    work_center TEXT NOT NULL CHECK (work_center IN ('ZANICA', 'BUSTO_GAROLFO')),
    
    -- Personnel
    numero_persone INTEGER NOT NULL CHECK (numero_persone > 0),
    
    -- Common specifications
    bag_width INTEGER,
    bag_step INTEGER,
    
    -- Printing parameters
    v_stampa INTEGER,
    t_setup_stampa DECIMAL(5,2),
    costo_h_stampa DECIMAL(8,2),
    
    -- Packaging parameters
    v_conf INTEGER,
    t_setup_conf DECIMAL(5,2),
    costo_h_conf DECIMAL(8,2),
    
    -- Description
    contenuto_fase TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_bag_width_step CHECK (bag_width IS NULL OR bag_step IS NULL OR bag_width >= bag_step)
);

-- =====================================================
-- 4. ORDERS_MASTER_DUMP TABLE (Source data)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders_master_dump (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    odp_number TEXT NOT NULL,
    article_code TEXT,
    production_lot TEXT,
    work_center TEXT,
    nome_cliente TEXT,
    delivery_date TIMESTAMPTZ,
    bag_height INTEGER,
    bag_width INTEGER,
    bag_step INTEGER,
    seal_sides INTEGER,
    product_type TEXT,
    quantity INTEGER,
    internal_customer_code TEXT,
    external_customer_code TEXT,
    customer_order_ref TEXT,
    department TEXT,
    quantity_completed INTEGER DEFAULT 0,
    material_availability_isp INTEGER,
    material_availability_lotti INTEGER,
    user_notes TEXT,
    asd_notes TEXT,
    material_availability_global INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_seal_sides CHECK (seal_sides IS NULL OR seal_sides IN (3, 4)),
    CONSTRAINT valid_material_availability CHECK (
        (material_availability_isp IS NULL OR (material_availability_isp >= 0 AND material_availability_isp <= 100)) AND
        (material_availability_lotti IS NULL OR (material_availability_lotti >= 0 AND material_availability_lotti <= 100)) AND
        (material_availability_global IS NULL OR (material_availability_global >= 0 AND material_availability_global <= 100))
    )
);

-- =====================================================
-- 5. ODP_ORDERS TABLE (Working orders)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.odp_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    odp_number TEXT NOT NULL UNIQUE,
    article_code TEXT NOT NULL,
    production_lot TEXT,
    work_center TEXT NOT NULL,
    nome_cliente TEXT NOT NULL,
    delivery_date TIMESTAMPTZ NOT NULL,
    bag_height INTEGER,
    bag_width INTEGER,
    bag_step INTEGER,
    seal_sides INTEGER,
    product_type TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    internal_customer_code TEXT,
    external_customer_code TEXT,
    customer_order_ref TEXT NOT NULL,
    department TEXT NOT NULL,
    quantity_completed INTEGER DEFAULT 0,
    material_availability_isp INTEGER,
    material_availability_lotti INTEGER,
    user_notes TEXT,
    asd_notes TEXT,
    material_availability_global INTEGER,
    status TEXT DEFAULT 'NOT SCHEDULED' CHECK (status IN ('NOT SCHEDULED', 'SCHEDULED', 'IN PROGRESS', 'COMPLETED', 'CANCELLED')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_quantity CHECK (quantity >= 0),
    CONSTRAINT valid_quantity_completed CHECK (quantity_completed >= 0),
    CONSTRAINT valid_seal_sides CHECK (seal_sides IS NULL OR seal_sides IN (3, 4)),
    CONSTRAINT valid_material_availability CHECK (
        (material_availability_isp IS NULL OR (material_availability_isp >= 0 AND material_availability_isp <= 100)) AND
        (material_availability_lotti IS NULL OR (material_availability_lotti >= 0 AND material_availability_lotti <= 100)) AND
        (material_availability_global IS NULL OR (material_availability_global >= 0 AND material_availability_global <= 100))
    )
);

-- =====================================================
-- 6. MACHINE_AVAILABILITY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.machine_availability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    machine_id UUID NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    unavailable_hours INTEGER[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_unavailable_hours CHECK (unavailable_hours <@ ARRAY[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]),
    UNIQUE(machine_id, date)
);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Machines indexes
CREATE INDEX IF NOT EXISTS idx_machines_work_center ON public.machines(work_center);
CREATE INDEX IF NOT EXISTS idx_machines_department ON public.machines(department);
CREATE INDEX IF NOT EXISTS idx_machines_status ON public.machines(status);

-- Phases indexes
CREATE INDEX IF NOT EXISTS idx_phases_work_center ON public.phases(work_center);
CREATE INDEX IF NOT EXISTS idx_phases_department ON public.phases(department);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_odp_orders_work_center ON public.odp_orders(work_center);
CREATE INDEX IF NOT EXISTS idx_odp_orders_department ON public.odp_orders(department);
CREATE INDEX IF NOT EXISTS idx_odp_orders_status ON public.odp_orders(status);
CREATE INDEX IF NOT EXISTS idx_odp_orders_delivery_date ON public.odp_orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_odp_orders_odp_number ON public.odp_orders(odp_number);

-- Master dump indexes
CREATE INDEX IF NOT EXISTS idx_orders_master_dump_odp_number ON public.orders_master_dump(odp_number);
CREATE INDEX IF NOT EXISTS idx_orders_master_dump_work_center ON public.orders_master_dump(work_center);

-- Machine availability indexes
CREATE INDEX IF NOT EXISTS idx_machine_availability_machine_id ON public.machine_availability(machine_id);
CREATE INDEX IF NOT EXISTS idx_machine_availability_date ON public.machine_availability(date);
CREATE INDEX IF NOT EXISTS idx_machine_availability_machine_date ON public.machine_availability(machine_id, date);

-- =====================================================
-- 8. FUNCTIONS
-- =====================================================

-- Function to sync orders from master dump
CREATE OR REPLACE FUNCTION sync_orders_from_master_dump()
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.odp_orders (
        odp_number, article_code, production_lot, work_center, nome_cliente,
        delivery_date, bag_height, bag_width, bag_step,
        seal_sides, product_type, quantity, internal_customer_code,
        external_customer_code, customer_order_ref, department,
        quantity_completed, material_availability_isp, material_availability_lotti,
        user_notes, asd_notes, material_availability_global
    )
    SELECT
        dump.odp_number,
        COALESCE(dump.article_code, 'N/A'),
        dump.production_lot,
        COALESCE(dump.work_center, 'ZANICA'),
        COALESCE(dump.nome_cliente, 'UNKNOWN'),
        -- Handle invalid dates
        CASE
            WHEN dump.delivery_date IS NULL OR dump.delivery_date = '0000-00-00'
            THEN NOW()
            ELSE dump.delivery_date::TIMESTAMPTZ
        END,
        dump.bag_height,
        dump.bag_width,
        dump.bag_step,
        CASE
            WHEN dump.seal_sides IN (3, 4) THEN dump.seal_sides
            ELSE NULL
        END,
        dump.product_type,
        COALESCE(dump.quantity, 0),
        dump.internal_customer_code,
        dump.external_customer_code,
        COALESCE(dump.customer_order_ref, 'N/A'),
        COALESCE(dump.department, 'STAMPA'),
        COALESCE(dump.quantity_completed, 0),
        dump.material_availability_isp,
        dump.material_availability_lotti,
        dump.user_notes,
        dump.asd_notes,
        dump.material_availability_global
    FROM
        public.orders_master_dump AS dump
    WHERE
        dump.odp_number IS NOT NULL AND dump.odp_number <> ''

    ON CONFLICT (odp_number)
    DO UPDATE SET
        quantity_completed = EXCLUDED.quantity_completed,
        material_availability_isp = EXCLUDED.material_availability_isp,
        material_availability_lotti = EXCLUDED.material_availability_lotti,
        user_notes = EXCLUDED.user_notes,
        asd_notes = EXCLUDED.asd_notes,
        material_availability_global = EXCLUDED.material_availability_global,
        updated_at = NOW()
    WHERE
        odp_orders.quantity_completed IS DISTINCT FROM EXCLUDED.quantity_completed
        OR odp_orders.material_availability_isp IS DISTINCT FROM EXCLUDED.material_availability_isp
        OR odp_orders.material_availability_lotti IS DISTINCT FROM EXCLUDED.material_availability_lotti
        OR odp_orders.user_notes IS DISTINCT FROM EXCLUDED.user_notes
        OR odp_orders.asd_notes IS DISTINCT FROM EXCLUDED.asd_notes
        OR odp_orders.material_availability_global IS DISTINCT FROM EXCLUDED.material_availability_global;

END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. TRIGGERS
-- =====================================================

-- Triggers for updated_at columns
CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON public.machines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phases_updated_at
    BEFORE UPDATE ON public.phases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_odp_orders_updated_at
    BEFORE UPDATE ON public.odp_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_master_dump_updated_at
    BEFORE UPDATE ON public.orders_master_dump
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_machine_availability_updated_at
    BEFORE UPDATE ON public.machine_availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odp_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders_master_dump ENABLE ROW LEVEL SECURITY;
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

-- Orders Master Dump policies
CREATE POLICY "Authenticated users can view orders_master_dump" ON public.orders_master_dump
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert orders_master_dump" ON public.orders_master_dump
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update orders_master_dump" ON public.orders_master_dump
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete orders_master_dump" ON public.orders_master_dump
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
-- 11. PERMISSIONS
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
-- 12. SAMPLE DATA (Optional - Uncomment if needed)
-- =====================================================

-- Sample machines
/*
INSERT INTO public.machines (machine_name, machine_type, department, work_center, status, min_web_width, max_web_width, standard_speed, setup_time_standard, changeover_color, active_shifts) VALUES
('Stampa 1', 'FLEXO', 'STAMPA', 'ZANICA', 'ACTIVE', 200, 800, 150, 2.0, 1.5, ARRAY['T1', 'T2']),
('Confezionamento 1', 'VERTICALE', 'CONFEZIONAMENTO', 'ZANICA', 'ACTIVE', 100, 500, 200, 1.5, 1.0, ARRAY['T1', 'T2', 'T3']);

-- Sample phases
INSERT INTO public.phases (name, department, work_center, numero_persone, v_stampa, t_setup_stampa, costo_h_stampa, contenuto_fase) VALUES
('Stampa Standard', 'STAMPA', 'ZANICA', 2, 120, 1.5, 45.00, 'Stampa standard con controllo qualità'),
('Confezionamento Veloce', 'CONFEZIONAMENTO', 'ZANICA', 1, 180, 1.0, 35.00, 'Confezionamento ad alta velocità');
*/

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- The database is now ready for the scheduler application
-- All tables, indexes, functions, triggers, and permissions are configured
-- =====================================================
