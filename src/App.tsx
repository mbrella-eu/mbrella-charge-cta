import { BatteryWarning, ChevronLeft, HandCoins, MapPinned, PlugZap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { Input } from './components/ui/input';
import { MultiSelect } from './components/ui/multiselect';
import { euroCountries } from './lib/euro_countries';
import { translations } from './lib/translations';

type Restriction = 'monthly_charging_budget' | 'kwh_price_cap' | 'country_restriction' | 'fast_charging';

const getRestrictionsOptions = (language: Language) => [
	{
		value: 'monthly_charging_budget',
		label: translations[language].restrictions.monthlyChargingBudget,
		icon: HandCoins,
	},
	{ value: 'kwh_price_cap', label: translations[language].restrictions.kwhPriceCap, icon: BatteryWarning },
	{ value: 'country_restriction', label: translations[language].restrictions.countryRestriction, icon: MapPinned },
	{ value: 'fast_charging', label: translations[language].restrictions.fastCharging, icon: PlugZap },
];

export type SalesWizardFormInput = {
	carCount: number;
	leasingContractYearlyMileageAllowed: number;
	restrictions: Restriction[];
	countryRestrictions: (typeof euroCountries)[number][];
	monthlyChargingBudget?: number;
	kwhPriceCap?: number;
};

type SavingsResult = {
	totalSavings: number;
	totalFleetSavingsByBudget: number;
	totalFleetSavingsByPriceCap: number;
	savingsByCountryRestrictions: number;
	fleetSavingsByFastChargeBlocking: number;
};

type Language = 'nl-be' | 'fr-be' | 'en';

function App() {
	const { register, control, watch, setValue } = useForm<SalesWizardFormInput>({
		defaultValues: { restrictions: [], countryRestrictions: [] },
		mode: 'onChange',
	});
	const [restrictionOpts, setRestrictionOpts] = useState(getRestrictionsOptions('en'));
	const [savings, setSavings] = useState<SavingsResult | null>(null);
	const [language, setLanguage] = useState<Language>('en');
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		const url = window.location.href.toLowerCase();
		if (url.includes('nl-be')) {
			setLanguage('nl-be');
		} else if (url.includes('fr-be')) {
			setLanguage('fr-be');
		} else {
			setLanguage('en');
		}
	}, []);

	useEffect(() => {
		setRestrictionOpts(getRestrictionsOptions(language));
	}, [language]);

	const watchedValues = watch();

	useEffect(() => {
		if (watchedValues.carCount && watchedValues.leasingContractYearlyMileageAllowed) {
			const savingsResult = computeSavings(watchedValues);
			setSavings(savingsResult);
		} else {
			setSavings(null);
		}
	}, [
		watchedValues.carCount,
		watchedValues.leasingContractYearlyMileageAllowed,
		watchedValues.restrictions,
		watchedValues.countryRestrictions,
		watchedValues.monthlyChargingBudget,
		watchedValues.kwhPriceCap,
	]);

	const watchRestrictions = watch('restrictions');

	const handleRestrictionChange = (newRestrictions: Restriction[]) => {
		const hasMonthlyBudget = newRestrictions.includes('monthly_charging_budget');
		const hasPriceCap = newRestrictions.includes('kwh_price_cap');
		if (hasMonthlyBudget) {
			setRestrictionOpts(
				restrictionOpts.map(r => {
					if (r.value === 'kwh_price_cap') return { ...r, disabled: true };
					return r;
				})
			);
		} else if (hasPriceCap) {
			setRestrictionOpts(
				restrictionOpts.map(r => {
					if (r.value === 'monthly_charging_budget') return { ...r, disabled: true };
					return r;
				})
			);
		} else {
			setRestrictionOpts(restrictionOpts);
		}

		setValue('restrictions', newRestrictions);
	};

	const hasMonthlyBudget = watchRestrictions.includes('monthly_charging_budget');
	const hasPriceCap = watchRestrictions.includes('kwh_price_cap');

	return (
		<main className="bg-chargePurple text-text font-sora">
			<div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
				<div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden" role="button">
					<div
						className="p-6 flex justify-between items-center cursor-pointer"
						onClick={() => setIsExpanded(!isExpanded)}
					>
						<h1 className="text-2xl sm:text-3xl font-bold text-white">{translations[language].title}</h1>
						<ChevronLeft
							className={twMerge('text-white w-6 h-6 transition-transform', isExpanded && '-rotate-90')}
						/>
					</div>

					{isExpanded && (
						<div className="flex flex-col lg:flex-row gap-6 p-6 pt-0">
							<div className="flex-1">
								<div className="flex flex-col gap-6">
									<div className="space-y-4">
										<div className="space-y-2">
											<label className="text-white text-sm font-medium">
												{translations[language].carCountLabel}
											</label>
											<Input
												type="number"
												className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
												{...register('carCount', {
													valueAsNumber: true,
													required: { value: true, message: 'This field is required' },
												})}
											/>
										</div>

										<div className="space-y-2">
											<label className="text-white text-sm font-medium">
												{translations[language].yearlyMileageLabel}
											</label>
											<Input
												type="number"
												className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
												{...register('leasingContractYearlyMileageAllowed', {
													valueAsNumber: true,
													required: { value: true, message: 'This field is required' },
												})}
											/>
										</div>

										<div className="space-y-2">
											<label className="text-white text-sm font-medium">
												{translations[language].restrictionsLabel}
											</label>
											<Controller
												name="restrictions"
												control={control}
												rules={{ required: true }}
												render={() => (
													<MultiSelect
														options={restrictionOpts}
														onValueChange={values =>
															handleRestrictionChange(values as Restriction[])
														}
														value={watchRestrictions}
														className="bg-white/20 border-white/30"
													/>
												)}
											/>
										</div>
									</div>

									{hasMonthlyBudget && (
										<div className="animate-fadeIn space-y-2">
											<label className="text-white text-sm font-medium">
												{translations[language].monthlyBudgetLabel}
											</label>
											<Input
												type="number"
												className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
												{...register('monthlyChargingBudget', {
													valueAsNumber: true,
													required: { value: true, message: 'This field is required' },
												})}
											/>
										</div>
									)}

									{hasPriceCap && (
										<div className="animate-fadeIn space-y-2">
											<label className="text-white text-sm font-medium">
												{translations[language].kwhPriceCapLabel}
											</label>
											<Input
												type="number"
												className="bg-white/20 border-white/30 placeholder:text-white/70 text-white"
												{...register('kwhPriceCap', {
													valueAsNumber: true,
													validate: val => !hasPriceCap || !!val,
												})}
											/>
										</div>
									)}

									{watchRestrictions.includes('country_restriction') && (
										<div className="animate-fadeIn space-y-2">
											<label className="text-white text-sm font-medium">
												{translations[language].allowedCountriesLabel}
											</label>
											<Controller
												name="countryRestrictions"
												control={control}
												render={() => (
													<MultiSelect
														options={euroCountries.map(country => ({
															value: country,
															label:
																new Intl.DisplayNames(['en'], { type: 'region' }).of(
																	country
																) || country,
														}))}
														onValueChange={values => {
															setValue(
																'countryRestrictions',
																values as SalesWizardFormInput['countryRestrictions']
															);
														}}
														value={watch('countryRestrictions')}
														className="bg-white/20 border-white/30"
													/>
												)}
											/>
										</div>
									)}

									{watchRestrictions.includes('fast_charging') && (
										<div className="animate-fadeIn rounded-lg bg-white/5 p-4 text-white">
											{translations[language].fastChargingBlocked}
										</div>
									)}
								</div>
							</div>

							{savings && (
								<div className="lg:w-[400px] bg-white/10 rounded-xl p-6 shadow-lg animate-fadeIn">
									<h2 className="text-xl font-bold mb-4 text-white">
										{translations[language].estimatedSavings}
									</h2>
									<div className="space-y-3">
										<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
											<span className="text-white/80">{translations[language].totalSavings}</span>
											<span className="text-white font-bold">
												€
												{savings.totalSavings.toLocaleString('en-EU', {
													maximumFractionDigits: 0,
												})}
											</span>
										</div>

										{savings.totalFleetSavingsByBudget > 0 && (
											<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
												<span className="text-white/80">
													{translations[language].budgetSavings}
												</span>
												<span className="text-white">
													€
													{savings.totalFleetSavingsByBudget.toLocaleString('en-EU', {
														maximumFractionDigits: 0,
													})}
												</span>
											</div>
										)}

										{savings.totalFleetSavingsByPriceCap > 0 && (
											<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
												<span className="text-white/80">
													{translations[language].pricecapSavings}
												</span>
												<span className="text-white">
													€
													{savings.totalFleetSavingsByPriceCap.toLocaleString('en-EU', {
														maximumFractionDigits: 0,
													})}
												</span>
											</div>
										)}

										{savings.savingsByCountryRestrictions > 0 && (
											<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
												<span className="text-white/80">
													{translations[language].countryRestrictionSavings}
												</span>
												<span className="text-white">
													€
													{savings.savingsByCountryRestrictions.toLocaleString('en-EU', {
														maximumFractionDigits: 0,
													})}
												</span>
											</div>
										)}

										{savings.fleetSavingsByFastChargeBlocking > 0 && (
											<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
												<span className="text-white/80">
													{translations[language].fastChargingSavings}
												</span>
												<span className="text-white">
													€
													{savings.fleetSavingsByFastChargeBlocking.toLocaleString('en-EU', {
														maximumFractionDigits: 0,
													})}
												</span>
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</main>
	);
}

const computeSavings = (values: SalesWizardFormInput) => {
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
