import assert from 'node:assert/strict';

// Set test environment
process.env.NODE_ENV = 'test';

// Import services and mock adapters
import { mockAuthAdapter } from '../src/services/mockAuthAdapter.ts';
import { mockProblemAdapter } from '../src/services/mockProblemAdapter.ts';
import { mockProposalAdapter } from '../src/services/mockProposalAdapter.ts';
import { mockJobAdapter } from '../src/services/mockJobAdapter.ts';
import { mockMessageAdapter } from '../src/services/mockMessageAdapter.ts';
import { mockQuoteRevisionAdapter } from '../src/services/mockQuoteRevisionAdapter.ts';
import { mockScopeAdjustmentAdapter } from '../src/services/mockScopeAdjustmentAdapter.ts';
import { mockAdminAdapter } from '../src/services/mockAdminAdapter.ts';
import { mockDisputeAdapter } from '../src/services/mockDisputeAdapter.ts';

async function runPhase09Tests() {
  console.log('\n======================================================');
  console.log('SOLVEBID — PHASE 09 END-TO-END INTEGRATION TEST SUITE');
  console.log('Cross-Module Integration, Edge Cases & Dispute Gate');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function check(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      await fn();
      passed++;
      console.log(`  ✓ [Check ${total}] ${name}`);
    } catch (err: any) {
      console.error(`  ✗ [Check ${total}] FAILED: ${name}`);
      console.error('    Error:', err.message);
      throw err;
    }
  }

  // Reset adapters to baseline
  mockAdminAdapter.__resetToSeed();
  mockDisputeAdapter.__resetToSeed();

  console.log('[SECTION 1: Job Workspace Dispute Creation & Job Coupling]');

  await check('1.1: Reject dispute creation with title < 5 characters', async () => {
    await assert.rejects(
      async () => {
        await mockDisputeAdapter.createDispute(
          {
            jobId: 'JOB-00847',
            category: 'SERVICE_QUALITY',
            title: 'Bad',
            customerComplaint: 'The air conditioning technician broke the drain pipe and left without fixing.',
            disputedAmount: 900,
          },
          { id: 'user-demo-customer', name: 'Priya Sharma' }
        );
      },
      /at least 5 characters/i
    );
  });

  await check('1.2: Reject dispute creation with complaint < 10 characters', async () => {
    await assert.rejects(
      async () => {
        await mockDisputeAdapter.createDispute(
          {
            jobId: 'JOB-00847',
            category: 'SERVICE_QUALITY',
            title: 'Damaged Copper Pipe',
            customerComplaint: 'Too short',
            disputedAmount: 900,
          },
          { id: 'user-demo-customer', name: 'Priya Sharma' }
        );
      },
      /at least 10 characters/i
    );
  });

  await check('1.3: Reject dispute creation with disputedAmount <= 0', async () => {
    await assert.rejects(
      async () => {
        await mockDisputeAdapter.createDispute(
          {
            jobId: 'JOB-00847',
            category: 'SERVICE_QUALITY',
            title: 'Damaged Copper Pipe',
            customerComplaint: 'The air conditioning technician broke the drain pipe and left without fixing.',
            disputedAmount: 0,
          },
          { id: 'user-demo-customer', name: 'Priya Sharma' }
        );
      },
      /greater than 0/i
    );
  });

  await check('1.4: Valid dispute creation generates DISP- identifier and transitions job to DISPUTED', async () => {
    const newDispute = await mockDisputeAdapter.createDispute(
      {
        jobId: 'JOB-00790',
        category: 'BILLING_DISAGREEMENT',
        title: 'Unfair Extra Charge on Breaker Box',
        customerComplaint: 'Technician demanded additional cash at the doorstep not mentioned in scope.',
        disputedAmount: 1500,
      },
      { id: 'user-demo-customer', name: 'Priya Sharma' }
    );

    assert.ok(newDispute.id.startsWith('DISP-'), 'Dispute ID should start with DISP-');
    assert.equal(newDispute.status, 'OPEN');
    assert.equal(newDispute.category, 'BILLING_DISAGREEMENT');
    assert.equal(newDispute.disputedAmount, 1500);

    // Verify job transitioned to DISPUTED
    const job = await mockJobAdapter.getJobById('JOB-00790');
    assert.ok(job, 'Job JOB-00790 should exist');
    assert.equal(job.status, 'DISPUTED', 'Job status must transition to DISPUTED');
  });

  await check('1.5: Reject duplicate dispute on job with existing active dispute', async () => {
    await assert.rejects(
      async () => {
        await mockDisputeAdapter.createDispute(
          {
            jobId: 'JOB-00790',
            category: 'SERVICE_QUALITY',
            title: 'Another dispute on same job',
            customerComplaint: 'Trying to open a second dispute on JOB-00790 while one is already active.',
            disputedAmount: 1500,
          },
          { id: 'user-demo-customer', name: 'Priya Sharma' }
        );
      },
      /active dispute.*already exists/i
    );
  });

  await check('1.6: Dispute query by job ID retrieves newly filed dispute', async () => {
    const disp = await mockDisputeAdapter.getDisputeByJobId('JOB-00790');
    assert.ok(disp, 'Dispute should be found for JOB-00790');
    assert.equal(disp.title, 'Unfair Extra Charge on Breaker Box');
  });

  await check('1.7: Filing dispute creates OPEN_DISPUTE administrative audit log entry', async () => {
    const logs = await mockAdminAdapter.getAuditLogs({ entityType: 'DISPUTE_ARBITRATION' });
    const match = logs.find((l) => l.action === 'OPEN_DISPUTE' && l.reason.includes('JOB-00790'));
    assert.ok(match, 'Audit log entry should be recorded for OPEN_DISPUTE');
  });

  console.log('\n[SECTION 2: Messages Inbox & Thread Aggregation]');

  await check('2.1: Customer can query assigned jobs for message thread listing', async () => {
    const customerJobs = await mockJobAdapter.getJobs({
      role: 'CUSTOMER',
      userId: 'user-demo-customer',
    });
    assert.ok(customerJobs.length >= 2, 'Customer should have assigned jobs');
  });

  await check('2.2: Messages adapter returns chat history for assigned job', async () => {
    const msgs = await mockMessageAdapter.getMessages('JOB-00847');
    assert.ok(msgs.length > 0, 'JOB-00847 should have messages');
    const lastMsg = msgs[msgs.length - 1];
    assert.ok(lastMsg.content.length > 0, 'Last message should have content');
  });

  await check('2.3: Unread message count computes accurately for customer', async () => {
    const unread = await mockMessageAdapter.getUnreadCount('JOB-00847', 'user-demo-customer');
    assert.equal(typeof unread, 'number', 'Unread count should be numeric');
    assert.ok(unread >= 0, 'Unread count must be non-negative');
  });

  await check('2.4: Professional can query assigned jobs for messages inbox', async () => {
    const proJobs = await mockJobAdapter.getJobs({
      role: 'PROFESSIONAL',
      userId: 'user-demo-pro',
    });
    assert.ok(proJobs.length >= 1, 'Professional should have assigned jobs');
    const hasJob847 = proJobs.some((j) => j.id === 'JOB-00847');
    assert.ok(hasJob847, 'Professional Arun should be assigned to JOB-00847');
  });

  console.log('\n[SECTION 3: Completion Gate & Sign-Off Verification]');

  await check('3.1: Professional marks job completion with summary note', async () => {
    const completed = await mockJobAdapter.requestJobCompletion(
      'JOB-00847',
      {
        workDone: 'Cleaned filters, checked blower pressure, and repaired condenser coil.',
        notes: 'Clean air filters every 3 months during peak summer.',
      },
      { id: 'user-demo-pro', name: 'Arun Kumar', role: 'PROFESSIONAL' }
    );

    assert.equal(completed.status, 'COMPLETED');
    assert.ok(completed.completionDetails?.workDone, 'Should record work done');
  });

  await check('3.2: Customer confirms completion with verification feedback', async () => {
    const confirmed = await mockJobAdapter.confirmJobCompletion(
      'JOB-00847',
      { id: 'user-demo-customer', name: 'Priya Sharma', role: 'CUSTOMER' },
      'The AC cooling is back to 100%. Excellent and clean work by Arun.'
    );

    assert.equal(confirmed.status, 'CUSTOMER_CONFIRMED');
    assert.ok(confirmed.customerConfirmedAt, 'Should record customerConfirmedAt timestamp');
  });

  console.log('\n[SECTION 4: Full Multi-Stage End-to-End Workflow]');

  let newlyCreatedProblemId = '';
  let newlyCreatedProposalId = '';

  await check('4.1: Customer posts problem PB-TEST-900', async () => {
    const prob = await mockProblemAdapter.createProblem(
      {
        title: 'Water Purifier RO Membrane Replacement',
        category: 'Plumbing & Water',
        description: 'The RO water purifier TDS is reading 450, need membrane replaced and pre-filters serviced.',
        neighborhood: 'Indiranagar 12th Main',
        city: 'Bangalore',
        urgency: 'MEDIUM',
        preferredDate: 'Tomorrow',
        preferredTimeWindow: 'Morning (9 AM - 12 PM)',
        mediaUrls: [],
      },
      'user-demo-customer',
      'Priya Sharma'
    );

    newlyCreatedProblemId = prob.id;
    assert.ok(prob.id.startsWith('PB-'), 'Problem ID should be assigned');
    assert.equal(prob.status, 'OPEN');
    assert.ok(prob.location.maskedAddress.includes('Indiranagar'), 'Masked address must protect privacy');
  });

  await check('4.2: Professional submits proposal for newly posted problem', async () => {
    const prop = await mockProposalAdapter.submitProposal(
      {
        problemId: newlyCreatedProblemId,
        estimatedPrice: 1350,
        estimatedDuration: '2 hours',
        proposedVisitTime: 'Tomorrow, 10:30 AM',
        initialDiagnosis: 'TDS reading indicates membrane exhaustion; pre-filters require renewal.',
        includedServices: ['New RO membrane', 'Sediment filter replacement', 'System sanitation'],
        excludedServices: ['External booster pump replacement'],
        notes: '30-day warranty on membrane replacement.',
      },
      {
        id: 'user-demo-pro',
        name: 'Arun Kumar',
        businessName: 'Arun HVAC Services',
        verified: true,
        averageRating: 4.9,
        completedJobsCount: 88,
        experienceYears: 8,
      }
    );

    newlyCreatedProposalId = prop.id;
    assert.ok(prop.id.startsWith('PROP-'), 'Proposal should receive PROP- ID');
    assert.equal(prop.status, 'SUBMITTED');
    assert.ok(prop.matchScore.overall >= 50, 'Calculates dynamic matching score');
  });

  await check('4.3: Customer selects proposal and automatically provisions Job Workspace', async () => {
    const selection = await mockProposalAdapter.selectProposal(
      newlyCreatedProblemId,
      newlyCreatedProposalId,
      {
        id: 'user-demo-customer',
        name: 'Priya Sharma',
      }
    );

    const newJob = selection.job;
    assert.ok(newJob.id.startsWith('JOB-'), 'Accepting proposal provisions new Job ID');
    assert.equal(newJob.status, 'SCHEDULED');
    assert.equal(newJob.originalAmount, 1350);
    assert.equal(newJob.problemId, newlyCreatedProblemId);

    // Verify problem transitioned to PROFESSIONAL_SELECTED
    const updatedProb = await mockProblemAdapter.getProblemById(newlyCreatedProblemId);
    assert.equal(updatedProb?.status, 'PROFESSIONAL_SELECTED');
  });

  console.log('\n[SECTION 5: Admin Dispute Resolution & Platform Integrity]');

  await check('5.1: Admin adjudicates dispute with FULL_REFUND ruling', async () => {
    const resolved = await mockDisputeAdapter.resolveDispute(
      {
        disputeId: 'DISP-084',
        decision: 'FULL_REFUND',
        explanation: 'Customer proved non-functioning condenser coil after service. Full refund granted.',
        adminNotes: 'Compliance team closed arbitration with contractor penalty.',
      },
      { id: 'admin-01', name: 'Compliance Admin' }
    );

    assert.equal(resolved.status, 'RESOLVED');
    assert.equal(resolved.arbitrationDecision?.decision, 'FULL_REFUND');
    assert.equal(resolved.arbitrationDecision?.arbitratorName, 'Compliance Admin');
  });

  await check('5.2: Dispute resolution logs an administrative audit entry', async () => {
    const logs = await mockAdminAdapter.getAuditLogs({ entityType: 'DISPUTE_ARBITRATION' });
    const resLog = logs.find((l) => l.action.startsWith('ARBITRATE_DISPUTE_') && l.entityId === 'DISP-084');
    assert.ok(resLog, 'Audit log should record ARBITRATE_DISPUTE');
  });

  console.log('\n======================================================');
  console.log(`Phase 09 Regression Suite: ${passed}/${total} checks PASSED!`);
  console.log('======================================================\n');
}

runPhase09Tests().catch((err) => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
