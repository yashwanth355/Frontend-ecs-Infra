#!/bin/sh


echo “################”
echo $ENV
echo “################”
Eval $(cp /app/httpd.conf_$ENV /etc/httpd/conf/httpd.conf)
echo “################”
Echo “RUN SERVER”
Httpd -DFOREGROUND
echo “################”
Echo “######## HTTPD FG”
~
