# Migration V2: Add creation_date column to payment_methods table
ALTER TABLE payment_methods add column creation_date DATETIME NULL;
