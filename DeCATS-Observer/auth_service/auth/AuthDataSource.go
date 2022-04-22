package auth

import (
	"eurus-backend/config_service/conf_api"
	"eurus-backend/foundation/database"
)

type AuthDataSource struct {
	DB          *database.Database
	ServiceInfo map[int64]conf_api.AuthService
}
