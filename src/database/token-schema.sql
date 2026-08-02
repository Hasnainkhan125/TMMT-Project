-- Security Token Database Schema
-- This schema supports the complete tokenization lifecycle from creation to marketplace listing

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs for status fields
CREATE TYPE token_status AS ENUM (
    'draft',
    'pending_documents',
    'under_review',
    'pending_spv',
    'pending_approval',
    'approved',
    'listed',
    'paused',
    'delisted',
    'dissolved'
);

CREATE TYPE document_status AS ENUM (
    'pending',
    'uploaded',
    'verified',
    'rejected'
);

CREATE TYPE review_status AS ENUM (
    'pending',
    'in_review',
    'approved',
    'rejected'
);

CREATE TYPE investor_status AS ENUM (
    'active',
    'suspended',
    'blacklisted',
    'frozen'
);

CREATE TYPE kyc_status AS ENUM (
    'pending',
    'verified',
    'rejected',
    'expired'
);

CREATE TYPE transaction_type AS ENUM (
    'mint',
    'burn',
    'transfer',
    'freeze',
    'unfreeze',
    'pause',
    'unpause',
    'blacklist',
    'whitelist'
);

CREATE TYPE transaction_status AS ENUM (
    'pending',
    'confirmed',
    'failed',
    'reverted'
);

CREATE TYPE spv_status AS ENUM (
    'not_required',
    'pending',
    'in_formation',
    'formed',
    'dissolved'
);

CREATE TYPE investor_type AS ENUM (
    'retail',
    'accredited',
    'institutional',
    'qualified_institutional'
);

CREATE TYPE risk_level AS ENUM (
    'low',
    'medium',
    'high'
);

CREATE TYPE workflow_stage_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'rejected'
);

CREATE TYPE milestone_status AS ENUM (
    'pending',
    'completed',
    'overdue'
);

-- Main security tokens table
CREATE TABLE security_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic token information
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    decimals INTEGER DEFAULT 18,
    total_supply DECIMAL(78,0) NOT NULL,
    circulating_supply DECIMAL(78,0) DEFAULT 0,
    token_price DECIMAL(18,6) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Deployment information
    deployment_salt VARCHAR(255) NOT NULL UNIQUE,
    deployed_at TIMESTAMP,
    deployed_by VARCHAR(42) NOT NULL,
    
    -- Token economics
    market_cap DECIMAL(18,2),
    trading_volume_24h DECIMAL(18,2),
    price_change_24h DECIMAL(5,2),
    
    -- Token state
    is_paused BOOLEAN DEFAULT FALSE,
    is_transferable BOOLEAN DEFAULT TRUE,
    is_mintable BOOLEAN DEFAULT TRUE,
    is_burnable BOOLEAN DEFAULT FALSE,
    
    -- Asset information
    asset_category VARCHAR(50) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    asset_description TEXT,
    asset_value DECIMAL(18,2),
    asset_currency VARCHAR(3) DEFAULT 'USD',
    valuation_date DATE,
    valuation_method VARCHAR(100),
    jurisdiction VARCHAR(10) NOT NULL,
    asset_location VARCHAR(255),
    asset_identifier VARCHAR(255),
    asset_metadata JSONB,
    risk_level risk_level DEFAULT 'medium',
    liquidity_score INTEGER DEFAULT 50,
    legal_structure VARCHAR(100),
    ownership_type VARCHAR(100),
    
    -- Status and workflow
    current_status token_status DEFAULT 'draft',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    UNIQUE(symbol, deployed_by)
);

-- Contract addresses table
CREATE TABLE token_contract_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    -- Core contracts
    token_address VARCHAR(42) NOT NULL UNIQUE,
    identity_registry VARCHAR(42) NOT NULL,
    identity_registry_storage VARCHAR(42) NOT NULL,
    claim_topics_registry VARCHAR(42) NOT NULL,
    trusted_issuer_registry VARCHAR(42) NOT NULL,
    compliance_contract VARCHAR(42) NOT NULL,
    
    -- Optional contracts
    modular_compliance VARCHAR(42),
    trex_factory VARCHAR(42),
    implementation_authority VARCHAR(42),
    token_proxy VARCHAR(42),
    identity_registry_proxy VARCHAR(42),
    claim_topics_registry_proxy VARCHAR(42),
    agent_manager VARCHAR(42),
    
    -- Network information
    chain_id INTEGER NOT NULL,
    network_name VARCHAR(50) NOT NULL,
    block_number BIGINT,
    deployment_timestamp TIMESTAMP NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token owner information
