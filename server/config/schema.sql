-- ============================================
-- CampaignHub SMS Marketing Platform
-- Database Schema v2.0
-- Author: Vruti Mistry
-- ============================================

-- Drop existing views first
DROP VIEW IF EXISTS user_dashboard_stats CASCADE;
DROP VIEW IF EXISTS campaign_performance CASCADE;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS message_analytics CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS opt_outs CASCADE;
DROP TABLE IF EXISTS campaign_contacts CASCADE;
DROP TABLE IF EXISTS contact_group_members CASCADE;
DROP TABLE IF EXISTS contact_groups CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS twilio_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- USERS TABLE
-- Stores user account information
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    company_name VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TWILIO SETTINGS TABLE
-- Stores Twilio credentials per user
-- ============================================
CREATE TABLE twilio_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_sid VARCHAR(255) NOT NULL,
    auth_token VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    messaging_service_sid VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    monthly_limit INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- CONTACTS TABLE
-- Stores contact information for SMS recipients
-- ============================================
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    company VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'unsubscribed')),
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'import', 'api', 'form')),
    custom_fields JSONB DEFAULT '{}',
    last_contacted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CONTACT GROUPS TABLE
-- Organize contacts into groups/lists
-- ============================================
CREATE TABLE contact_groups (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#4F46E5',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CONTACT GROUP MEMBERS TABLE
-- Many-to-Many: Contacts can belong to multiple groups
-- ============================================
CREATE TABLE contact_group_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES contact_groups(id) ON DELETE CASCADE,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, contact_id)
);

-- ============================================
-- CAMPAIGNS TABLE
-- Stores SMS campaign information
-- ============================================
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed')),
    campaign_type VARCHAR(20) DEFAULT 'broadcast' CHECK (campaign_type IN ('broadcast', 'automated', 'transactional')),
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    -- Statistics (denormalized for performance)
    total_recipients INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    messages_delivered INTEGER DEFAULT 0,
    messages_failed INTEGER DEFAULT 0,
    responses_count INTEGER DEFAULT 0,
    opt_outs_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CAMPAIGN CONTACTS TABLE
-- Many-to-Many: Campaign recipients
-- ============================================
CREATE TABLE campaign_contacts (
    id SERIAL PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'opted_out')),
    added_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    UNIQUE(campaign_id, contact_id)
);

-- ============================================
-- MESSAGES TABLE
-- Stores all SMS messages (sent and received)
-- ============================================
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
    -- Message details
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    from_number VARCHAR(20) NOT NULL,
    to_number VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    -- Twilio tracking
    twilio_sid VARCHAR(50),
    twilio_status VARCHAR(20) DEFAULT 'queued' CHECK (twilio_status IN ('queued', 'sending', 'sent', 'delivered', 'undelivered', 'failed', 'received')),
    error_code VARCHAR(10),
    error_message TEXT,
    -- Pricing
    segments INTEGER DEFAULT 1,
    price DECIMAL(10, 4),
    price_unit VARCHAR(3) DEFAULT 'USD',
    -- Timestamps
    queued_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- OPT OUTS TABLE
-- Tracks contacts who opted out of SMS
-- ============================================
CREATE TABLE opt_outs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
    phone VARCHAR(20) NOT NULL,
    reason VARCHAR(50) DEFAULT 'user_request' CHECK (reason IN ('user_request', 'stop_keyword', 'complaint', 'invalid_number', 'manual')),
    message_id INTEGER REFERENCES messages(id) ON DELETE SET NULL,
    opted_out_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MESSAGE ANALYTICS TABLE
-- Daily aggregated analytics
-- ============================================
CREATE TABLE message_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    messages_sent INTEGER DEFAULT 0,
    messages_delivered INTEGER DEFAULT 0,
    messages_failed INTEGER DEFAULT 0,
    messages_received INTEGER DEFAULT 0,
    opt_outs INTEGER DEFAULT 0,
    total_cost DECIMAL(10, 4) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Twilio settings indexes
