CREATE TABLE flower_states (
    team_id VARCHAR(50) PRIMARY KEY,
    current_units INT CHECK (current_units BETWEEN 3 AND 7),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    update_reason VARCHAR(100)
);

CREATE TABLE item_usage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id VARCHAR(50),
    item_type ENUM('ADD', 'REVIVE'),
    question_id VARCHAR(50),
    used_at TIMESTAMP
);

CREATE TABLE flower_state_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id VARCHAR(50),
    previous_units INT,
    new_units INT,
    change_reason VARCHAR(100),
    question_id VARCHAR(50),
    changed_at TIMESTAMP
);

ALTER TABLE answer
ADD COLUMN flower_multiplier DECIMAL(3,2) DEFAULT 1.00,
ADD COLUMN flower_modified_score DECIMAL(10,2) DEFAULT 0;
ADD COLUMN submission_time TIMESTAMP,
ADD COLUMN is_early_submission BOOLEAN DEFAULT FALSE;