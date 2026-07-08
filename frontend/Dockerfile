FROM nginx:alpine
COPY dist/ /usr/share/nginx/html

# Write a basic NGINX config that listens on 7860 and handles React Router
RUN echo 'server { \
    listen 7860; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 7860
CMD ["nginx", "-g", "daemon off;"]
