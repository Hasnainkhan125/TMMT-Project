import { tokenService } from '../services/token-service'
import { 
  SecurityToken, 
  TokenStatusEnum, 
  DocumentStatusEnum,
  CreateTokenRequest,
  ASSET_CATEGORIES,
  JURISDICTION_REQUIREMENTS
} from '../types/token-models'

/**
 * Complete Token Lifecycle Example
 * This example demonstrates the full process from token creation to marketplace listing
 */

export class TokenLifecycleExample {
  private tokenId: string = ''
  private issuerAddress: string = '0x1234567890123456789012345678901234567890'

  async demonstrateCompleteLifecycle() {
    console.log('🚀 Starting Complete Token Lifecycle Demo')
    console.log('=' .repeat(50))

    try {
      // Step 1: Create Token
      await this.step1_CreateToken()
      
      // Step 2: Upload Documents
      await this.step2_UploadDocuments()
      
      // Step 3: Document Review Process
      await this.step3_DocumentReview()
      
      // Step 4: SPV Formation (if required)
      await this.step4_SPVFormation()
      
      // Step 5: Compliance Approval
      await this.step5_ComplianceApproval()
      
      // Step 6: Token Deployment
      await this.step6_TokenDeployment()
      
      // Step 7: Investor Onboarding
      await this.step7_InvestorOnboarding()
      
      // Step 8: Token Management
      await this.step8_TokenManagement()
      
      // Step 9: Marketplace Listing
      await this.step9_MarketplaceListing()
      
      // Step 10: Analytics and Reporting
      await this.step10_AnalyticsReporting()

      console.log('✅ Complete Token Lifecycle Demo Completed Successfully!')
      
    } catch (error) {
      console.error('❌ Error in token lifecycle:', error)
      throw error
    }
  }

  private async step1_CreateToken() {
    console.log('\n📝 Step 1: Token Creation')
    console.log('-'.repeat(30))

    const createTokenRequest: CreateTokenRequest = {
      // Basic token information
      basicInfo: {
        name: 'Manhattan Premium Office Building',
        symbol: 'MPOB',
        decimals: 18,
        totalSupply: '1000000',
        tokenPrice: '100.00',
        currency: 'USD',
        deploymentSalt: 'manhattan-office-2024-001',
        deployedBy: this.issuerAddress,
        isPaused: false,
        isTransferable: true,
        isMintable: true,
        isBurnable: false
      },

      // Asset information
      assetInfo: {
        assetCategory: 'real-estate',
        assetType: 'commercial',
        assetDescription: 'Prime commercial office building in Manhattan Financial District with 50,000 sq ft of rentable space, fully leased to AAA-rated tenants with 10-year average lease terms.',
        assetValue: '100000000',
        assetCurrency: 'USD',
        valuationDate: '2024-01-15',
        valuationMethod: 'Third-party professional appraisal',
        jurisdiction: 'US',
        location: 'New York, NY, USA',
        assetIdentifier: 'NYC-REG-2024-001',
        assetMetadata: {
          buildingType: 'Office',
          yearBuilt: '2018',
          floors: 25,
          sqft: 50000,
          tenants: [
            { name: 'Goldman Sachs', sqft: 20000, leaseExpiry: '2034-12-31' },
            { name: 'Morgan Stanley', sqft: 15000, leaseExpiry: '2033-06-30' },
            { name: 'BlackRock', sqft: 15000, leaseExpiry: '2035-03-31' }
          ]
        },
        riskLevel: 'Low',
        liquidityScore: 75,
        legalStructure: 'SPV',
        ownershipType: 'Freehold'
      },

      // Compliance configuration
      complianceConfig: {
        requiredClaims: ['IDENTITY_CLAIM', 'KYC_CLAIM', 'AML_CLAIM'],
        claimTopics: [1, 2, 3],
        modules: {
          CountryAllowModule: {
            enabled: true,
            allowedCountries: [840, 826, 276] // US, UK, Germany
          },
          CountryRestrictModule: {
            enabled: false,
            restrictedCountries: []
          },
          MaxBalanceModule: {
            enabled: true,
            maxBalance: '100000' // Max 100,000 tokens per wallet
          },
          TransferRestrictModule: {
            enabled: true,
            restrictions: ['accredited_only', 'kyc_required']
          },
          TimeRestrictModule: {
            enabled: true,
            restrictions: [
              {
                restrictionType: 'hold_period',
                duration: 31536000, // 1 year in seconds
                description: 'Minimum 1 year holding period for all investors'
              }
            ]
          }
        },
        kycRequired: true,
        amlRequired: true,
        accreditationRequired: true,
        automaticCompliance: true,
        manualReviewRequired: false,
        trustedIssuers: [this.issuerAddress],
        claimIssuers: [this.issuerAddress]
      },

      // Owner information
      ownerInfo: {
        ownerAddress: this.issuerAddress,
        ownerName: 'Manhattan Real Estate Holdings LLC',
        ownerType: 'company',
        companyName: 'Manhattan Real Estate Holdings LLC',
        companyRegistrationNumber: 'NY-LLC-2024-001',
        companyJurisdiction: 'US',
        email: 'admin@manhattanre.com',
        phone: '+1-212-555-0123',
        address: '123 Wall Street, New York, NY 10005',
        identityVerified: true,
        kycStatus: 'verified',
        kycProvider: 'Jumio',
        permissions: {
          canMint: true,
          canBurn: true,
          canPause: true,
          canFreeze: true,
          canBlacklist: true,
          canUpdateCompliance: true
        }
      },

      // Agent information
      agentInfo: {
        identityRegistryAgent: this.issuerAddress,
        tokenAgent: this.issuerAddress,
        complianceAgent: this.issuerAddress,
        agentPermissions: {
          [this.issuerAddress]: ['mint', 'burn', 'pause', 'freeze', 'compliance']
        }
      },

      // Documents (will be uploaded separately)
      documents: []
    }

    const response = await tokenService.createToken(createTokenRequest)
    this.tokenId = response.tokenId

    console.log(`✅ Token created successfully with ID: ${this.tokenId}`)
    console.log(`📋 Contract Address: ${response.contractAddresses.tokenAddress}`)
    console.log(`⏱️  Estimated completion: ${response.estimatedCompletionTime}`)
    console.log(`📝 Next steps: ${response.nextSteps.join(', ')}`)
  }

