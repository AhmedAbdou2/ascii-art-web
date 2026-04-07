package render

import (
	"html/template"
	"log"
	"net/http"

	"z01.ascii-art-web/pkg/models"
)

var tc = make(map[string]*template.Template)

func RenderTemplate(w http.ResponseWriter, t string, data *models.TemplateData) {
	var err error

	_, inMap := tc[t]

	if !inMap {
		log.Println("reading template from disk:", t)

		err = CreateTemplateCache(t)
		if err != nil {
			log.Println("template cache error:", err)
			RenderError(w, http.StatusInternalServerError, "500.page.html")
			return
		}
	} else {
		log.Println("using cached template:", t)
	}

	// Get template from cache safely
	tmpl, ok := tc[t]
	if !ok {
		log.Println("template not found in cache:", t)
		RenderError(w, http.StatusInternalServerError, "500.page.html")
		return
	}

	err = tmpl.ExecuteTemplate(w, "base", data)
	if err != nil {
		log.Println("execute template error:", err)
		RenderError(w, http.StatusInternalServerError, "500.page.html")
		return
	}
}

func CreateTemplateCache(t string) error {
	templates := []string{
		t,
		"templates/base.layout.html",
	}

	tmpl, err := template.ParseFiles(templates...)
	if err != nil {
		return err
	}

	tc[t] = tmpl
	return nil
}

func RenderError(w http.ResponseWriter, status int, page string) {
	w.WriteHeader(status)

	tmpl, err := template.ParseFiles(
		"templates/"+page,
		"templates/base.layout.html",
	)
	if err != nil {
		http.Error(w, "Critical server error", http.StatusInternalServerError)
		return
	}

	err = tmpl.ExecuteTemplate(w, "base", nil)
	if err != nil {
		http.Error(w, "Critical server error", http.StatusInternalServerError)
		return
	}
}
