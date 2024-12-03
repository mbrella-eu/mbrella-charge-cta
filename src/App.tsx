import { BatteryWarning, HandCoins, MapPinned, PlugZap } from 'lucide-react';
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
	returnOnInvesmentApprox: number;
	sparedWorkingDaysApprox: number;
	avoidedComplaintsApprox: number;
	fraudSavings: number;
};

type Language = 'nl-be' | 'fr-be' | 'en';

function App() {
	const {
		register,
		control,
		watch,
		setValue,
		formState: { errors },
	} = useForm<SalesWizardFormInput>({
		defaultValues: { restrictions: [], countryRestrictions: [] },
		mode: 'onChange',
	});
	const [restrictionOpts, setRestrictionOpts] = useState(getRestrictionsOptions('en'));
	const [savings, setSavings] = useState<SavingsResult | null>(null);
	const [language, setLanguage] = useState<Language>('en');
	const [isExpanded, setIsExpanded] = useState(false);

	useEffect(() => {
		return () => {
			setSavings(null);
			setIsExpanded(false);
		};
	}, []);

	useEffect(() => {
		try {
			const url = window.location.href.toLowerCase();
			const newLanguage = url.includes('nl-be') ? 'nl-be' : url.includes('fr-be') ? 'fr-be' : 'en';
			setLanguage(newLanguage);
		} catch (error) {
			console.error('Language detection failed:', error);
			setLanguage('en');
		}
	}, []);

	useEffect(() => {
		setRestrictionOpts(getRestrictionsOptions(language));
	}, [language]);

	const watchedValues = watch();

	useEffect(() => {
		if (watchedValues.carCount) setIsExpanded(true);
	}, [watchedValues.carCount]);

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
			setRestrictionOpts(restrictionOpts.map(r => ({ ...r, disabled: false })));
		}

		setValue('restrictions', newRestrictions);
	};

	const hasMonthlyBudget = watchRestrictions.includes('monthly_charging_budget');
	const hasPriceCap = watchRestrictions.includes('kwh_price_cap');

	return (
		<main className="charge sales widget" style={{ backgroundColor: '#2f243a' }} onClick={e => e.stopPropagation()}>
			<div className="text-text font-sora bg-chargePurple max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
				<div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden" role="button">
					<div className="p-6 flex justify-between items-center cursor-pointer">
						<h1 className="text-2xl sm:text-3xl font-bold text-white">{translations[language].title}</h1>
					</div>
					<div className="px-6 pb-6">
						<div className="space-y-2">
							<label className="text-white text-sm font-medium">
								{translations[language].carCountLabel}
							</label>
							<div className="space-y-1">
								<Input
									type="number"
									min="1"
									className={twMerge(
										'bg-white/20 border-white/30 placeholder:text-white/70 text-white',
										errors.carCount && 'border-red-500'
									)}
									{...register('carCount', {
										valueAsNumber: true,
										required: {
											value: true,
											message: translations[language].errors.required,
										},
										min: {
											value: 1,
											message: translations[language].errors.minCarCount,
										},
									})}
								/>
								{errors.carCount && (
									<p className="text-red-500 text-sm animate-fadeIn">{errors.carCount.message}</p>
								)}
							</div>
						</div>
					</div>
					{isExpanded && (
						<div className="flex flex-col lg:flex-row gap-6 p-6 pt-0">
							<div className="flex-1">
								<div className="flex flex-col gap-6">
									<div className="space-y-4">
										<div className="space-y-2">
											<label className="text-white text-sm font-medium">
												{translations[language].yearlyMileageLabel}
											</label>
											<div className="space-y-1">
												<Input
													type="number"
													min="1"
													className={twMerge(
														'bg-white/20 border-white/30 placeholder:text-white/70 text-white',
														errors.leasingContractYearlyMileageAllowed && 'border-red-500'
													)}
													{...register('leasingContractYearlyMileageAllowed', {
														valueAsNumber: true,
														required: {
															value: true,
															message: translations[language].errors.required,
														},
														min: {
															value: 1,
															message: translations[language].errors.minMileage,
														},
													})}
												/>
												{errors.leasingContractYearlyMileageAllowed && (
													<p className="text-red-500 text-sm animate-fadeIn">
														{errors.leasingContractYearlyMileageAllowed.message}
													</p>
												)}
											</div>
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
													required: {
														value: true,
														message: translations[language].errors.required,
													},
												})}
											/>
										</div>
									)}

									{hasPriceCap && (
										<div className="animate-fadeIn space-y-2">
											<label className="text-white text-sm font-medium">
												{translations[language].kwhPriceCapLabel}
											</label>
											<div className="space-y-1">
												<Input
													type="number"
													min="1"
													className={twMerge(
														'bg-white/20 border-white/30 placeholder:text-white/70 text-white',
														errors.kwhPriceCap && 'border-red-500'
													)}
													{...register('kwhPriceCap', {
														valueAsNumber: true,
														validate: val => !hasPriceCap || (!!val && val > 0),
														min: {
															value: 0.01,
															message: translations[language].errors.minPrice,
														},
														max: {
															value: 0.65,
															message: translations[language].errors.maxPriceCap,
														},
													})}
												/>
												{errors.kwhPriceCap && (
													<p className="text-red-500 text-sm animate-fadeIn">
														{errors.kwhPriceCap.message}
													</p>
												)}
											</div>
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
										<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border">
											<span className="text-white/80 font-bold">
												{translations[language].totalSavings}
											</span>
											<span className="text-white font-bold">
												€
												{savings.totalSavings.toLocaleString('en-EU', {
													maximumFractionDigits: 0,
												})}
											</span>
										</div>

										{savings.fraudSavings > 0 && (
											<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
												<span className="text-white/80">
													{translations[language].fraudSavings}
												</span>
												<span className="text-white">
													€
													{savings.fraudSavings.toLocaleString('en-EU', {
														maximumFractionDigits: 0,
													})}
												</span>
											</div>
										)}

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
										{savings.sparedWorkingDaysApprox > 0 && (
											<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-accent/80">
												<span className="text-white/80">
													{translations[language].sparedWorkingDays}
												</span>
												<span className="text-white">
													{savings.sparedWorkingDaysApprox.toLocaleString('en-EU', {
														maximumFractionDigits: 0,
													})}
												</span>
											</div>
										)}
										{savings.returnOnInvesmentApprox > 0 && (
											<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-accent/80">
												<span className="text-white/80">
													{translations[language].returnOnInvestment}
												</span>
												<span className="text-white">
													€
													{savings.returnOnInvesmentApprox.toLocaleString('en-EU', {
														maximumFractionDigits: 0,
													})}
												</span>
											</div>
										)}
										{savings.avoidedComplaintsApprox > 0 && (
											<div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-accent/80">
												<span className="text-white/80">
													{translations[language].avoidedComplaints}
												</span>
												<span className="text-white">
													{savings.avoidedComplaintsApprox.toLocaleString('en-EU', {
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
					<div className="p-6 flex justify-start text-sm text-gray-400">
						{translations[language].disclaimer}
					</div>
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
			Math.max(0, values.leasingContractYearlyMileageAllowed * 0.2 * 0.45 - 12 * values.monthlyChargingBudget) *
			values.carCount;
	}

	if (hasPriceCap && values.kwhPriceCap) {
		totalFleetSavingsByPriceCap =
			(0.65 - values.kwhPriceCap) * values.leasingContractYearlyMileageAllowed * 0.2 * values.carCount;
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

	const fraudSavings = values.carCount * 78;

	const totalSavings =
		totalFleetSavingsByBudget +
		totalFleetSavingsByPriceCap +
		savingsByCountryRestrictions +
		fleetSavingsByFastChargeBlocking +
		fraudSavings;

	// Assumption: Fleet manager spends 1 hour per car per year
	const sparedWorkingDaysApprox = values.carCount / 24;

	// 2. ROI: Depends on which plan they would take, but let's say the formula would be:[YEARLY SAVINGS] / [FLEET SIZE] * [Price per User] * 12
	// Maybe here we could go for the subscription price of 5 EUR/month?
	// --> ROI: OK
	const returnOnInvesmentApprox = totalSavings - 5 * 12 * values.carCount;

	// 3. Avoided complaints: that's definitely a guess, so if we say this is [YEARLY SAVINGS/160], we'd have a similar amount to theirs.
	// --> This should be in numbers, EDI has 50000 users/1000 tickets/day= 50*280 workdays
	const avoidedComplaintsApprox = totalSavings / 160;

	return {
		totalSavings,
		totalFleetSavingsByBudget,
		totalFleetSavingsByPriceCap,
		savingsByCountryRestrictions,
		fleetSavingsByFastChargeBlocking,
		fraudSavings,
		returnOnInvesmentApprox,
		sparedWorkingDaysApprox,
		avoidedComplaintsApprox,
	};
};

export default App;
