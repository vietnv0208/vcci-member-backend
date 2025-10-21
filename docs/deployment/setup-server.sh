sudo apt update && sudo apt upgrade -y
sudo apt install nginx -y
systemctl status nginx

# ssl
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d vcci.twendeesoft.com
sudo systemctl enable certbot.timer



#Setup docker and docker-compose [reference]

# create posgresql by docker compose file
posgresql/docker-compose.yml  /home/ubuntu/docker-compose/postgresql/docker-compose.yml
cd /home/ubuntu/docker-compose/postgresql/
docker compose up -d


# copy be-dev.yml to /home/ubuntu/docker-compose/twd-erp
be-dev.yml  /home/ubuntu/docker-compose/twd-erp/docker-compose.yml
# copy .env to /home/ubuntu/docker-compose/twd-erp and change the variables as needed
.env.stg  /home/ubuntu/docker-compose/twd-erp/.env
cd /home/ubuntu/docker-compose/twd-erp/
docker compose -f  up -d

# copy nginx config to /etc/nginx/sites-available/twd-erp and create a symlink to sites-enabled
# add to sites-available/default the following lines inside the server block

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api-docs {
        proxy_pass http://localhost:3000/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

# restart nginx
sudo nginx -t
sudo systemctl reload nginx


