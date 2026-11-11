package database

import "database/sql"

func NewDB(dsn string) (*sql.DB, error) {
	db,err := sql.Open("sqlite",dsn)
	if err != nil {
		return nil,err
	}
	db.SetMaxOpenConns(1)

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, err
	}

	return db, nil
}