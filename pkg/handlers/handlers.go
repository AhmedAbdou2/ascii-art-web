package handlers

import (
	"log"
	"net/http"
	"os"
	"strings"

	"z01.ascii-art-web/pkg/ascii/banner"
	"z01.ascii-art-web/pkg/ascii/generator"
	"z01.ascii-art-web/pkg/ascii/input"
	"z01.ascii-art-web/pkg/models"
	"z01.ascii-art-web/pkg/render"
)

type Handlers struct {
	home      string
	ascii     string
	contact   string
	generator string
	about     string
}

func (H *Handlers) AsciiArt(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/ascii-art" {
		w.WriteHeader(http.StatusNotFound)
		render.RenderTemplate(w, "404.page.html", &models.TemplateData{})
		return
	}

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		render.RenderTemplate(w, "405.page.html", &models.TemplateData{})
		return
	}

	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	text := r.FormValue("text")
	bannerName := strings.TrimSpace(r.FormValue("banner"))

	if text == "" {
		w.WriteHeader(http.StatusBadRequest)
		render.RenderTemplate(w, "generator.page.html", &models.TemplateData{
			UserInput: text,
			Banner:    "standard",
			Error:     "Text cannot be empty 400 Bad request",
		})
		return
	}
	// http.Error(w, "Text cannot be empty 400 Bad request", http.StatusBadRequest)
	validBanners := map[string]bool{
		"standard":   true,
		"shadow":     true,
		"thinkertoy": true,
	}
	if !validBanners[bannerName] {
		http.Error(w, "Invalid banner choice", http.StatusBadRequest)
		return
	}

	lines := input.HandleInput(text)
	bannerContent, err := banner.ReadBannerFile(bannerName)
	if err != nil {
		if os.IsNotExist(err) {
			w.WriteHeader(http.StatusInternalServerError)
			render.RenderTemplate(w, "500.page.html", &models.TemplateData{})
		}
		log.Println(err)
		return
	}

	asciiBanner := banner.ParseBanner(bannerContent)
	result := generator.Generate(lines, asciiBanner)

	if result == "" && text != "" {
		w.WriteHeader(http.StatusInternalServerError)
		render.RenderTemplate(w, "500.page.html", &models.TemplateData{})
		return
	}

	log.Println(result)
	data := &models.TemplateData{
		UserInput: text,
		Banner:    bannerName,
		AsciiArt:  result,
	}

	render.RenderTemplate(w, "generator.page.html", data)
}

func (H *Handlers) Home(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		w.WriteHeader(http.StatusNotFound)
		render.RenderTemplate(w, "404.page.html", &models.TemplateData{})
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		render.RenderTemplate(w, "405.page.html", &models.TemplateData{})
		return
	}

	render.RenderTemplate(w, "home.page.html", &models.TemplateData{})
}

func (H *Handlers) About(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/about" {
		w.WriteHeader(http.StatusNotFound)
		render.RenderTemplate(w, "404.page.html", &models.TemplateData{})
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		render.RenderTemplate(w, "405.page.html", &models.TemplateData{})
		return
	}

	render.RenderTemplate(w, "about.page.html", &models.TemplateData{})
}

func (H *Handlers) Contact(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/contact" {
		w.WriteHeader(http.StatusNotFound)
		render.RenderTemplate(w, "404.page.html", &models.TemplateData{})
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		render.RenderTemplate(w, "405.page.html", &models.TemplateData{})
		return
	}

	render.RenderTemplate(w, "contact.page.html", &models.TemplateData{})
}
func (H *Handlers) Generator(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/generator" {
		w.WriteHeader(http.StatusNotFound)
		render.RenderTemplate(w, "404.page.html", &models.TemplateData{})
		return
	}

	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		render.RenderTemplate(w, "405.page.html", &models.TemplateData{})
		return
	}

	render.RenderTemplate(w, "generator.page.html", &models.TemplateData{
		Banner: "standard",
	})
}
