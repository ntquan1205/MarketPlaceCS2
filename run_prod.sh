
if [ ! -f .env.prod ]; then
    echo "Error: .env.prod file not found!"
    echo "Please create .env.prod from .env.prod.example"
    exit 1
fi
 окружения
set -a
source .env.prod
set +a

if [ -z "$SECRET_KEY" ]; then
    echo "Error: SECRET_KEY is not set in .env.prod"
    exit 1
fi

docker-compose -f docker-compose.prod.yml down

docker-compose -f docker-compose.prod.yml up --build -d

docker-compose -f docker-compose.prod.yml logs -f