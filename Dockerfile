FROM docker

ENV APP_DIR /app
WORKDIR /var/www/html

COPY  /dist/ /var/www/html
COPY health.json /var/www/html/health.json
COPY /startup.sh ${APP_DIR}/bin
COPY /httpd.conf_* /app
RUN chmod 755 ${APP_DIR}/bin/startup.sh \
         && chmod -R 755 /var/www/html
CMD /bin/sh -c ${APP_DIR}/bin/sh