CREATE TABLE token_owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    -- Owner details
    owner_address VARCHAR(42) NOT NULL,
    owner_name VARCHAR(255),
    owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('individual', 'company', 'institution')),
    
    -- Company details
    company_name VARCHAR(255),
    company_registration_number VARCHAR(100),
    company_jurisdiction VARCHAR(10),
    
    -- Contact information
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    
    -- Identity verification
    identity_verified BOOLEAN DEFAULT FALSE,
    kyc_status kyc_status DEFAULT 'pending',
    kyc_provider VARCHAR(100),
    kyc_verified_at TIMESTAMP,
    
    -- Permissions
    can_mint BOOLEAN DEFAULT TRUE,
    can_burn BOOLEAN DEFAULT TRUE,
    can_pause BOOLEAN DEFAULT TRUE,
    can_freeze BOOLEAN DEFAULT TRUE,
    can_blacklist BOOLEAN DEFAULT TRUE,
    can_update_compliance BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token agents information
CREATE TABLE token_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    -- Agent addresses
    identity_registry_agent VARCHAR(42) NOT NULL,
    token_agent VARCHAR(42) NOT NULL,
    compliance_agent VARCHAR(42),
    transfer_agent VARCHAR(42),
    registrar_agent VARCHAR(42),
    
    -- Agent permissions (stored as JSONB)
    agent_permissions JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance configuration
CREATE TABLE compliance_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    -- Required claims
    required_claims TEXT[] NOT NULL DEFAULT '{}',
    claim_topics INTEGER[] NOT NULL DEFAULT '{}',
    
    -- Compliance modules configuration
    country_allow_enabled BOOLEAN DEFAULT TRUE,
    allowed_countries INTEGER[] DEFAULT '{}',
    
    country_restrict_enabled BOOLEAN DEFAULT FALSE,
    restricted_countries INTEGER[] DEFAULT '{}',
    
    max_balance_enabled BOOLEAN DEFAULT TRUE,
    max_balance DECIMAL(78,0) DEFAULT 1000000,
    
    transfer_restrict_enabled BOOLEAN DEFAULT FALSE,
    transfer_restrictions TEXT[] DEFAULT '{}',
    
    time_restrict_enabled BOOLEAN DEFAULT FALSE,
    time_restrictions JSONB DEFAULT '[]',
    
    -- KYC/AML requirements
    kyc_required BOOLEAN DEFAULT TRUE,
    aml_required BOOLEAN DEFAULT TRUE,
    accreditation_required BOOLEAN DEFAULT FALSE,
    
    -- Compliance checks
    automatic_compliance BOOLEAN DEFAULT TRUE,
    manual_review_required BOOLEAN DEFAULT FALSE,
    
    -- Trusted issuers
    trusted_issuers TEXT[] DEFAULT '{}',
    claim_issuers TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document requirements
CREATE TABLE document_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    -- Document information
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    description TEXT,
    category VARCHAR(20) NOT NULL CHECK (category IN ('general', 'asset_specific', 'compliance', 'legal')),
    
    -- Upload status
    upload_status document_status DEFAULT 'pending',
    ipfs_hash VARCHAR(255),
    ipfs_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    uploaded_at TIMESTAMP,
    uploaded_by VARCHAR(42),
    
    -- Verification status
    verified_at TIMESTAMP,
    verified_by VARCHAR(42),
    rejection_reason TEXT,
    
    -- Review process
    review_status review_status DEFAULT 'pending',
    reviewed_by VARCHAR(42),
    reviewed_at TIMESTAMP,
    review_comments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SPV information
CREATE TABLE spv_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    -- SPV details
    spv_required BOOLEAN DEFAULT FALSE,
    spv_status spv_status DEFAULT 'not_required',
    
    -- SPV entity details
    spv_name VARCHAR(255),
    spv_entity_type VARCHAR(50),
    spv_jurisdiction VARCHAR(10),
    spv_registration_number VARCHAR(100),
    spv_address TEXT,
    
    -- SPV formation
    formation_date DATE,
    formation_cost DECIMAL(18,2),
    legal_counsel VARCHAR(255),
    
    -- SPV management
    spv_manager VARCHAR(255),
    spv_directors TEXT[],
    spv_shareholders TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token status history
