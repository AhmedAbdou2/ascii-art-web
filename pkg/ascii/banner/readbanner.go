package banner

import (
	"os"
)

func ReadBannerFile(bannerName string) (string, error) {
	content, err := os.ReadFile("pkg/ascii/banners/" + bannerName + ".txt")
	if err != nil {
		return "", err
	}
	return string(content), nil
}
