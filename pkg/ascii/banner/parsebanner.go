package banner

import (
	"strings"
)

func ParseBanner(content string) map[rune][]string {
	content = strings.ReplaceAll(content, "\r", "")
	lines := strings.Split(strings.TrimRight(content, "\n"), "\n")
	asciiBanner := make(map[rune][]string)
	asciiCode := 32

	for i := 0; i+8 <= len(lines) && asciiCode <= 126; i += 9 {
		asciiBanner[rune(asciiCode)] = lines[i : i+8]
		asciiCode++
	}
	return asciiBanner
}
