#!/usr/bin/env bash

docker run -d -it -p 7997:7997 -p 8000-8020:8000-8020 \
         -v ~/data:/var/opt/MarkLogic \
         --name marklogic \
         -e INSTALL_CONVERTERS=true \
         -e MARKLOGIC_INIT=true \
         -e MARKLOGIC_ADMIN_USERNAME=admin \
         -e MARKLOGIC_ADMIN_PASSWORD=admin \
         -e MARKLOGIC_WALLET_PASSWORD=admin \
         progressofficial/marklogic-db:latest-11
