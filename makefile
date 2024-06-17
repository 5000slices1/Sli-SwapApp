

#This makefile is not ready yet

install-deps:

ifeq (, $(shell which curl))
	@echo No curl is installed, curl will be installed now.... 
	@sudo apt-get install curl -y
endif

ifeq (,$(shell which dfxvm))	
	@echo No dfx is installed, dfx will be installed now....
	curl -fsSL https://internetcomputer.org/install.sh -o install_dfx.sh
	chmod +x install_dfx.sh
	./install_dfx.sh
	rm install_dfx.sh
	@echo   
	@echo   
	@echo Please reopen terminal window and execute again 'make install-deps'
	@echo because terminal needs to be restarted after DFX was installed.
	@echo -> The error-message you can ignore.
	@exit 127
endif
	

	sudo apt install nodejs -y
	sudo apt install npm -y
	sudo npm i -g ic-mops


# So we have at least version 0.15.3 of dfx installed, because of Regions bugfix
	dfxvm update

	npm update
	npm i @dfinity/ledger-icp
	npm i @dfinity/agent @dfinity/candid @dfinity/principal @dfinity/utils @dfinity/nns-proto
	npm i artemis-web3-adapter @dfinity/identity @dfinity/identity-secp256k1 crypto-browserify
	npm i browserify-zlib @dfinity/auth-client
	npm install --save isomorphic-fetch