-- Create payment_method_history table to track changes to payment methods
-- Using full snapshot approach (approach 1) for robustness
CREATE TABLE payment_method_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payment_method_id BIGINT NOT NULL,
  parent_id BIGINT NOT NULL,
  method VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by_user_id INT NOT NULL,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES parents (id)
);

-- Create index for efficient history queries
CREATE INDEX idx_payment_method_history_payment_method_id ON payment_method_history(payment_method_id);
CREATE INDEX idx_payment_method_history_changed_at ON payment_method_history(changed_at);

