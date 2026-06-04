FROM httpd:2.4-alpine

# Copy the web application to Apache document root
COPY index.html /usr/local/apache2/htdocs/

# Expose port 80
EXPOSE 80

# Start Apache in the foreground
CMD ["httpd-foreground"]
