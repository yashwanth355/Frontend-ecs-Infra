#!/bin/sh


echo "################"
ENV=dev
echo $ENV

echo "################"
eval $(cp /app/httpd-$ENV.conf /etc/httpd/conf/httpd.conf)
echo "################"
echo "RUN SERVER"
httpd -DFOREGROUND
echo "################"
echo "######## HTTPD FG"
