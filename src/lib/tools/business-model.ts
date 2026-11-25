// Business Model Studio calculations (PRD §9.1). Pure functions, unit-tested.
// Everything is a monthly estimate based on the team's own assumptions — never a forecast.

export type Billing = 'monthly' | 'quarterly' | 'annual';
export type VariableBasis = 'customer' | 'transaction';

export interface Assumptions {
	subscription: { enabled: boolean; potentialCustomers: number; conversionRate: number; monthlyPrice: number };
	transaction: { enabled: boolean; monthlyTransactions: number; averageValue: number; feePercent: number };
	licensing: { enabled: boolean; organizations: number; price: number; billing: Billing };
	costs: { fixedMonthly: number; variableCost: number; variableBasis: VariableBasis; otherMonthly: number };
	notes: string;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
	subscription: { enabled: true, potentialCustomers: 0, conversionRate: 0, monthlyPrice: 0 },
	transaction: { enabled: false, monthlyTransactions: 0, averageValue: 0, feePercent: 0 },
	licensing: { enabled: false, organizations: 0, price: 0, billing: 'annual' },
	costs: { fixedMonthly: 0, variableCost: 0, variableBasis: 'customer', otherMonthly: 0 },
	notes: ''
};

const MONTHS: Record<Billing, number> = { monthly: 1, quarterly: 3, annual: 12 };

/** Break-even for one revenue model on its own: units needed to cover fixed + other costs. */
export type BreakEven = { units: number; label: string } | { units: null; label: string; reason: string };

export interface Results {
	payingCustomers: number;
	subscriptionRevenue: number;
	transactionRevenue: number;
	licensingRevenue: number;
	monthlyRevenue: number;
	variableCosts: number;
	monthlyCosts: number;
	monthlySurplus: number;
	breakEven: { subscription?: BreakEven; transaction?: BreakEven; licensing?: BreakEven };
}

const n = (v: number) => (Number.isFinite(v) && v > 0 ? v : 0);
const round2 = (v: number) => Math.round(v * 100) / 100;

export function calculate(a: Assumptions): Results {
	const s = a.subscription;
	const t = a.transaction;
	const l = a.licensing;
	const c = a.costs;

	const payingCustomers = s.enabled ? Math.round(n(s.potentialCustomers) * (Math.min(n(s.conversionRate), 100) / 100)) : 0;
	const subscriptionRevenue = s.enabled ? payingCustomers * n(s.monthlyPrice) : 0;
	const transactionRevenue = t.enabled ? n(t.monthlyTransactions) * n(t.averageValue) * (Math.min(n(t.feePercent), 100) / 100) : 0;
	const licensingRevenue = l.enabled ? (n(l.organizations) * n(l.price)) / MONTHS[l.billing] : 0;
	const monthlyRevenue = subscriptionRevenue + transactionRevenue + licensingRevenue;

	// Variable cost applies per paying customer (subscribers + licensed organizations) or per transaction.
	const customers = payingCustomers + (l.enabled ? n(l.organizations) : 0);
	const units = c.variableBasis === 'customer' ? customers : t.enabled ? n(t.monthlyTransactions) : 0;
	const variableCosts = units * n(c.variableCost);
	const fixed = n(c.fixedMonthly) + n(c.otherMonthly);
	const monthlyCosts = fixed + variableCosts;

	const be = (perUnit: number, unitCost: number, label: string): BreakEven => {
		const margin = perUnit - unitCost;
		if (fixed === 0) return { units: 0, label };
		if (margin <= 0) return { units: null, label, reason: perUnit <= 0 ? 'Set a price to calculate break-even.' : 'Each unit costs more than it earns, so volume alone can’t break even.' };
		return { units: Math.ceil(fixed / margin), label };
	};
	const perCustomerCost = c.variableBasis === 'customer' ? n(c.variableCost) : 0;
	const perTxCost = c.variableBasis === 'transaction' ? n(c.variableCost) : 0;

	return {
		payingCustomers,
		subscriptionRevenue: round2(subscriptionRevenue),
		transactionRevenue: round2(transactionRevenue),
		licensingRevenue: round2(licensingRevenue),
		monthlyRevenue: round2(monthlyRevenue),
		variableCosts: round2(variableCosts),
		monthlyCosts: round2(monthlyCosts),
		monthlySurplus: round2(monthlyRevenue - monthlyCosts),
		breakEven: {
			...(s.enabled && { subscription: be(n(s.monthlyPrice), perCustomerCost, 'paying subscribers') }),
			...(t.enabled && { transaction: be(n(t.averageValue) * (Math.min(n(t.feePercent), 100) / 100), perTxCost, 'transactions / month') }),
			...(l.enabled && { licensing: be(n(l.price) / MONTHS[l.billing], perCustomerCost, 'paying organizations') })
		}
	};
}

/** Coerces untrusted input (saved JSON or a request body) into valid assumptions. */
export function sanitize(input: unknown): Assumptions {
	const src = (typeof input === 'object' && input) || {};
	const num = (v: unknown, max = 1e12) => {
		const x = typeof v === 'number' ? v : Number(v);
		return Number.isFinite(x) ? Math.min(Math.max(x, 0), max) : 0;
	};
	const obj = (k: string) => ((src as Record<string, unknown>)[k] ?? {}) as Record<string, unknown>;
	const s = obj('subscription');
	const t = obj('transaction');
	const l = obj('licensing');
	const c = obj('costs');
	return {
		subscription: { enabled: s.enabled !== false, potentialCustomers: num(s.potentialCustomers), conversionRate: num(s.conversionRate, 100), monthlyPrice: num(s.monthlyPrice) },
		transaction: { enabled: t.enabled === true, monthlyTransactions: num(t.monthlyTransactions), averageValue: num(t.averageValue), feePercent: num(t.feePercent, 100) },
		licensing: { enabled: l.enabled === true, organizations: num(l.organizations), price: num(l.price), billing: (['monthly', 'quarterly', 'annual'] as const).find((b) => b === l.billing) ?? 'annual' },
		costs: { fixedMonthly: num(c.fixedMonthly), variableCost: num(c.variableCost), variableBasis: c.variableBasis === 'transaction' ? 'transaction' : 'customer', otherMonthly: num(c.otherMonthly) },
		notes: typeof (src as Record<string, unknown>).notes === 'string' ? ((src as Record<string, unknown>).notes as string).slice(0, 5000) : ''
	};
}

export const money = (v: number) => v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: v % 1 === 0 ? 0 : 2 });
