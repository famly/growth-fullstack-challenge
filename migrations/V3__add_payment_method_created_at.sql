-- Add created_at column to payment_methods table
ALTER TABLE payment_methods
ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill existing payment methods with the parent's first invoice date
-- For payment methods where the parent has invoices, use the earliest invoice date
UPDATE payment_methods pm
INNER JOIN (
  SELECT parent_id, MIN(date) as first_invoice_date
  FROM invoices
  GROUP BY parent_id
) i ON pm.parent_id = i.parent_id
SET pm.created_at = i.first_invoice_date;

