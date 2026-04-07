package handlers

import (
	"log"
	"net/http"
	"strings"

	"z01.ascii-art-web/pkg/ascii/banner"
	"z01.ascii-art-web/pkg/ascii/generator"
	"z01.ascii-art-web/pkg/ascii/input"
	"z01.ascii-art-web/pkg/models"
	"z01.ascii-art-web/pkg/render"
)

type Handlers struct {
	HomeTemplate      string
	AsciiArtTemplate  string
	ContactTemplate   string
	GeneratorTemplate string
	AboutTemplate     string
}

func NewHandlers() *Handlers {
	return &Handlers{
		HomeTemplate:      "./templates/home.page.html",
		AsciiArtTemplate:  "./templates/ascii.page.html",
		ContactTemplate:   "./templates/contact.page.html",
		GeneratorTemplate: "./templates/generator.page.html",
		AboutTemplate:     "./templates/about.page.html",
	}
}

func (H *Handlers) Home(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		render.RenderError(w, http.StatusNotFound, "404.page.html")
		return
	}

	if r.Method != http.MethodGet {
		render.RenderError(w, http.StatusMethodNotAllowed, "405.page.html")
		return
	}

	render.RenderTemplate(w, H.HomeTemplate, &models.TemplateData{})
}

func (H *Handlers) About(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/about" {
		render.RenderError(w, http.StatusNotFound, "404.page.html")
		return
	}

	if r.Method != http.MethodGet {
		render.RenderError(w, http.StatusMethodNotAllowed, "405.page.html")
		return
	}

	render.RenderTemplate(w, H.AboutTemplate, &models.TemplateData{})
}

func (H *Handlers) Contact(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/contact" {
		render.RenderError(w, http.StatusNotFound, "404.page.html")
		return
	}

	if r.Method != http.MethodGet {
		render.RenderError(w, http.StatusMethodNotAllowed, "405.page.html")
		return
	}

	render.RenderTemplate(w, H.ContactTemplate, &models.TemplateData{})
}

func (H *Handlers) Generator(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/generator" {
		render.RenderError(w, http.StatusNotFound, "404.page.html")
		return
	}

	if r.Method != http.MethodGet {
		render.RenderError(w, http.StatusMethodNotAllowed, "405.page.html")
		return
	}

	render.RenderTemplate(w, H.GeneratorTemplate, &models.TemplateData{
		Banner: "standard",
	})
}

func (H *Handlers) AsciiArt(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/ascii-art" {
		render.RenderError(w, http.StatusNotFound, "404.page.html")
		return
	}

	if r.Method != http.MethodPost {
		render.RenderError(w, http.StatusMethodNotAllowed, "405.page.html")
		return
	}

	if err := r.ParseForm(); err != nil {
		render.RenderError(w, http.StatusBadRequest, "400.page.html")
		return
	}

	text := r.FormValue("text")
	bannerName := strings.TrimSpace(r.FormValue("banner"))

	if strings.TrimSpace(text) == "" {
		w.WriteHeader(http.StatusBadRequest)
		render.RenderTemplate(w, H.GeneratorTemplate, &models.TemplateData{
			UserInput: text,
			Banner:    "standard",
			Error:     "Text cannot be empty 400 Bad Request",
		})
		return
	}

	if !isPrintable(text) {
		render.RenderError(w, http.StatusBadRequest, "400.page.html")
		return
	}

	validBanners := map[string]bool{
		"standard":   true,
		"shadow":     true,
		"thinkertoy": true,
	}

	if !validBanners[bannerName] {
		render.RenderError(w, http.StatusNotFound, "404.page.html")
		return
	}

	lines := input.HandleInput(text)

	bannerContent, err := banner.ReadBannerFile(bannerName)
	if err != nil {
		log.Println("read banner error:", err)
		render.RenderError(w, http.StatusNotFound, "404.page.html")
		return
	}

	asciiBanner := banner.ParseBanner(bannerContent)
	result := generator.Generate(lines, asciiBanner)

	if result == "" && text != "" {
		render.RenderError(w, http.StatusInternalServerError, "500.page.html")
		return
	}

	log.Println(result)

	data := &models.TemplateData{
		UserInput: text,
		Banner:    bannerName,
		AsciiArt:  result,
	}

	render.RenderTemplate(w, H.GeneratorTemplate, data)
}

func isPrintable(text string) bool {
	for _, r := range text {
		if r == '\n' || r == '\r' {
			continue
		}
		if r < 32 || r > 126 {
			return false
		}
	}
	return true
}
