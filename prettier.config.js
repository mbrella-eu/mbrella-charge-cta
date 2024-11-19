/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
	plugins: ['prettier-plugin-tailwindcss', 'prettier-plugin-organize-imports'],
	printWidth: 120,
	useTabs: true,
	tabWidth: 4,
	semi: true,
	trailingComma: 'es5',
	bracketSpacing: true,
	jsxBracketSameLine: false,
	arrowParens: 'avoid',
	endOfLine: 'lf',
	singleQuote: true,
};

export default config;