CREATE TABLE token_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    status token_status NOT NULL,
    updated_by VARCHAR(42) NOT NULL,
    reason TEXT,
    comments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approval workflow
CREATE TABLE approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    stage VARCHAR(100) NOT NULL,
    status workflow_stage_status DEFAULT 'pending',
    assigned_to VARCHAR(42),
    due_date DATE,
    completed_at TIMESTAMP,
    comments TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Milestones
CREATE TABLE token_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    completed_date DATE,
    status milestone_status DEFAULT 'pending',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investors
CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    -- Wallet and identity
    wallet_address VARCHAR(42) NOT NULL,
    onchain_identity VARCHAR(42),
    
    -- Personal information
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(2),
    country VARCHAR(2) NOT NULL,
    
    -- Investor classification
    investor_type investor_type DEFAULT 'retail',
    accreditation_status BOOLEAN DEFAULT FALSE,
    accreditation_date DATE,
    accreditation_expiry DATE,
    
    -- Compliance status
    kyc_status kyc_status DEFAULT 'pending',
    aml_status kyc_status DEFAULT 'pending',
    compliance_score INTEGER DEFAULT 0,
    risk_level risk_level DEFAULT 'medium',
    
    -- Investment details
    total_investment DECIMAL(18,6) DEFAULT 0,
    token_balance DECIMAL(78,0) DEFAULT 0,
    average_purchase_price DECIMAL(18,6) DEFAULT 0,
    realized_pnl DECIMAL(18,6) DEFAULT 0,
    unrealized_pnl DECIMAL(18,6) DEFAULT 0,
    
    -- Activity
    first_investment TIMESTAMP,
    last_activity TIMESTAMP,
    transaction_count INTEGER DEFAULT 0,
    
    -- Status
    status investor_status DEFAULT 'active',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(token_id, wallet_address)
);

-- Investor claims
CREATE TABLE investor_claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE CASCADE,
    
    claim_type VARCHAR(100) NOT NULL,
    claim_value TEXT NOT NULL,
    claim_issuer VARCHAR(42) NOT NULL,
    claim_date TIMESTAMP NOT NULL,
    claim_expiry TIMESTAMP,
    claim_status VARCHAR(20) DEFAULT 'valid' CHECK (claim_status IN ('valid', 'expired', 'revoked')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Account management
CREATE TABLE blacklisted_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    address VARCHAR(42) NOT NULL,
    blacklisted_by VARCHAR(42) NOT NULL,
    reason TEXT NOT NULL,
    can_revert BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(token_id, address)
);

CREATE TABLE whitelisted_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    address VARCHAR(42) NOT NULL,
    whitelisted_by VARCHAR(42) NOT NULL,
    privileges TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(token_id, address)
);

CREATE TABLE frozen_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    address VARCHAR(42) NOT NULL,
    frozen_by VARCHAR(42) NOT NULL,
    reason TEXT NOT NULL,
    frozen_amount DECIMAL(78,0),
    can_unfreeze BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(token_id, address)
);

-- Transactions
CREATE TABLE token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    -- Transaction details
    tx_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    transaction_type transaction_type NOT NULL,
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    amount DECIMAL(78,0),
    
    -- Context
    initiated_by VARCHAR(42) NOT NULL,
    reason TEXT,
    compliance_check BOOLEAN DEFAULT TRUE,
    
    -- Status
    status transaction_status DEFAULT 'pending',
    gas_used DECIMAL(20,0),
    gas_price DECIMAL(20,0),
    
    -- Compliance
    compliance_validated BOOLEAN DEFAULT FALSE,
    compliance_rules TEXT[] DEFAULT '{}',
    
    -- Related data
    investment_order_id UUID,
    approval_id UUID,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tx_hash, token_id)
);

-- Analytics - Price history
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    price DECIMAL(18,6) NOT NULL,
    volume DECIMAL(18,6) DEFAULT 0,
    market_cap DECIMAL(18,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(token_id, date)
);

-- Analytics - Investor demographics
CREATE TABLE investor_demographics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    country VARCHAR(2) NOT NULL,
    investor_count INTEGER DEFAULT 0,
    percentage DECIMAL(5,2) DEFAULT 0,
    total_investment DECIMAL(18,6) DEFAULT 0,
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(token_id, country)
);

