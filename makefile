start:
	docker-compose up --build -d
peak-logs:
	docker container logs -f --tail 100 rythm_api 
