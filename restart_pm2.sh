#!/bin/bash
# Reinicia todos los procesos de PM2 cada vez que se ejecuta
echo "$(date) - Reiniciando todos los procesos PM2..."
pm2 restart all
echo "$(date) - Procesos reiniciados."
