build: clean
	npm run build

watch:
	npm run watch

clean: 
	find . -type d -name 'lib.cjs' -exec rm -rf {} +
	find . -type d -name 'lib.esm' -exec rm -rf {} +

build-docs:
	npm run docs
	