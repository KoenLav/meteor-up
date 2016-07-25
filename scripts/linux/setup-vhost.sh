#!/bin/bash
cd <%= appRemoteTargetPath %>

perl -pi -e s{appSiteUrl}{<%= appSiteUrl %>}g vhost.conf
perl -pi -e s{appName}{<%= appName %>}g vhost.conf
perl -pi -e s{appPort}{<%= appPort %>}g vhost.conf
perl -pi -e s{appDest}{<%= appDest %>}g vhost.conf

sudo mv vhost.conf /etc/nginx/conf.d/<%= appName %>.conf
sudo chown root:root /etc/nginx/conf.d/<%= appName %>.conf

sudo systemctl restart nginx