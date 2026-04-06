package banner

import (
	"z01.ascii-art-web/pkg/ascii/fileops"
)

func LoadBanner(path string) map[rune][]string {
	content := fileops.ReadFile(path)
	return ParseBanner(content)
}
