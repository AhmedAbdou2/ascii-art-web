package render

import (
	"fmt"
	"html/template"
	"log"
	"net/http"

	"z01.ascii-art-web/pkg/models"
)

var tc = make(map[string]*template.Template)

func RenderTemplate(w http.ResponseWriter, t string, data *models.TemplateData) {
	var tmpl *template.Template
	var err error

	_, inMap := tc[t]

	if !inMap {
		log.Println("reading template from disk:", t)
		err = CreateTemplateCache(t)
		if err != nil {
			log.Println("template cache error:", err)
			http.Error(w, "Template error", http.StatusInternalServerError)
			return
		}
	} else {
		log.Println("using cached template:", t)
	}

	tmpl = tc[t]

	err = tmpl.ExecuteTemplate(w, "base", data)
	if err != nil {
		log.Println("execute template error:", err)
		http.Error(w, "Render error", http.StatusInternalServerError)
		return
	}
}

func CreateTemplateCache(t string) error {
	templates := []string{
		fmt.Sprintf("templates/%s", t),
		"templates/base.layout.html",
	}
	tmpl, err := template.ParseFiles(templates...)
	if err != nil {
		return err
	}
	tc[t] = tmpl
	return nil
}
