import { describe, expect, it } from 'vitest';
import { calculate, DEFAULT_ASSUMPTIONS, sanitize, type Assumptions } from './business-model';

const base = (patch: Partial<Assumptions>): Assumptions => ({ ...structuredClone(DEFAULT_ASSUMPTIONS), ...patch });

describe('Business Model Studio calculations', () => {
	it('subscription: customers × conversion × price', () => {
		const r = calculate(base({ subscription: { enabled: true, potentialCustomers: 2000, conversionRate: 5, monthlyPrice: 8 } }));
		expect(r.payingCustomers).toBe(100);
		expect(r.subscriptionRevenue).toBe(800);
		expect(r.monthlyRevenue).toBe(800);
	});

	it('transaction: transactions × average value × fee %', () => {
		const r = calculate(base({ subscription: { ...DEFAULT_ASSUMPTIONS.subscription, enabled: false }, transaction: { enabled: true, monthlyTransactions: 1000, averageValue: 40, feePercent: 2.5 } }));
		expect(r.transactionRevenue).toBe(1000);
	});

	it('licensing: converts billing frequency to monthly', () => {
		const lic = (billing: 'monthly' | 'quarterly' | 'annual') =>
			calculate(base({ subscription: { ...DEFAULT_ASSUMPTIONS.subscription, enabled: false }, licensing: { enabled: true, organizations: 6, price: 1200, billing } })).licensingRevenue;
		expect(lic('annual')).toBe(600);
		expect(lic('quarterly')).toBe(2400);
		expect(lic('monthly')).toBe(7200);
	});

	it('combines enabled streams and computes costs and surplus', () => {
		const r = calculate({
			subscription: { enabled: true, potentialCustomers: 1000, conversionRate: 10, monthlyPrice: 5 }, // 100 × $5 = 500
			transaction: { enabled: true, monthlyTransactions: 200, averageValue: 50, feePercent: 3 }, // 300
			licensing: { enabled: true, organizations: 2, price: 600, billing: 'annual' }, // 100
			costs: { fixedMonthly: 400, variableCost: 1, variableBasis: 'customer', otherMonthly: 100 }, // 500 + 102
			notes: ''
		});
		expect(r.monthlyRevenue).toBe(900);
		expect(r.variableCosts).toBe(102);
		expect(r.monthlyCosts).toBe(602);
		expect(r.monthlySurplus).toBe(298);
	});

	it('break-even per model, rounded up, including per-unit cost', () => {
		const r = calculate(base({ subscription: { enabled: true, potentialCustomers: 0, conversionRate: 0, monthlyPrice: 10 }, costs: { fixedMonthly: 450, variableCost: 1, variableBasis: 'customer', otherMonthly: 0 } }));
		expect(r.breakEven.subscription).toEqual({ units: 50, label: 'paying subscribers' }); // 450 / (10 − 1)
		const t = calculate(base({ subscription: { ...DEFAULT_ASSUMPTIONS.subscription, enabled: false }, transaction: { enabled: true, monthlyTransactions: 0, averageValue: 20, feePercent: 5 }, costs: { fixedMonthly: 100, variableCost: 0.5, variableBasis: 'transaction', otherMonthly: 0 } }));
		expect(t.breakEven.transaction?.units).toBe(200); // 100 / (1 − 0.5)
	});

	it('reports when break-even is unreachable instead of a misleading number', () => {
		const r = calculate(base({ subscription: { enabled: true, potentialCustomers: 0, conversionRate: 0, monthlyPrice: 2 }, costs: { fixedMonthly: 100, variableCost: 3, variableBasis: 'customer', otherMonthly: 0 } }));
		expect(r.breakEven.subscription?.units).toBeNull();
		expect(r.monthlySurplus).toBe(-100);
	});

	it('ignores disabled streams', () => {
		const r = calculate(base({ subscription: { enabled: false, potentialCustomers: 1000, conversionRate: 50, monthlyPrice: 10 } }));
		expect(r.monthlyRevenue).toBe(0);
		expect(r.breakEven.subscription).toBeUndefined();
	});

	it('sanitize clamps bad input', () => {
		const a = sanitize({ subscription: { potentialCustomers: -5, conversionRate: 400, monthlyPrice: 'abc' }, licensing: { billing: 'weekly' }, notes: 42 });
		expect(a.subscription).toMatchObject({ potentialCustomers: 0, conversionRate: 100, monthlyPrice: 0, enabled: true });
		expect(a.licensing.billing).toBe('annual');
		expect(a.notes).toBe('');
	});
});
