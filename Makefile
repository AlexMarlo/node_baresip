REPORTER = spec

test:
	./node_modules/mocha/bin/mocha \
	--reporter $(REPORTER) \
	--timeout 1000

 .PHONY: test