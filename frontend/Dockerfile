FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
RUN sed -i 's/listen       80;/listen       7860;/g' /etc/nginx/conf.d/default.conf && \
    sed -i '/listen.*\[::\]/d' /etc/nginx/conf.d/default.conf && \
    sed -i 's|index  index.html index.htm;|index index.html index.htm;\n        try_files $uri $uri/ /index.html;|g' /etc/nginx/conf.d/default.conf
EXPOSE 7860
CMD ["nginx", "-g", "daemon off;"]
