FROM centos/httpd

ENV APP_DIR /app
WORKDIR /var/www/html

COPY  /dist/ /var/www/html
COPY health.json /var/www/html/health.json
COPY /Startup.sh ${APP_DIR}/bin
COPY /Httpd.conf_* /app
RUN chmod 755 ${APP_DIR}/bin/Startup.sh \
         && chmod -R 755 /var/www/html
CMD /bin/sh -c ${APP_DIR}/bin/sh
