build: 
	@npm run build 

clean: 
	@npm run clean

prod:  build
	@node ./dist/index.js migrate --files-config /home/mttb/development/mttb/dev-tools/terraform-import-helper/files.config.json --project distribution --environment prod 

prodtest:  build
	@node ./dist/index.js migrate --files-config /home/mttb/development/mttb/dev-tools/terraform-import-helper/files.config.json --project distribution --environment prodtest

test:  build
	@node ./dist/index.js migrate --files-config /home/mttb/development/mttb/dev-tools/terraform-import-helper/files.config.json --project distribution --environment test 

