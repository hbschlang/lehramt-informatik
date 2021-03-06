texmf = $(HOME)/texmf
texmftex = $(texmf)/tex

all: install_config install_cli install_tex readme

git_submodule:
	git submodule update --init

install_config:
	.scripts/install-config.sh

install_cli:
	cd .scripts; npm install; npm run build

build: build_cli

build_cli:
	cd .scripts; npm run build

install_tex:
	.tex/install.sh

install_tex_dtx: install_tex
	i dtx

tex: install_tex_dtx

readme:
	.scripts/dist/main.js r

clean:
	.scripts/clean.sh

.PHONY: install_tex readme install_cli install_config clean
