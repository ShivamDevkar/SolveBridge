import assert from 'node:assert/strict';

// Set test environment
process.env.NODE_ENV = 'test';

// Import services and mock adapters
import { mockAdminAdapter } from '../src/services/mockAdminAdapter.ts';
import { mockDisputeAdapter } from '../src/services/mockDisputeAdapter.ts';

async function runPhase08Tests() {
  console.log('--- Starting SolveBid Phase 08 Regression Suite ---');
  let passed = 0;
  let total = 0;

  function check(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            passed++;
            console.log(`  ✓ [Check ${total}] ${name}`);
          })
          .catch((err) => {
            console.error(`  ✗ [Check ${total}] FAILED: ${name}`);
            console.error('    Error:', err.message);
            throw err;
          });
      } else {
        passed++;
        console.log(`  ✓ [Check ${total}] ${name}`);
      }
    } catch (err: any) {
      console.error(`  ✗ [Check ${total}] FAILED: ${name}`);
      console.error('    Error:', err.message);
      throw err;
    }
  }

  // Reset adapters to clean seed state
  mockAdminAdapter.__resetToSeed();
  mockDisputeAdapter.__resetToSeed();

  const testAdmin = { id: 'admin-tester-01', name: 'Compliance Officer Sharma' };

  // 1. Platform Metrics
  await check('1. Platform metrics aggregates totals correctly', async () => {
    const metrics = await mockAdminAdapter.getPlatformMetrics();
    assert.ok(metrics.totalCustomers >= 1, 'Should count customers');
    assert.ok(metrics.totalProfessionals >= 4, 'Should count professionals');
    assert.ok(metrics.pendingVerifications >= 1, 'Should count pending verifications');
    assert.ok(metrics.openDisputes >= 1, 'Should count open disputes');
    assert.ok(metrics.simulatedRevenue > 0, 'Should calculate simulated revenue');
  });

  // 2. Verification Queue Seed
  await check('2. Verification queue returns seeded pending professionals', async () => {
    const queue = await mockAdminAdapter.getVerificationQueue();
    assert.ok(queue.length >= 4, 'Should have at least 4 verification records');
    const proIds = queue.map((r) => r.professionalId);
    assert.ok(proIds.includes('pro-ecocool'), 'Should include pro-ecocool');
    assert.ok(proIds.includes('pro-rapid-plumb'), 'Should include pro-rapid-plumb');
  });

  // 3. Queue Filter by Status
  await check('3. Verification queue filters by status PENDING_VERIFICATION', async () => {
    const pending = await mockAdminAdapter.getVerificationQueue({ status: 'PENDING_VERIFICATION' });
    assert.ok(pending.length >= 3, 'Should have pending records');
    pending.forEach((r) => assert.equal(r.status, 'PENDING_VERIFICATION'));
  });

  // 4. Queue Filter by Category
  await check('4. Verification queue filters by category', async () => {
    const hvac = await mockAdminAdapter.getVerificationQueue({ category: 'Home Appliances & HVAC' });
    assert.ok(hvac.length >= 1, 'Should find HVAC pros');
    hvac.forEach((r) => assert.equal(r.category, 'Home Appliances & HVAC'));
  });

  // 5. Queue Search Query
  await check('5. Verification queue searches by keyword', async () => {
    const results = await mockAdminAdapter.getVerificationQueue({ searchQuery: 'Deshmukh' });
    assert.equal(results.length, 1);
    assert.equal(results[0].professionalName, 'Vikram Deshmukh');
  });

  // 6. Inspect Candidate Dossier
  await check('6. Inspecting candidate pro-ecocool retrieves 3 verification documents', async () => {
    const record = await mockAdminAdapter.getVerificationRecord('pro-ecocool');
    assert.ok(record !== null, 'Record should exist');
    assert.equal(record?.documents.length, 3, 'Should have 3 documents');
    const docTypes = record?.documents.map((d) => d.type);
    assert.ok(docTypes?.includes('TRADE_LICENSE'));
    assert.ok(docTypes?.includes('TAX_GST'));
    assert.ok(docTypes?.includes('ID_PROOF'));
  });

  // 7. Approving Verification
  await check('7. Approving verification on pro-ecocool transitions status to VERIFIED', async () => {
    const updated = await mockAdminAdapter.approveVerification('pro-ecocool', testAdmin);
    assert.equal(updated.status, 'VERIFIED');
    assert.equal(updated.currentDecision?.action, 'APPROVE');
    assert.equal(updated.currentDecision?.adminName, testAdmin.name);
    // All documents should be marked verified
    updated.documents.forEach((d) => assert.equal(d.isVerified, true));
  });

  // 8. Approving verification records audit log entry
  await check('8. Approving verification creates APPROVE_VERIFICATION audit log entry', async () => {
    const logs = await mockAdminAdapter.getAuditLogs({
      entityType: 'PROFESSIONAL_VERIFICATION',
      action: 'APPROVE_VERIFICATION',
    });
    assert.ok(logs.length >= 1, 'Should log verification approval');
    const log = logs.find((l) => l.entityId === 'pro-ecocool');
    assert.ok(log !== undefined, 'Should find pro-ecocool audit entry');
    assert.equal(log?.newState, 'VERIFIED');
  });

  // 9. Approving already verified professional throws error
  await check('9. Approving already verified pro throws validation error', async () => {
    await assert.rejects(
      async () => {
        await mockAdminAdapter.approveVerification('pro-ecocool', testAdmin);
      },
      { message: /already verified/ }
    );
  });

  // 10. Rejecting with short reason throws error
  await check('10. Rejecting verification with <10 char reason throws error', async () => {
    await assert.rejects(
      async () => {
        await mockAdminAdapter.rejectVerification('pro-rapid-plumb', 'bad doc', testAdmin);
      },
      { message: /at least 10 characters/ }
    );
  });

  // 11. Rejecting verification transitions to REJECTED
  await check('11. Rejecting verification with valid reason transitions to REJECTED', async () => {
    const updated = await mockAdminAdapter.rejectVerification(
      'pro-rapid-plumb',
      'Trade license registration number is invalid and expired on 2022-04-10.',
      testAdmin
    );
    assert.equal(updated.status, 'REJECTED');
    assert.equal(updated.currentDecision?.action, 'REJECT');
    assert.ok(updated.currentDecision?.reason?.includes('expired'));
  });

  // 12. Requesting additional info with short note throws error
  await check('12. Requesting additional info with <10 chars throws error', async () => {
    await assert.rejects(
      async () => {
        await mockAdminAdapter.requestVerificationInfo('pro-apex-elec', 'scan pls', testAdmin);
      },
      { message: /at least 10 characters/ }
    );
  });

  // 13. Requesting additional info records inquiry notes
  await check('13. Requesting info records note in candidate history and audit log', async () => {
    const updated = await mockAdminAdapter.requestVerificationInfo(
      'pro-apex-elec',
      'Please submit an authorized copy of your Wireman Competency Certificate.',
      testAdmin
    );
    assert.ok(updated.history.length >= 1, 'Should append to decision history');
    const latest = updated.history[updated.history.length - 1];
    assert.equal(latest.action, 'REQUEST_INFORMATION');
    assert.ok(latest.reason?.includes('Wireman Competency'));
  });

  // 14. Dispute Center Seed
  await check('14. Dispute center returns seeded disputes (DISP-084, DISP-072, DISP-065)', async () => {
    const disputes = await mockDisputeAdapter.getDisputes();
    assert.ok(disputes.length >= 3, 'Should have at least 3 seed disputes');
    const ids = disputes.map((d) => d.id);
    assert.ok(ids.includes('DISP-084'));
    assert.ok(ids.includes('DISP-072'));
    assert.ok(ids.includes('DISP-065'));
  });

  // 15. Dispute Center Filter by Status
  await check('15. Dispute center filters by status OPEN', async () => {
    const openDisputes = await mockDisputeAdapter.getDisputes({ status: 'OPEN' });
    assert.ok(openDisputes.length >= 1, 'Should find open disputes');
    openDisputes.forEach((d) => assert.equal(d.status, 'OPEN'));
  });

  // 16. Dispute Center Filter by Priority
  await check('16. Dispute center filters by priority HIGH', async () => {
    const high = await mockDisputeAdapter.getDisputes({ priority: 'HIGH' });
    assert.ok(high.length >= 1, 'Should find high priority disputes');
    high.forEach((d) => assert.equal(d.priority, 'HIGH'));
  });

  // 17. Deep Case Query
  await check('17. Deep case query on DISP-084 retrieves complaint and pro response', async () => {
    const dispute = await mockDisputeAdapter.getDisputeById('DISP-084');
    assert.ok(dispute !== null, 'Should find DISP-084');
    assert.ok(dispute?.customerComplaint.toLowerCase().includes('capacitor'), 'Should have complaint text');
    assert.ok(dispute?.professionalResponse?.toLowerCase().includes('condenser coil'), 'Should have technical response');
    assert.equal(dispute?.disputedAmount, 1350);
  });

  // 18. Professional technical response update
  await check('18. Professional response can be updated and logged', async () => {
    const updated = await mockDisputeAdapter.recordProfessionalResponse(
      'DISP-072',
      'Contractor conducted full wire insulation resistance test and found zero earth leakage on the consumer side.',
      { id: 'pro-precision-elec', name: 'Precision Electricals' }
    );
    assert.ok(updated.professionalResponse?.includes('earth leakage'));
    assert.equal(updated.status, 'UNDER_REVIEW');
  });

  // 19. Submitting <10 char pro response throws error
  await check('19. Submitting short professional response throws error', async () => {
    await assert.rejects(
      async () => {
        await mockDisputeAdapter.recordProfessionalResponse(
          'DISP-072',
          'too short',
          { id: 'pro-precision-elec', name: 'Precision Electricals' }
        );
      },
      { message: /at least 10 characters/ }
    );
  });

  // 20. Adjudicating dispute with FULL_REFUND
  await check('20. Adjudicating dispute with FULL_REFUND sets RESOLVED and records ruling', async () => {
    const resolved = await mockDisputeAdapter.resolveDispute(
      {
        disputeId: 'DISP-084',
        decision: 'FULL_REFUND',
        explanation: 'Customer verified zero cooling performance improvement post-service. Contractor should have diagnosed choked condenser coil before invoicing capacitor replacement.',
        adminNotes: 'Settled via marketplace guarantee pool.',
      },
      testAdmin
    );
    assert.equal(resolved.status, 'RESOLVED');
    assert.equal(resolved.arbitrationDecision?.decision, 'FULL_REFUND');
    assert.equal(resolved.arbitrationDecision?.arbitratorName, testAdmin.name);
    assert.ok(resolved.arbitrationDecision?.explanation.includes('guarantee pool') === false);
  });

  // 21. Adjudicating already resolved dispute throws error
  await check('21. Adjudicating an already closed dispute throws duplicate resolution error', async () => {
    await assert.rejects(
      async () => {
        await mockDisputeAdapter.resolveDispute(
          {
            disputeId: 'DISP-084',
            decision: 'DISMISS',
            explanation: 'Trying to dismiss after refund.',
          },
          testAdmin
        );
      },
      { message: /already been arbitrated|Duplicate resolution/ }
    );
  });

  // 22. Adjudicating dispute with short explanation throws error
  await check('22. Adjudicating dispute with <10 char explanation throws error', async () => {
    await assert.rejects(
      async () => {
        await mockDisputeAdapter.resolveDispute(
          {
            disputeId: 'DISP-072',
            decision: 'DISMISS',
            explanation: 'denied',
          },
          testAdmin
        );
      },
      { message: /at least 10 characters/ }
    );
  });

  // 23. Adjudicating dispute with REDO_SERVICE
  await check('23. Adjudicating dispute with REDO_SERVICE sets RESOLVED', async () => {
    const resolved = await mockDisputeAdapter.resolveDispute(
      {
        disputeId: 'DISP-072',
        decision: 'REDO_SERVICE',
        explanation: 'Contractor is directed to perform complete inspection and re-align distribution board breakers within 48 hours without additional charges.',
      },
      testAdmin
    );
    assert.equal(resolved.status, 'RESOLVED');
    assert.equal(resolved.arbitrationDecision?.decision, 'REDO_SERVICE');
  });

  // 24. Category Management Seed
  await check('24. getCategories returns 6 seeded categories', async () => {
    const categories = await mockAdminAdapter.getCategories();
    assert.equal(categories.length, 6, 'Should have exactly 6 initial categories');
  });

  // 25. Duplicate Category Name Error
  await check('25. Creating duplicate category name throws error', async () => {
    await assert.rejects(
      async () => {
        await mockAdminAdapter.createCategory(
          {
            name: 'Home Appliances & HVAC',
            description: 'Duplicate HVAC category test.',
            tags: ['ac'],
            requiredSkills: ['ac repair'],
          },
          testAdmin
        );
      },
      { message: /already exists/ }
    );
  });

  // 26. Create Valid Category
  let createdCatId = '';
  await check('26. Creating valid category succeeds and appends to taxonomy', async () => {
    const created = await mockAdminAdapter.createCategory(
      {
        name: 'Solar & Renewable Energy',
        description: 'Rooftop solar photovoltaic installation, inverter testing, and battery storage maintenance.',
        tags: ['Solar Inverter Failure', 'Rooftop Panel Cleaning', 'Grid Tie Fault'],
        requiredSkills: ['Solar Inverter Diagnostics', 'Rooftop Panel Wiring', 'Battery Storage Safety'],
        status: 'ACTIVE',
      },
      testAdmin
    );
    assert.ok(created.id.startsWith('CAT-'));
    assert.equal(created.name, 'Solar & Renewable Energy');
    assert.equal(created.status, 'ACTIVE');
    createdCatId = created.id;

    const all = await mockAdminAdapter.getCategories();
    assert.equal(all.length, 7, 'Category count should increase to 7');
  });

  // 27. Update Category
  await check('27. Updating category modifies description and tags', async () => {
    const updated = await mockAdminAdapter.updateCategory(
      createdCatId,
      {
        description: 'Updated comprehensive solar energy systems maintenance and microgrid integration.',
      },
      testAdmin
    );
    assert.ok(updated.description.includes('microgrid integration'));
  });

  // 28. Toggle Category Status
  await check('28. Toggling category status switches between ACTIVE and INACTIVE', async () => {
    const toggled = await mockAdminAdapter.toggleCategoryStatus(createdCatId, testAdmin);
    assert.equal(toggled.status, 'INACTIVE');

    const toggledBack = await mockAdminAdapter.toggleCategoryStatus(createdCatId, testAdmin);
    assert.equal(toggledBack.status, 'ACTIVE');
  });

  // 29. Deleting Referenced Category Blocked
  await check('29. Deleting category with referenceCount > 0 is blocked safely', async () => {
    await assert.rejects(
      async () => {
        await mockAdminAdapter.deleteCategory('CAT-HVAC', testAdmin);
      },
      { message: /referenced by \d+ active/ }
    );
  });

  // 30. Deleting Unreferenced Category
  await check('30. Deleting category with referenceCount === 0 succeeds', async () => {
    const deleted = await mockAdminAdapter.deleteCategory(createdCatId, testAdmin);
    assert.equal(deleted, true);

    const categories = await mockAdminAdapter.getCategories();
    assert.equal(categories.length, 6, 'Count should return to 6');
    assert.ok(!categories.some((c) => c.id === createdCatId));
  });

  // 31. Audit Logs Retrieval & Filter
  await check('31. Audit logs query returns entries and filters by entityType and action', async () => {
    const allLogs = await mockAdminAdapter.getAuditLogs();
    assert.ok(allLogs.length >= 5, 'Should have multiple recorded audit actions');

    const disputeLogs = await mockAdminAdapter.getAuditLogs({ entityType: 'DISPUTE_ARBITRATION' });
    assert.ok(disputeLogs.length >= 1, 'Should find dispute arbitration logs');

    const categoryLogs = await mockAdminAdapter.getAuditLogs({ entityType: 'CATEGORY_MANAGEMENT' });
    assert.ok(categoryLogs.length >= 1, 'Should find category management logs');
  });

  console.log(`\n========================================`);
  console.log(`Phase 08 Regression Suite: ${passed}/${total} checks PASSED!`);
  console.log(`========================================\n`);
}

runPhase08Tests().catch((err) => {
  console.error('Fatal error in Phase 08 test runner:', err);
  process.exit(1);
});