  private async step2_UploadDocuments() {
    console.log('\n📄 Step 2: Document Upload')
    console.log('-'.repeat(30))

    // Get required documents for US commercial real estate
    const requiredDocs = tokenService.getRequiredDocuments('US', 'commercial')
    console.log(`📋 Required documents (${requiredDocs.length}):`)
    requiredDocs.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc}`)
    })

    // Simulate document uploads
    const documentUploads = [
      { type: 'Business License', fileName: 'ny_business_license.pdf' },
      { type: 'Tax ID (EIN)', fileName: 'ein_certificate.pdf' },
      { type: 'Articles of Incorporation', fileName: 'articles_of_incorporation.pdf' },
      { type: 'Operating Agreement', fileName: 'operating_agreement.pdf' },
      { type: 'Commercial Property Deed', fileName: 'property_deed.pdf' },
      { type: 'Lease Agreements', fileName: 'tenant_leases.pdf' },
      { type: 'Environmental Assessment', fileName: 'environmental_report.pdf' },
      { type: 'Building Permits', fileName: 'building_permits.pdf' },
      { type: 'Fire Safety Certificate', fileName: 'fire_safety_cert.pdf' }
    ]

    console.log('\n📤 Uploading documents...')
    for (const doc of documentUploads) {
      // Simulate file upload
      const mockFile = new File(['mock content'], doc.fileName, { type: 'application/pdf' })
      
      try {
        const uploadedDoc = await tokenService.uploadDocument(this.tokenId, doc.type, mockFile)
        console.log(`   ✅ ${doc.type} uploaded successfully`)
        console.log(`      📁 IPFS: ${uploadedDoc.ipfsHash}`)
      } catch (error) {
        console.log(`   ❌ Failed to upload ${doc.type}`)
      }
    }

    // Update token status
    await tokenService.updateTokenStatus(this.tokenId, TokenStatusEnum.UNDER_REVIEW, 'All documents uploaded')
    console.log('\n✅ All documents uploaded, token moved to review status')
  }

  private async step3_DocumentReview() {
    console.log('\n🔍 Step 3: Document Review Process')
    console.log('-'.repeat(30))

    // Get documents for review
    const documents = await tokenService.getDocuments(this.tokenId)
    console.log(`📋 Reviewing ${documents.length} documents...`)

    // Simulate document review process
    for (const doc of documents) {
      console.log(`\n   📄 Reviewing: ${doc.documentName}`)
      
      // Simulate review delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 90% approval rate simulation
      const isApproved = Math.random() > 0.1
      
      if (isApproved) {
        await tokenService.updateDocumentStatus(
          this.tokenId,
          doc.id,
          DocumentStatusEnum.VERIFIED,
          'Document verified and approved'
        )
        console.log(`      ✅ Approved`)
      } else {
        await tokenService.updateDocumentStatus(
          this.tokenId,
          doc.id,
          DocumentStatusEnum.REJECTED,
          'Document requires additional information'
        )
        console.log(`      ❌ Rejected - requires resubmission`)
      }
    }

    console.log('\n✅ Document review completed')
  }

  private async step4_SPVFormation() {
    console.log('\n🏢 Step 4: SPV Formation')
    console.log('-'.repeat(30))

    // Create SPV for the real estate asset
    const spvData = {
      spvName: 'Manhattan Premium Office Building SPV LLC',
      spvEntityType: 'LLC',
      spvJurisdiction: 'Delaware',
      spvAddress: '123 Wall Street, New York, NY 10005',
      legalCounsel: 'Kirkland & Ellis LLP',
      spvManager: 'Manhattan Real Estate Holdings LLC',
      spvDirectors: ['John Smith', 'Jane Doe'],
      spvShareholders: ['Manhattan Real Estate Holdings LLC']
    }

    console.log('📋 Creating SPV entity...')
    const spv = await tokenService.createSPV(this.tokenId, spvData)
    console.log(`✅ SPV created: ${spv.spvName}`)

    // Update SPV status progression
    console.log('📝 SPV formation process:')
    
    await tokenService.updateSPVStatus(this.tokenId, 'pending', { notes: 'SPV formation initiated' })
    console.log('   1. ⏳ SPV formation initiated')
    
    await new Promise(resolve => setTimeout(resolve, 200))
    await tokenService.updateSPVStatus(this.tokenId, 'in_formation', { notes: 'Legal documents being prepared' })
    console.log('   2. ⏳ Legal documents being prepared')
    
    await new Promise(resolve => setTimeout(resolve, 200))
    await tokenService.updateSPVStatus(this.tokenId, 'formed', { 
      notes: 'SPV successfully formed and registered',
      registrationNumber: 'DE-LLC-2024-001',
      formationDate: new Date().toISOString().split('T')[0]
    })
    console.log('   3. ✅ SPV successfully formed')

    // Update token status
    await tokenService.updateTokenStatus(this.tokenId, TokenStatusEnum.PENDING_APPROVAL, 'SPV formation completed')
    console.log('\n✅ SPV formation completed, token ready for final approval')
  }

  private async step5_ComplianceApproval() {
    console.log('\n✅ Step 5: Compliance Approval')
    console.log('-'.repeat(30))

    // Simulate compliance approval workflow
    const approvalStages = [
      { stage: 'legal_review', assignee: 'Legal Team' },
      { stage: 'financial_review', assignee: 'Finance Team' },
      { stage: 'compliance_check', assignee: 'Compliance Officer' },
      { stage: 'final_approval', assignee: 'Managing Director' }
    ]

    console.log('📋 Processing approval workflow...')
    for (const stage of approvalStages) {
      console.log(`\n   📝 ${stage.stage.replace('_', ' ').toUpperCase()}`)
      console.log(`      👤 Assigned to: ${stage.assignee}`)
      
      // Advance workflow
      await tokenService.advanceWorkflow(this.tokenId, stage.stage, 'approve', 'All requirements met')
      console.log(`      ✅ Approved`)
    }

    // Update token status to approved
    await tokenService.updateTokenStatus(this.tokenId, TokenStatusEnum.APPROVED, 'All compliance requirements met')
    console.log('\n✅ Token approved for deployment')
  }

  private async step6_TokenDeployment() {
    console.log('\n🚀 Step 6: Token Deployment')
    console.log('-'.repeat(30))

    console.log('📦 Deploying smart contracts...')
    
    // Simulate contract deployment
    const deploymentSteps = [
      'Identity Registry deployment',
      'Compliance module deployment',
      'Token contract deployment',
      'Claim Topics Registry deployment',
      'Trusted Issuer Registry deployment'
    ]

    for (const step of deploymentSteps) {
      console.log(`   ⏳ ${step}...`)
      await new Promise(resolve => setTimeout(resolve, 100))
      console.log(`   ✅ ${step} completed`)
    }

    // Update token status to listed
    await tokenService.updateTokenStatus(this.tokenId, TokenStatusEnum.LISTED, 'Token successfully deployed and listed')
    console.log('\n✅ Token deployed and listed on marketplace')
  }

  private async step7_InvestorOnboarding() {
    console.log('\n👥 Step 7: Investor Onboarding')
    console.log('-'.repeat(30))

    // Sample investors
    const investors = [
      {
        walletAddress: '0x2345678901234567890123456789012345678901',
        fullName: 'Alice Johnson',
        email: 'alice.johnson@email.com',
        country: 'US',
        investorType: 'accredited' as const,
        accreditationStatus: true,
        totalInvestment: '50000',
        tokenBalance: '500'
      },
      {
        walletAddress: '0x3456789012345678901234567890123456789012',
        fullName: 'Bob Smith',
        email: 'bob.smith@email.com',
        country: 'UK',
        investorType: 'institutional' as const,
        accreditationStatus: true,
        totalInvestment: '200000',
        tokenBalance: '2000'
      },
      {
        walletAddress: '0x4567890123456789012345678901234567890123',
        fullName: 'Carol Davis',
        email: 'carol.davis@email.com',
        country: 'DE',
        investorType: 'accredited' as const,
        accreditationStatus: true,
        totalInvestment: '75000',
        tokenBalance: '750'
      }
    ]

    console.log('📋 Onboarding investors...')
    for (const investor of investors) {
      console.log(`\n   👤 ${investor.fullName}`)
      console.log(`      📧 ${investor.email}`)
      console.log(`      🏠 ${investor.country}`)
      console.log(`      💰 Investment: $${parseInt(investor.totalInvestment).toLocaleString()}`)
      
      // Add investor
      await tokenService.addInvestor(this.tokenId, investor)
      console.log(`      ✅ Investor onboarded successfully`)
    }

    console.log('\n✅ All investors onboarded')
  }

  private async step8_TokenManagement() {
    console.log('\n⚙️ Step 8: Token Management Operations')
    console.log('-'.repeat(30))

    // Demonstrate various token management operations
    
    // 1. Mint tokens for approved investor
    console.log('🔨 Minting tokens for approved investment...')
    await tokenService.addTransaction(this.tokenId, {
      type: 'mint',
      to: '0x2345678901234567890123456789012345678901',
      amount: '500',
      initiatedBy: this.issuerAddress,
      reason: 'Approved investment order #001',
      complianceCheck: true,
      status: 'confirmed'
    })
    console.log('   ✅ 500 tokens minted')

    // 2. Freeze suspicious account
    console.log('\n🔒 Freezing suspicious account...')
    await tokenService.freezeAccount(this.tokenId, '0x9999999999999999999999999999999999999999', 'Suspicious activity detected')
    console.log('   ✅ Account frozen')

    // 3. Blacklist non-compliant account
    console.log('\n🚫 Blacklisting non-compliant account...')
    await tokenService.blacklistAccount(this.tokenId, '0x8888888888888888888888888888888888888888', 'Failed KYC verification')
    console.log('   ✅ Account blacklisted')

    // 4. Whitelist VIP investor
    console.log('\n⭐ Whitelisting VIP investor...')
    await tokenService.whitelistAccount(this.tokenId, '0x7777777777777777777777777777777777777777', ['high_limit', 'early_redemption'])
    console.log('   ✅ VIP investor whitelisted')

    console.log('\n✅ Token management operations completed')
  }

  private async step9_MarketplaceListing() {
    console.log('\n🏪 Step 9: Marketplace Listing')
    console.log('-'.repeat(30))

    // List token in marketplace
    console.log('📋 Listing token in marketplace...')
    await tokenService.listTokenInMarketplace(this.tokenId)
    console.log('   ✅ Token listed in marketplace')

    // Display marketplace information
    const token = await tokenService.getToken(this.tokenId)
    console.log('\n📊 Marketplace Listing Details:')
    console.log(`   🏷️  Name: ${token.basicInfo.name}`)
    console.log(`   🔤 Symbol: ${token.basicInfo.symbol}`)
    console.log(`   💰 Price: $${token.basicInfo.tokenPrice}`)
    console.log(`   📈 Market Cap: $${token.basicInfo.marketCap?.toLocaleString()}`)
    console.log(`   🏢 Asset Type: ${token.assetInfo.assetType}`)
    console.log(`   🌍 Jurisdiction: ${token.assetInfo.jurisdiction}`)
    console.log(`   📊 Status: ${token.tokenStatus.currentStatus}`)

    console.log('\n✅ Token successfully listed and available for trading')
  }

  private async step10_AnalyticsReporting() {
    console.log('\n📊 Step 10: Analytics & Reporting')
    console.log('-'.repeat(30))

    // Get token analytics
    const analytics = await tokenService.getTokenAnalytics(this.tokenId)
    
    console.log('📈 Token Performance:')
    console.log(`   💰 Total Raised: $${analytics.totalRaised?.toLocaleString()}`)
    console.log(`   👥 Total Investors: ${analytics.totalInvestors}`)
    console.log(`   📊 Average Investment: $${analytics.averageInvestment?.toLocaleString()}`)
    console.log(`   📈 Trading Volume: $${analytics.totalVolume?.toLocaleString()}`)
    console.log(`   🔄 Total Transactions: ${analytics.totalTransactions}`)

    console.log('\n🌍 Investor Demographics:')
    analytics.investorDemographics?.forEach((demo: any) => {
      console.log(`   ${demo.country}: ${demo.count} investors (${demo.percentage}%)`)
    })

    console.log('\n✅ Compliance Metrics:')
    console.log(`   📋 Compliance Score: ${analytics.complianceScore}%`)
    console.log(`   🆔 KYC Completion: ${analytics.kycCompletionRate}%`)
    console.log(`   🔍 AML Pass Rate: ${analytics.amlPassRate}%`)
    console.log(`   ⚠️  Risk Score: ${analytics.riskScore}/100`)

    // Generate compliance report
    console.log('\n📄 Generating compliance report...')
    const reportBlob = await tokenService.generateComplianceReport(this.tokenId, 'monthly')
    console.log(`   ✅ Compliance report generated (${reportBlob.size} bytes)`)

    console.log('\n✅ Analytics and reporting completed')
  }

  // Utility method to demonstrate token query operations
  async demonstrateTokenQueries() {
    console.log('\n🔍 Demonstrating Token Query Operations')
    console.log('=' .repeat(50))

    // Get all tokens by owner
    const ownerTokens = await tokenService.getTokensByOwner(this.issuerAddress)
    console.log(`📋 Found ${ownerTokens.length} tokens for owner ${this.issuerAddress}`)

    // Get token details
    const tokenDetails = await tokenService.getToken(this.tokenId)
    console.log(`📊 Token Details for ${tokenDetails.basicInfo.symbol}:`)
    console.log(`   Status: ${tokenDetails.tokenStatus.currentStatus}`)
    console.log(`   Investors: ${tokenDetails.investors.length}`)
    console.log(`   Transactions: ${tokenDetails.transactions.length}`)

    // Get investors
    const investors = await tokenService.getInvestors(this.tokenId)
    console.log(`👥 Found ${investors.length} investors`)

    // Get documents
    const documents = await tokenService.getDocuments(this.tokenId)
    console.log(`📄 Found ${documents.length} documents`)

    // Get transactions
    const transactions = await tokenService.getTransactions(this.tokenId, 10)
    console.log(`🔄 Found ${transactions.length} recent transactions`)

    console.log('\n✅ Query operations completed')
  }
}

// Example usage
export async function runTokenLifecycleDemo() {
  const demo = new TokenLifecycleExample()
  
  try {
    await demo.demonstrateCompleteLifecycle()
    await demo.demonstrateTokenQueries()
  } catch (error) {
    console.error('Demo failed:', error)
  }
}

// Export for use in other modules
export { TokenLifecycleExample } 