-- Token metadata
CREATE TABLE token_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_id UUID NOT NULL REFERENCES security_tokens(id) ON DELETE CASCADE,
    
    version VARCHAR(10) DEFAULT '1.0',
    updated_by VARCHAR(42) NOT NULL,
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_security_tokens_symbol ON security_tokens(symbol);
CREATE INDEX idx_security_tokens_deployed_by ON security_tokens(deployed_by);
CREATE INDEX idx_security_tokens_status ON security_tokens(current_status);
CREATE INDEX idx_security_tokens_asset_category ON security_tokens(asset_category);
CREATE INDEX idx_security_tokens_jurisdiction ON security_tokens(jurisdiction);

CREATE INDEX idx_token_contract_addresses_token_id ON token_contract_addresses(token_id);
CREATE INDEX idx_token_contract_addresses_token_address ON token_contract_addresses(token_address);

CREATE INDEX idx_investors_token_id ON investors(token_id);
CREATE INDEX idx_investors_wallet_address ON investors(wallet_address);
CREATE INDEX idx_investors_status ON investors(status);
CREATE INDEX idx_investors_kyc_status ON investors(kyc_status);

CREATE INDEX idx_token_transactions_token_id ON token_transactions(token_id);
CREATE INDEX idx_token_transactions_tx_hash ON token_transactions(tx_hash);
CREATE INDEX idx_token_transactions_type ON token_transactions(transaction_type);
CREATE INDEX idx_token_transactions_status ON token_transactions(status);

CREATE INDEX idx_document_requirements_token_id ON document_requirements(token_id);
CREATE INDEX idx_document_requirements_status ON document_requirements(upload_status);

CREATE INDEX idx_price_history_token_id ON price_history(token_id);
CREATE INDEX idx_price_history_date ON price_history(date);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_security_tokens_updated_at BEFORE UPDATE ON security_tokens FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_token_owners_updated_at BEFORE UPDATE ON token_owners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_token_agents_updated_at BEFORE UPDATE ON token_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_configurations_updated_at BEFORE UPDATE ON compliance_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_document_requirements_updated_at BEFORE UPDATE ON document_requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spv_information_updated_at BEFORE UPDATE ON spv_information FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_approval_workflows_updated_at BEFORE UPDATE ON approval_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_token_milestones_updated_at BEFORE UPDATE ON token_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_token_metadata_updated_at BEFORE UPDATE ON token_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE VIEW token_overview AS
SELECT 
    st.id,
    st.name,
    st.symbol,
    st.current_status,
    st.asset_category,
    st.asset_type,
    st.jurisdiction,
    st.token_price,
    st.market_cap,
    st.created_at,
    tca.token_address,
    tca.chain_id,
    tca.network_name,
    to_.owner_address,
    to_.owner_name,
    COUNT(DISTINCT i.id) as investor_count,
    SUM(i.token_balance) as total_tokens_held
FROM security_tokens st
LEFT JOIN token_contract_addresses tca ON st.id = tca.token_id
LEFT JOIN token_owners to_ ON st.id = to_.token_id
LEFT JOIN investors i ON st.id = i.token_id AND i.status = 'active'
GROUP BY st.id, tca.token_address, tca.chain_id, tca.network_name, to_.owner_address, to_.owner_name;

CREATE VIEW investor_summary AS
SELECT 
    i.id,
    i.token_id,
    st.symbol as token_symbol,
    i.wallet_address,
    i.full_name,
    i.email,
    i.country,
    i.investor_type,
    i.kyc_status,
    i.aml_status,
    i.compliance_score,
    i.total_investment,
    i.token_balance,
    i.status,
    i.created_at
FROM investors i
JOIN security_tokens st ON i.token_id = st.id;

CREATE VIEW document_status_summary AS
SELECT 
    dr.token_id,
    st.symbol as token_symbol,
    COUNT(*) as total_documents,
    COUNT(CASE WHEN dr.upload_status = 'uploaded' THEN 1 END) as uploaded_documents,
    COUNT(CASE WHEN dr.upload_status = 'verified' THEN 1 END) as verified_documents,
    COUNT(CASE WHEN dr.upload_status = 'rejected' THEN 1 END) as rejected_documents,
    COUNT(CASE WHEN dr.upload_status = 'pending' THEN 1 END) as pending_documents
FROM document_requirements dr
JOIN security_tokens st ON dr.token_id = st.id
GROUP BY dr.token_id, st.symbol;

-- Insert initial data for asset categories and jurisdictions
-- This would be populated by the application based on the constants in token-models.ts 