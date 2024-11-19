import { BatteryWarning, HandCoins, MapPinned, PlugZap } from 'lucide-react';
import { ComponentType, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { MultiSelect } from './components/ui/multiselect';
import { euroCountries } from './lib/euro_countries';

type Restriction = 'monthly_charging_budget' | 'kwh_price_cap' | 'country_restriction' | 'fast_charging';

const restrictionsOptionsInit: { value: Restriction; label: string; icon?: ComponentType<{ className?: string }> }[] = [
	{ value: 'monthly_charging_budget', label: 'Monthly charging budget', icon: HandCoins },
	{ value: 'kwh_price_cap', label: 'Price cap on kwh', icon: BatteryWarning },
	{ value: 'country_restriction', label: 'Country restriction', icon: MapPinned },
	{ value: 'fast_charging', label: 'Block fast charging', icon: PlugZap },
];

export type SalesWizardFormInput = {
	carCount: number;
	leasingContractYearlyMileageAllowed: number;
	restrictions: Restriction[];
	countryRestrictions: (typeof euroCountries)[number][];
	monthlyChargingBudget?: number;
	kwhPriceCap?: number;
};

function App() {
	const { register, control, watch, setValue, handleSubmit } = useForm<SalesWizardFormInput>({
		defaultValues: { restrictions: [], countryRestrictions: [] },
	});
	const [restrictionOpts, setRestrictionOpts] = useState(restrictionsOptionsInit);

	const watchRestrictions = watch('restrictions');

	const handleRestrictionChange = (newRestrictions: Restriction[]) => {
		const hasMonthlyBudget = newRestrictions.includes('monthly_charging_budget');
		const hasPriceCap = newRestrictions.includes('kwh_price_cap');
		if (hasMonthlyBudget) {
			setRestrictionOpts(
				restrictionsOptionsInit.map(r => {
					if (r.value === 'kwh_price_cap') return { ...r, disabled: true };
					return r;
				})
			);
		} else if (hasPriceCap) {
			setRestrictionOpts(
				restrictionsOptionsInit.map(r => {
					if (r.value === 'monthly_charging_budget') return { ...r, disabled: true };
					return r;
				})
			);
		} else {
			setRestrictionOpts(restrictionsOptionsInit);
		}

		setValue('restrictions', newRestrictions);
	};

	const hasMonthlyBudget = watchRestrictions.includes('monthly_charging_budget');
	const hasPriceCap = watchRestrictions.includes('kwh_price_cap');

	const onSubmit: SubmitHandler<SalesWizardFormInput> = values => {
		const savings = computeSavings(values);
		console.log('total savings', savings.totalSavings);
	};

	return (
		<main className="bg-chargePurple text-text font-sora">
			<div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
				<div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
					<h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Fleet Configuration</h1>

					<form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
						<div className="space-y-4">
							<Input
								type="number"
								placeholder="What is the number of cars in your fleet?"
								className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
								{...register('carCount', {
									valueAsNumber: true,
									required: { value: true, message: 'This field is required' },
								})}
							/>

							<Input
								type="number"
								placeholder="What is the number of allowed yearly mileage in your leasing contracts?"
								className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
								{...register('leasingContractYearlyMileageAllowed', {
									valueAsNumber: true,
									required: { value: true, message: 'This field is required' },
								})}
							/>

							<Controller
								name="restrictions"
								control={control}
								rules={{ required: true }}
								render={() => (
									<MultiSelect
										options={restrictionOpts}
										onValueChange={values => handleRestrictionChange(values as Restriction[])}
										value={watchRestrictions}
										placeholder="What are the restrictions you want to put in place in your car policy?"
										className="bg-white/20 border-white/30"
									/>
								)}
							/>
						</div>

						{hasMonthlyBudget && (
							<div className="animate-fadeIn">
								<Input
									type="number"
									placeholder="What's the monthly charging budget? (in €)"
									className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
									{...register('monthlyChargingBudget', {
										valueAsNumber: true,
										required: { value: true, message: 'This field is required' },
									})}
								/>
							</div>
						)}

						{hasPriceCap && (
							<div className="animate-fadeIn">
								<Input
									type="number"
									placeholder="What's the price cap on kWh? (in €)"
									className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
									{...register('kwhPriceCap', {
										valueAsNumber: true,
										validate: val => !hasPriceCap || !!val,
									})}
								/>
							</div>
						)}

						{watchRestrictions.includes('country_restriction') && (
							<div className="animate-fadeIn rounded-lg bg-white/5 p-4">
								<p className="text-white mb-3">Which countries are allowed?</p>
								{/* Add a multi-select component for European countries here */}
							</div>
						)}

						{watchRestrictions.includes('fast_charging') && (
							<div className="animate-fadeIn rounded-lg bg-white/5 p-4 text-white">
								Fast charging is blocked.
							</div>
						)}

						<Button
							type="submit"
							className="mt-4 w-full sm:w-auto bg-white text-chargePurple hover:bg-white/90 transition-colors"
						>
							Calculate Savings
						</Button>
					</form>
				</div>
			</div>
		</main>
	);
}

const computeSavings = (values: SalesWizardFormInput) => {
	console.log(values);
	const hasMonthlyBudget = values.restrictions.includes('monthly_charging_budget');
	const hasPriceCap = values.restrictions.includes('kwh_price_cap');
	const hasFastChargingRestriction = values.restrictions.includes('fast_charging');

	let totalFleetSavingsByBudget = 0;
	let totalFleetSavingsByPriceCap = 0;
	let savingsByCountryRestrictions = 0;
	let fleetSavingsByFastChargeBlocking = 0;

	// Determine "monthly charging budget" OR "price cap on kWh".
	// IF "monthly charging budget": ((mileage * 0,2 * 0,45 = cost/car/year) - (12 * monthly_budget = budgeted cost/car/year)) * car_count = total fleet savings by budget
	// IF "price cap on kWh": ((0,65 - kwh_price_cap) * mileage * 0,2 = savings by price cap/car/year) * car_count = total fleet savings by price cap
	if (hasMonthlyBudget && values.monthlyChargingBudget) {
		totalFleetSavingsByBudget =
			values.leasingContractYearlyMileageAllowed * 0.2 * 0.45 -
			12 * values.monthlyChargingBudget * values.carCount;
	}

	if (hasPriceCap && values.kwhPriceCap) {
		totalFleetSavingsByPriceCap =
			values.kwhPriceCap * 0.65 * values.leasingContractYearlyMileageAllowed * 0.2 * values.carCount;
	}

	// • Determine "country restrictions":
	// IF only Belgium: car_count * 0,1 * 2500 * 0,2 * 0,85 = total fleet savings by country restrictions
	// IF more countries: 0 = total fleet savings by country restrictions
	const restrictedToBelgiumOnly = values.countryRestrictions.length === 1 && values.countryRestrictions[0] === 'BE';
	const multipleCountries = values.countryRestrictions.length > 1;

	if (restrictedToBelgiumOnly) {
		savingsByCountryRestrictions = values.carCount * 0.1 * 2500 * 0.2 * 0.85;
	} else if (multipleCountries) {
		savingsByCountryRestrictions = 0;
	}

	// • Determine "block fast charging"
	// IF yes: mileage * 0,3 * 0,2 * 0,4 * car_count = total fleet savings by fastcharger blocking
	// Add up results + (car_count * 78 = fraud savings) = total fleet savings with Mbrella Charge
	if (hasFastChargingRestriction) {
		fleetSavingsByFastChargeBlocking =
			values.leasingContractYearlyMileageAllowed * 0.3 * 0.2 * 0.4 * values.carCount;
	}

	const totalSavings =
		totalFleetSavingsByBudget +
		totalFleetSavingsByPriceCap +
		savingsByCountryRestrictions +
		fleetSavingsByFastChargeBlocking +
		values.carCount * 78; // fraud savings

	return {
		totalSavings,
		totalFleetSavingsByBudget,
		totalFleetSavingsByPriceCap,
		savingsByCountryRestrictions,
		fleetSavingsByFastChargeBlocking,
	};
};

export default App;
