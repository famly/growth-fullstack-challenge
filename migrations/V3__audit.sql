CREATE TABLE payment_method_audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  payment_method_id INT NOT NULL,
  parent_id BIGINT NOT NULL,
  change_type ENUM('CREATE', 'UPDATE', 'DELETE') NOT NULL,
  old_values JSON NULL,
  new_values JSON NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  FOREIGN KEY (parent_id) REFERENCES parents(id)
);
