-- Function to calculate total materials cost for an enquiry
CREATE OR REPLACE FUNCTION public.get_enquiry_materials_cost(enquiry_uuid UUID)
RETURNS DECIMAL(10, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_cost DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(total_price), 0)
  INTO total_cost
  FROM public.materials
  WHERE enquiry_id = enquiry_uuid;
  
  RETURN total_cost;
END;
$$;

-- Function to calculate total expenses for an enquiry
CREATE OR REPLACE FUNCTION public.get_enquiry_expenses(enquiry_uuid UUID)
RETURNS DECIMAL(10, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_expenses DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total_expenses
  FROM public.expenses
  WHERE enquiry_id = enquiry_uuid;
  
  RETURN total_expenses;
END;
$$;

-- Function to calculate profit for an enquiry
CREATE OR REPLACE FUNCTION public.get_enquiry_profit(enquiry_uuid UUID)
RETURNS DECIMAL(10, 2)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_revenue DECIMAL(10, 2);
  total_costs DECIMAL(10, 2);
  profit DECIMAL(10, 2);
BEGIN
  -- Get total revenue from commercials (invoices)
  SELECT COALESCE(SUM(amount), 0)
  INTO total_revenue
  FROM public.commercials
  WHERE enquiry_id = enquiry_uuid AND type = 'invoice' AND status = 'paid';
  
  -- Get total costs (materials + expenses)
  SELECT 
    COALESCE(public.get_enquiry_materials_cost(enquiry_uuid), 0) +
    COALESCE(public.get_enquiry_expenses(enquiry_uuid), 0)
  INTO total_costs;
  
  profit := total_revenue - total_costs;
  
  RETURN profit;
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commercials_updated_at BEFORE UPDATE ON public.commercials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drive_files_updated_at BEFORE UPDATE ON public.drive_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
