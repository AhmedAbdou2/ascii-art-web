package generator

func Generate(textLines []string, asciiBanner map[rune][]string) string {
	var result string

	for _, textLine := range textLines {
		if textLine == "" {
			result += "\n"
			continue
		}

		for i := 0; i < 8; i++ {
			for _, ch := range textLine {
				if charArt, ok := asciiBanner[ch]; ok {
					result += charArt[i]
				} else {
					result += "        "
				}
			}
			result += "\n"
		}
	}

	return result
}
