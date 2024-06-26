build: 
	@go build -o ./bin/terraform-import-helper ./main.go && chmod +x ./bin/terraform-import-helper

clean: 
	@rm -rf ./bin
