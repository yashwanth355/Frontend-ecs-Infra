FROM centos/httpd
#ENV APP_DIR /app
WORKDIR /var/www/html
COPY /dist/ /var/www/html
COPY health.json /var/www/html/health.json
COPY /Startup.sh /bin
RUN chmod 755 /bin/Startup.sh \  
       && chmod -R 755 /var/www/html
CMD /bin/sh -c /bin/sh