CREATE INDEX idx_twilio_settings_user_id ON twilio_settings(user_id);

-- Contacts indexes
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_phone ON contacts(phone);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_user_status ON contacts(user_id, status);

-- Contact groups indexes
CREATE INDEX idx_contact_groups_user_id ON contact_groups(user_id);
CREATE INDEX idx_contact_group_members_group_id ON contact_group_members(group_id);
CREATE INDEX idx_contact_group_members_contact_id ON contact_group_members(contact_id);

-- Campaigns indexes
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled_at ON campaigns(scheduled_at);
CREATE INDEX idx_campaigns_user_status ON campaigns(user_id, status);

-- Campaign contacts indexes
CREATE INDEX idx_campaign_contacts_campaign_id ON campaign_contacts(campaign_id);
CREATE INDEX idx_campaign_contacts_contact_id ON campaign_contacts(contact_id);
CREATE INDEX idx_campaign_contacts_status ON campaign_contacts(status);

-- Messages indexes
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_contact_id ON messages(contact_id);
CREATE INDEX idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_twilio_sid ON messages(twilio_sid);
CREATE INDEX idx_messages_twilio_status ON messages(twilio_status);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_user_contact ON messages(user_id, contact_id);

-- Opt outs indexes
CREATE INDEX idx_opt_outs_user_id ON opt_outs(user_id);
CREATE INDEX idx_opt_outs_phone ON opt_outs(phone);
CREATE INDEX idx_opt_outs_contact_id ON opt_outs(contact_id);

-- Analytics indexes
CREATE INDEX idx_message_analytics_user_id ON message_analytics(user_id);
CREATE INDEX idx_message_analytics_date ON message_analytics(date);
CREATE INDEX idx_message_analytics_user_date ON message_analytics(user_id, date);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_twilio_settings_updated_at
    BEFORE UPDATE ON twilio_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_groups_updated_at
    BEFORE UPDATE ON contact_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_analytics_updated_at
    BEFORE UPDATE ON message_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View: User dashboard statistics
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT
    u.id AS user_id,
    COUNT(DISTINCT c.id) AS total_contacts,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'active') AS active_contacts,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'opted_out') AS opted_out_contacts,
    COUNT(DISTINCT camp.id) AS total_campaigns,
    COUNT(DISTINCT camp.id) FILTER (WHERE camp.status = 'draft') AS draft_campaigns,
    COUNT(DISTINCT camp.id) FILTER (WHERE camp.status = 'sent') AS sent_campaigns,
    COUNT(DISTINCT m.id) FILTER (WHERE m.direction = 'outbound') AS messages_sent,
    COUNT(DISTINCT m.id) FILTER (WHERE m.direction = 'inbound') AS messages_received
FROM users u
LEFT JOIN contacts c ON c.user_id = u.id
LEFT JOIN campaigns camp ON camp.user_id = u.id
LEFT JOIN messages m ON m.user_id = u.id
GROUP BY u.id;

-- View: Campaign performance summary
CREATE OR REPLACE VIEW campaign_performance AS
SELECT
    c.id AS campaign_id,
    c.user_id,
    c.name,
    c.status,
    c.total_recipients,
    c.messages_sent,
    c.messages_delivered,
    c.messages_failed,
    c.responses_count,
    c.opt_outs_count,
    CASE
        WHEN c.messages_sent > 0
        THEN ROUND((c.messages_delivered::DECIMAL / c.messages_sent) * 100, 2)
        ELSE 0
    END AS delivery_rate,
    CASE
        WHEN c.messages_delivered > 0
        THEN ROUND((c.responses_count::DECIMAL / c.messages_delivered) * 100, 2)
        ELSE 0
    END AS response_rate,
    c.created_at,
    c.completed_at
FROM campaigns c;

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================

-- You can uncomment and modify this to add initial data
-- INSERT INTO users (email, password_hash, first_name, last_name)
-- VALUES ('admin@campaignhub.com', '$2a$10$...', 'Admin', 'User');
