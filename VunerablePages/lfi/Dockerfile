FROM php:8.1-apache

# Install required packages
RUN apt-get update && apt-get install -y \
    nano \
    vim \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite

# Create a test file that can be accessed via LFI
RUN echo "root:x:0:0:root:/root:/bin/bash" > /etc/passwd.backup && \
    echo "This is a secret file that should not be accessible!" > /var/www/secret.txt

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY ./www/ /var/www/html/

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# Configure Apache to show PHP errors (for vulnerability testing)
RUN echo "display_errors = On" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "display_startup_errors = On" >> /usr/local/etc/php/conf.d/custom.ini && \
    echo "error_reporting = E_ALL" >> /usr/local/etc/php/conf.d/custom.ini

# Create additional sensitive files for testing
RUN echo "admin:$apr1$secret$123456789" > /var/www/html/.htpasswd && \
    echo "<?php phpinfo(); ?>" > /var/www/html/info.php

EXPOSE 80

CMD ["apache2-foreground"]
