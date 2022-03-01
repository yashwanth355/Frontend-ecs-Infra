#!/bin/sh


echo "################"
ENV=dev
echo $ENV

echo "################"
eval$(useradd -ms /bin/bash appuser)
eval $(mkdir -p /etc/httpd/conf/)
eval $(cp /app/httpd-${ENV}.conf /etc/httpd/conf/httpd.conf)
echo "################"
echo "RUN SERVER"
httpd -DFOREGROUND
echo "################"
echo "######## HTTPD FG"
