package fileops

import (
	"os"
	"log"
)

func ReadFile(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}
	return string(data)
}