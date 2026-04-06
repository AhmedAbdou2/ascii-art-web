package input

import "strings"

func HandleInput(argument string) []string {
	argument = strings.ReplaceAll(argument, "\\n", "\n")
	return strings.Split(argument, "\n")
}

/*
"Hello\n\nWorld"

After ReplaceAll
Hello

World

After split

[]string{
	"Hello",
	"",
	"World",
}
*/
